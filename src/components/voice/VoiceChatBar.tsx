import { useEffect, useMemo, useState } from "react";
import { Headphones, Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoTiles, type VideoTileEntry } from "@/components/voice/VideoTiles";
import { cn } from "@/lib/utils";
import { useServerStore } from "@/stores/useServerStore";
import { useVoiceStore, type VoicePeerView } from "@/stores/useVoiceStore";

function SpeakerChip({
  name,
  peer,
  speaking,
  muted = false,
}: {
  name: string;
  peer?: VoicePeerView;
  speaking: boolean;
  muted?: boolean;
}) {
  const status =
    peer === undefined && !muted && name !== `You`
      ? `not in voice`
      : peer?.state === "connecting"
        ? `connecting`
        : peer?.state === "failed"
          ? `couldn't connect`
          : muted
            ? `muted`
            : null;
  return (
    <span
      title={status ?? name}
      className={cn(
        "inline-flex max-w-40 items-center gap-1 truncate rounded-full border px-2 py-0.5 text-ui-meta transition-shadow motion-reduce:transition-none",
        speaking && "border-brand-accent ring-2 ring-brand-accent/60",
        peer === undefined && name !== `You` && "opacity-50",
        peer?.state === "failed" && "border-destructive/60 text-destructive",
      )}
    >
      {muted && <MicOff className="h-3 w-3 shrink-0" />}
      <span className="truncate">{name}</span>
      {status && status !== `muted` && (
        <span className="shrink-0 text-muted-foreground">({status})</span>
      )}
    </span>
  );
}

/** Voice controls for the room you are in, shown over the lobby and the game. */
export function VoiceChatBar() {
  const room = useServerStore((state) => state.currentRoom);
  const username = useServerStore((state) => state.username);
  const available = useVoiceStore((state) => state.available);
  const joined = useVoiceStore((state) => state.joined);
  const joining = useVoiceStore((state) => state.joining);
  const muted = useVoiceStore((state) => state.muted);
  const selfSpeaking = useVoiceStore((state) => state.selfSpeaking);
  const peers = useVoiceStore((state) => state.peers);
  const error = useVoiceStore((state) => state.error);
  const join = useVoiceStore((state) => state.join);
  const leave = useVoiceStore((state) => state.leave);
  const toggleMute = useVoiceStore((state) => state.toggleMute);
  const setMembers = useVoiceStore((state) => state.setMembers);
  const cameraOn = useVoiceStore((state) => state.cameraOn);
  const cameraStarting = useVoiceStore((state) => state.cameraStarting);
  const localVideo = useVoiceStore((state) => state.localVideo);
  const remoteVideo = useVoiceStore((state) => state.remoteVideo);
  const toggleCamera = useVoiceStore((state) => state.toggleCamera);
  const [videoHidden, setVideoHidden] = useState(false);

  const members = useMemo(
    () =>
      (room?.players ?? [])
        .filter((player) => !player.is_bot && player.connected)
        .map((player) => player.username),
    [room],
  );
  const membersKey = members.join("|");

  useEffect(() => {
    if (joined) setMembers(members);
    // membersKey stands in for members, which is a new array on every room update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joined, membersKey, setMembers]);

  useEffect(() => {
    if (!room && joined) leave();
  }, [room, joined, leave]);

  if (!room || !username) return null;
  const others = members.filter((name) => name !== username);

  const tiles: VideoTileEntry[] = [];
  if (joined && localVideo) {
    tiles.push({ key: "self", name: `You`, track: localVideo, speaking: selfSpeaking, self: true });
  }
  for (const name of others) {
    const track = remoteVideo[name];
    if (joined && track && peers[name]?.camera) {
      tiles.push({ key: name, name, track, speaking: peers[name]?.speaking ?? false });
    }
  }

  return (
    <div className="fixed bottom-3 left-3 z-50 flex max-w-[calc(100vw-1.5rem)] flex-col items-start gap-2">
      {!videoHidden && <VideoTiles tiles={tiles} />}
      <div
        role="region"
        aria-label={`Voice chat`}
        className="flex max-w-full flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-background/90 px-3 py-2 shadow-xl backdrop-blur-md"
      >
        <Headphones className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        {joined ? (
          <>
            <Button
              size="sm"
              variant={muted ? "destructive" : "outline"}
              onClick={toggleMute}
              aria-pressed={muted}
              className="touch:min-h-11 gap-1"
            >
              {muted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              {muted ? `Unmute` : `Mute`}
            </Button>
            <Button
              size="sm"
              variant={cameraOn ? "selected" : "outline"}
              onClick={() => void toggleCamera()}
              disabled={cameraStarting}
              aria-pressed={cameraOn}
              className="touch:min-h-11 gap-1"
            >
              {cameraOn ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
              {cameraStarting ? `Starting…` : cameraOn ? `Camera on` : `Camera`}
            </Button>
            {tiles.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setVideoHidden((hidden) => !hidden)}
                aria-pressed={videoHidden}
                className="touch:min-h-11"
              >
                {videoHidden ? `Show video (${tiles.length})` : `Hide video`}
              </Button>
            )}
            <SpeakerChip name={`You`} speaking={selfSpeaking} muted={muted} peer={undefined} />
            {others.map((name) => (
              <SpeakerChip
                key={name}
                name={name}
                peer={peers[name]}
                speaking={peers[name]?.speaking ?? false}
              />
            ))}
            <Button size="sm" variant="ghost" onClick={leave} className="touch:min-h-11 gap-1">
              <PhoneOff className="h-3.5 w-3.5" />
              {`Leave voice`}
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="primary"
              disabled={!available || joining}
              onClick={() => void join(username, members)}
              className="touch:min-h-11 gap-1"
            >
              <Mic className="h-3.5 w-3.5" />
              {joining ? `Connecting…` : `Join voice`}
            </Button>
            {!available && (
              <span className="text-ui-meta text-muted-foreground">
                {`Voice needs a server with peer-to-peer signals turned on.`}
              </span>
            )}
          </>
        )}
        {error && <span className="text-ui-meta text-destructive">{error}</span>}
      </div>
    </div>
  );
}
