// Full-mesh voice for a small table: every human in the room who joins voice
// opens one audio-only RTCPeerConnection to every other one. Fine for a
// four-player pod (each sends three audio streams). Signalling goes through
// the relay via voiceSignals.ts.
//
// Handshake: on joining, a player sends `join` to each room member. A member
// already in voice answers with `join` + `reply: true`, and both sides set up a
// connection. Exactly one side of a pair makes the offer (the lower username),
// so the two never offer at once.
import { onVoiceSignal, sendVoiceSignal, type VoiceSignalPayload } from "@/lib/voice/voiceSignals";

export type VoicePeerState = "connecting" | "connected" | "failed";

export interface VoiceMeshCallbacks {
  onPeerState: (username: string, state: VoicePeerState | null) => void;
  onPeerStream: (username: string, stream: MediaStream | null) => void;
}

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

/** `VITE_VOICE_ICE_SERVERS`: a JSON array of RTCIceServer, or a comma-separated url list. */
export function voiceIceServers(): RTCIceServer[] {
  const raw = import.meta.env.VITE_VOICE_ICE_SERVERS?.trim();
  if (!raw) return DEFAULT_ICE_SERVERS;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as RTCIceServer[];
  } catch {
    // Not JSON: treat as a url list.
  }
  return raw
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean)
    .map((urls) => ({ urls }));
}

interface Peer {
  pc: RTCPeerConnection;
  pendingIce: RTCIceCandidateInit[];
}

export class VoiceMesh {
  private readonly peers = new Map<string, Peer>();
  private members = new Set<string>();
  private readonly unsubscribe: () => void;
  private readonly me: string;
  private readonly stream: MediaStream;
  private readonly callbacks: VoiceMeshCallbacks;
  private readonly iceServers: RTCIceServer[];

  constructor(
    me: string,
    stream: MediaStream,
    callbacks: VoiceMeshCallbacks,
    iceServers: RTCIceServer[] = voiceIceServers(),
  ) {
    this.me = me;
    this.stream = stream;
    this.callbacks = callbacks;
    this.iceServers = iceServers;
    this.unsubscribe = onVoiceSignal((from, payload) => {
      void this.onSignal(from, payload).catch((err) =>
        console.warn(`[voice] signal from ${from} failed:`, err),
      );
    });
  }

  /** The room's human players changed: greet newcomers, hang up on leavers. */
  setMembers(usernames: string[]): void {
    const next = new Set(usernames.filter((name) => name !== this.me));
    for (const name of next) {
      if (!this.members.has(name)) sendVoiceSignal(name, { t: "join" });
    }
    for (const name of this.members) {
      if (!next.has(name)) this.closePeer(name);
    }
    this.members = next;
  }

  leave(): void {
    for (const name of this.members) sendVoiceSignal(name, { t: "leave" });
    for (const name of [...this.peers.keys()]) this.closePeer(name);
    this.members.clear();
    this.unsubscribe();
  }

  private isOfferer(peer: string): boolean {
    return this.me < peer;
  }

  private async onSignal(from: string, payload: VoiceSignalPayload): Promise<void> {
    if (!this.members.has(from)) return;
    switch (payload.t) {
      case "join":
        if (payload.reply === true) {
          if (!this.peers.has(from)) await this.connect(from);
        } else {
          // A fresh join (they may have reloaded): start over with them.
          this.closePeer(from);
          sendVoiceSignal(from, { t: "join", reply: true });
          await this.connect(from);
        }
        return;
      case "leave":
        this.closePeer(from);
        return;
      case "offer":
        if (typeof payload.sdp === "string") await this.onOffer(from, payload.sdp);
        return;
      case "answer":
        if (typeof payload.sdp === "string") await this.onAnswer(from, payload.sdp);
        return;
      case "ice":
        if (payload.candidate && typeof payload.candidate === "object") {
          await this.onIce(from, payload.candidate as RTCIceCandidateInit);
        }
        return;
    }
  }

