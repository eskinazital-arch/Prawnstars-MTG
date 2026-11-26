import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, RotateCw } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useIsTouch } from "@/hooks/useBreakpoints";
import { LANDSCAPE_GATE_MAX_WIDTH_QUERY, PORTRAIT_QUERY } from "@/lib/responsive";

type LockableOrientation = ScreenOrientation & {
  lock?: (o: string) => Promise<void>;
  unlock?: () => void;
};

function orientation(): LockableOrientation | undefined {
  return screen.orientation as LockableOrientation | undefined;
}

/** iPhones and iPads report a Mac-like platform and have no page fullscreen. */
function isAppleTouch(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform))
  );
}

export function LandscapeGate() {
  const coarse = useIsTouch();
  const portrait = useMediaQuery(PORTRAIT_QUERY);
  const small = useMediaQuery(LANDSCAPE_GATE_MAX_WIDTH_QUERY);
  const [failed, setFailed] = useState(false);
  const canFullscreen =
    typeof document !== "undefined" && document.fullscreenEnabled && !isAppleTouch();

  useEffect(() => {
    if (!coarse || !small) return;
    // Browsers only honour the lock in fullscreen; this covers an installed
    // (home-screen) app, which is already fullscreen.
    orientation()
      ?.lock?.("landscape")
      .catch(() => undefined);
    return () => orientation()?.unlock?.();
  }, [coarse, small]);

  async function playFullscreen() {
    setFailed(false);
    try {
      await document.documentElement.requestFullscreen({ navigationUI: "hide" });
      await orientation()?.lock?.("landscape");
    } catch {
      setFailed(true);
    }
  }

  if (!coarse || !portrait || !small) return null;
  return createPortal(
    <div className="fixed inset-0 z-[10002] flex flex-col items-center justify-center gap-3 bg-background/95 p-6 text-center [padding-bottom:max(1.5rem,var(--safe-area-inset-bottom))] [padding-left:max(1.5rem,var(--safe-area-inset-left))] [padding-right:max(1.5rem,var(--safe-area-inset-right))] [padding-top:max(1.5rem,var(--safe-area-inset-top))]">
      <RotateCw className="h-10 w-10 animate-pulse text-muted-foreground motion-reduce:animate-none" />
      <p className="text-lg font-semibold">Turn your phone sideways</p>
      <p className="max-w-sm text-ui-body text-muted-foreground">
        The table needs the room: the game plays in landscape.
      </p>
      {canFullscreen ? (
        <button
          type="button"
          onClick={() => void playFullscreen()}
          className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#1F6B4A] px-6 text-ui-label font-semibold text-white hover:bg-[#17553A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Maximize2 className="h-4 w-4" />
          Play full screen
        </button>
      ) : (
        <p className="max-w-sm text-ui-meta text-muted-foreground">
          If the screen will not turn, switch off Portrait Orientation Lock in Control Centre.
        </p>
      )}
      {failed && (
        <p className="max-w-sm text-ui-meta text-muted-foreground">
          This browser would not go full screen. Turn the phone sideways instead.
        </p>
      )}
    </div>,
    document.body,
  );
}
