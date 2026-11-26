import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

function VideoTile({
  track,
  name,
  speaking,
  mirrored = false,
}: {
  track: MediaStreamTrack;
  name: string;
  speaking: boolean;
  mirrored?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = new MediaStream([track]);
    void video.play().catch(() => undefined);
    return () => {
      video.srcObject = null;
    };
  }, [track]);

  return (
    <figure
      className={cn(
        "relative h-30 w-40 shrink-0 overflow-hidden rounded-lg border border-border/70 bg-black shadow-lg transition-shadow motion-reduce:transition-none",
        speaking && "ring-2 ring-legality-legal/80",
      )}
    >
      {/* Audio plays through the voice connection; the tile is video only. */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn("h-full w-full object-cover", mirrored && "-scale-x-100")}
      />
      <figcaption className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-2 py-0.5 text-ui-meta text-white">
        {name}
      </figcaption>
    </figure>
  );
}

export interface VideoTileEntry {
  key: string;
  name: string;
  track: MediaStreamTrack;
  speaking: boolean;
  self?: boolean;
}

/** A row of camera tiles: this player's preview first, then everyone sharing a camera. */
export function VideoTiles({ tiles }: { tiles: VideoTileEntry[] }) {
  if (tiles.length === 0) return null;
  return (
    <div
      role="group"
      aria-label={`Cameras`}
      className="flex max-w-[calc(100vw-1.5rem)] gap-2 overflow-x-auto pb-1"
    >
      {tiles.map((tile) => (
        <VideoTile
          key={tile.key}
          track={tile.track}
          name={tile.name}
          speaking={tile.speaking}
          mirrored={tile.self}
        />
      ))}
    </div>
  );
}