  private ensurePeer(name: string): Peer {
    const existing = this.peers.get(name);
    if (existing) return existing;
    const pc = new RTCPeerConnection({ iceServers: this.iceServers });
    for (const track of this.stream.getAudioTracks()) pc.addTrack(track, this.stream);
    pc.onicecandidate = (event) => {
      if (event.candidate) sendVoiceSignal(name, { t: "ice", candidate: event.candidate.toJSON() });
    };
    pc.ontrack = (event) => {
      this.callbacks.onPeerStream(name, event.streams[0] ?? new MediaStream([event.track]));
    };
    pc.onconnectionstatechange = () => {
      if (this.peers.get(name)?.pc !== pc) return;
      if (pc.connectionState === "connected") this.callbacks.onPeerState(name, "connected");
      else if (pc.connectionState === "failed") this.callbacks.onPeerState(name, "failed");
    };
    const peer: Peer = { pc, pendingIce: [] };
    this.peers.set(name, peer);
    this.callbacks.onPeerState(name, "connecting");
    return peer;
  }

  private async connect(name: string): Promise<void> {
    const { pc } = this.ensurePeer(name);
    if (!this.isOfferer(name)) return;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendVoiceSignal(name, { t: "offer", sdp: offer.sdp ?? "" });
  }

  private async onOffer(name: string, sdp: string): Promise<void> {
    const peer = this.ensurePeer(name);
    await peer.pc.setRemoteDescription({ type: "offer", sdp });
    await this.flushIce(peer);
    const answer = await peer.pc.createAnswer();
    await peer.pc.setLocalDescription(answer);
    sendVoiceSignal(name, { t: "answer", sdp: answer.sdp ?? "" });
  }

  private async onAnswer(name: string, sdp: string): Promise<void> {
    const peer = this.peers.get(name);
    if (!peer || peer.pc.signalingState !== "have-local-offer") return;
    await peer.pc.setRemoteDescription({ type: "answer", sdp });
    await this.flushIce(peer);
  }

  private async onIce(name: string, candidate: RTCIceCandidateInit): Promise<void> {
    // Candidates can beat the offer here; hold them until a description is set.
    const peer = this.ensurePeer(name);
    if (!peer.pc.remoteDescription) {
      peer.pendingIce.push(candidate);
      return;
    }
    await peer.pc.addIceCandidate(candidate).catch(() => undefined);
  }

  private async flushIce(peer: Peer): Promise<void> {
    const pending = peer.pendingIce.splice(0);
    for (const candidate of pending) {
      await peer.pc.addIceCandidate(candidate).catch(() => undefined);
    }
  }

  private closePeer(name: string): void {
    const peer = this.peers.get(name);
    if (!peer) return;
    this.peers.delete(name);
    peer.pc.onicecandidate = null;
    peer.pc.ontrack = null;
    peer.pc.onconnectionstatechange = null;
    peer.pc.close();
    this.callbacks.onPeerStream(name, null);
    this.callbacks.onPeerState(name, null);
  }
}

let audioContext: AudioContext | null = null;

/** Calls `onChange` when a stream starts or stops carrying speech-level audio. */
export function watchSpeaking(
  stream: MediaStream,
  onChange: (speaking: boolean) => void,
): () => void {
  audioContext ??= new AudioContext();
  void audioContext.resume();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 512;
  source.connect(analyser);
  const samples = new Uint8Array(analyser.fftSize);
  let speaking = false;
  let lastLoud = 0;
  const timer = window.setInterval(() => {
    analyser.getByteTimeDomainData(samples);
    let sum = 0;
    for (const sample of samples) {
      const level = (sample - 128) / 128;
      sum += level * level;
    }
    const rms = Math.sqrt(sum / samples.length);
    const now = performance.now();
    if (rms > 0.04) {
      lastLoud = now;
      if (!speaking) {
        speaking = true;
        onChange(true);
      }
    } else if (speaking && now - lastLoud > 300) {
      speaking = false;
      onChange(false);
    }
  }, 100);
  return () => {
    window.clearInterval(timer);
    source.disconnect();
  };
}
