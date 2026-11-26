// Voice chat signalling rides the relay's existing `SignalPeer` / `PeerSignal`
// route (see docs/TRANSPORT.md). Voice payloads carry `voice: 1` so the web
// platform hands them here instead of to the game's WebRTC plane. This module
// keeps the platform and the voice mesh decoupled: the platform registers a
// sender and delivers incoming voice signals; the mesh listens.

export type VoiceSignalPayload = { voice: 1; t: string } & Record<string, unknown>;

type Sender = (to: string, payload: VoiceSignalPayload) => void;
type Listener = (from: string, payload: VoiceSignalPayload) => void;

let sender: Sender | null = null;
const listeners = new Set<Listener>();
const availabilityListeners = new Set<(available: boolean) => void>();

export function isVoiceSignal(payload: unknown): payload is VoiceSignalPayload {
  return (
    typeof payload === "object" &&
    payload !== null &&
    (payload as { voice?: unknown }).voice === 1 &&
    typeof (payload as { t?: unknown }).t === "string"
  );
}

/** Called by the platform once the relay says whether it forwards peer signals. */
export function setVoiceSignalSender(next: Sender | null): void {
  sender = next;
  for (const listener of availabilityListeners) listener(next !== null);
}

export function voiceSignallingAvailable(): boolean {
  return sender !== null;
}

export function onVoiceAvailabilityChange(listener: (available: boolean) => void): () => void {
  availabilityListeners.add(listener);
  return () => availabilityListeners.delete(listener);
}

export function sendVoiceSignal(
  to: string,
  payload: Record<string, unknown> & { t: string },
): boolean {
  if (!sender) return false;
  sender(to, { ...payload, voice: 1 });
  return true;
}

export function deliverVoiceSignal(from: string, payload: VoiceSignalPayload): void {
  for (const listener of listeners) listener(from, payload);
}

export function onVoiceSignal(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
