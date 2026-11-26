import { create } from "zustand";
import { VoiceMesh, watchSpeaking, type VoicePeerState } from "@/lib/voice/voiceMesh";
import { onVoiceAvailabilityChange, voiceSignallingAvailable } from "@/lib/voice/voiceSignals";

export interface VoicePeerView {
  state: VoicePeerState;
  speaking: boolean;
}

interface VoiceState {
  /** The relay forwards peer signals, so voice can work on this server. */
  available: boolean;
  joined: boolean;
  joining: boolean;
  muted: boolean;
  selfSpeaking: boolean;
  peers: Record<string, VoicePeerView>;
  error: string | null;
  join: (me: string, members: string[]) => Promise<void>;
  leave: () => void;
  toggleMute: () => void;
  setMembers: (members: string[]) => void;
}

// Live media objects stay outside the store: they are not state to render.
let mesh: VoiceMesh | null = null;
let localStream: MediaStream | null = null;
let stopSelfMeter: (() => void) | null = null;
const remoteAudio = new Map<string, HTMLAudioElement>();
const remoteMeters = new Map<string, () => void>();

function detachRemote(name: string): void {
  remoteMeters.get(name)?.();
  remoteMeters.delete(name);
  const audio = remoteAudio.get(name);
  if (audio) {
    audio.pause();
    audio.srcObject = null;
    remoteAudio.delete(name);
  }
}

export const useVoiceStore = create<VoiceState>((set, get) => {
  const setPeer = (name: string, patch: Partial<VoicePeerView> | null) =>
    set((state) => {
      const peers = { ...state.peers };
      if (patch === null) delete peers[name];
      else {
        const current = peers[name] ?? { state: "connecting", speaking: false };
        peers[name] = { ...current, ...patch };
      }
      return { peers };
    });

  const attachRemote = (name: string, stream: MediaStream | null) => {
    detachRemote(name);
    if (!stream) return;
    const audio = new Audio();
    audio.autoplay = true;
    audio.srcObject = stream;
    void audio.play().catch(() => undefined);
    remoteAudio.set(name, audio);
    remoteMeters.set(
      name,
      watchSpeaking(stream, (speaking) => {
        if (get().peers[name]) setPeer(name, { speaking });
      }),
    );
  };

  onVoiceAvailabilityChange((available) => {
    set({ available });
    if (!available && get().joined) get().leave();
  });

  return {
    available: voiceSignallingAvailable(),
    joined: false,
    joining: false,
    muted: false,
    selfSpeaking: false,
    peers: {},
    error: null,

    join: async (me, members) => {
      if (get().joined || get().joining) return;
      if (!voiceSignallingAvailable()) {
        set({ error: `This server does not support voice chat.` });
        return;
      }
      set({ joining: true, error: null });
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          video: false,
        });
      } catch (err) {
        const denied = err instanceof DOMException && err.name === "NotAllowedError";
        set({
          joining: false,
          error: denied
            ? `Microphone access was blocked. Allow it in your browser and try again.`
            : `Could not open your microphone.`,
        });
        return;
      }
      stopSelfMeter = watchSpeaking(localStream, (speaking) =>
        set({ selfSpeaking: speaking && !get().muted }),
      );
      mesh = new VoiceMesh(me, localStream, {
        onPeerState: (name, state) => setPeer(name, state === null ? null : { state }),
        onPeerStream: attachRemote,
      });
      set({ joined: true, joining: false, muted: false, peers: {} });
      mesh.setMembers(members);
    },

    leave: () => {
      mesh?.leave();
      mesh = null;
      for (const name of [...remoteAudio.keys(), ...remoteMeters.keys()]) detachRemote(name);
      stopSelfMeter?.();
      stopSelfMeter = null;
      localStream?.getTracks().forEach((track) => track.stop());
      localStream = null;
      set({ joined: false, joining: false, muted: false, selfSpeaking: false, peers: {} });
    },

    toggleMute: () => {
      const muted = !get().muted;
      localStream?.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
      set({ muted, selfSpeaking: false });
    },

    setMembers: (members) => mesh?.setMembers(members),
  };
});
