import { Loader2, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useIsShortScreen, useIsTouch } from "@/hooks/useBreakpoints";
import { tableLabel, useMatchmakingStore } from "@/stores/useMatchmakingStore";
interface MultiplayerStartPanelProps {
  disabled: boolean;
  searching: boolean;
  onSetUp: () => void;
  onFindGame?: () => void;
}
export function MultiplayerStartPanel({
  disabled,
  searching,
  onSetUp,
  onFindGame,
}: MultiplayerStartPanelProps) {
  const shortScreen = useIsShortScreen();
  const isTouch = useIsTouch();
  const compact = shortScreen && isTouch;
  const podSizes = useMatchmakingStore((state) => state.podSizes);
  const brackets = useMatchmakingStore((state) => state.brackets);
  const leave = useMatchmakingStore((state) => state.leave);

  const title = searching ? (
    <>
      Finding a match
      <span aria-hidden className="inline-block animate-ellipsis motion-reduce:animate-none">
        ...
      </span>
    </>
  ) : (
    "Pull up a chair."
  );
  const detail = searching
    ? [
        podSizes.map(tableLabel).join(" or "),
        brackets.length > 0
          ? `Bracket ${[...brackets].sort((a, b) => a - b).join(", ")}`
          : "Checking brackets",
      ].join(" · ")
    : null;
  const actions = searching ? (
    <Button
      variant="outline"
      onClick={() =>
        void leave().catch((error: unknown) =>
          toast.error(error instanceof Error ? error.message : "Could not cancel the search."),
        )
      }
    >
      Cancel search
    </Button>
  ) : (
    <div className="flex flex-col gap-2 sm:flex-row">
      {onFindGame && (
        <Button variant="primary" onClick={onFindGame} disabled={disabled}>
          <Search /> Find a game
        </Button>
      )}
      <Button variant={onFindGame ? "outline" : "primary"} onClick={onSetUp} disabled={disabled}>
        <Plus /> Create a table
      </Button>
    </div>
  );
  if (compact) {
    return (
      <section className="flex min-h-24 flex-wrap items-center justify-between gap-4 rounded-xl border border-border/70 bg-card/80 p-3 shadow-md backdrop-blur-md">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold leading-tight">
            {searching && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />}
            {title}
          </h2>
          <p className="mt-1 text-ui-meta text-muted-foreground">
            {detail ?? "Create a table for your group."}
          </p>
        </div>
        {actions}
      </section>
    );
  }
  const pill =
    "inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-ui-label font-medium motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-60 [&_svg]:h-4 [&_svg]:w-4";
  // The lobby's way in: the same near-black club panel as the Play home.
  return (
    <section className="flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-primary px-7 py-7 text-primary-foreground">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-4xl font-light leading-none tracking-[-0.05em]">
          {searching && <Loader2 className="h-6 w-6 animate-spin motion-reduce:animate-none" />}
          {title}
        </h2>
        <p className="mt-3 text-ui-body text-[#bdbdbd]">
          {detail ?? "Open a table and the pod sees it on their home page."}
        </p>
      </div>
      {searching ? (
        <button
          type="button"
          className={cn(pill, "bg-white text-[#191919] hover:bg-[#f3f3f3]")}
          onClick={() =>
            void leave().catch((error: unknown) =>
              toast.error(error instanceof Error ? error.message : "Could not cancel the search."),
            )
          }
        >
          Cancel search
        </button>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={cn(pill, "bg-white text-[#191919] hover:bg-[#f3f3f3]")}
            onClick={onSetUp}
            disabled={disabled}
          >
            <Plus /> Create a table
          </button>
          {onFindGame && (
            <button
              type="button"
              className={cn(pill, "border border-[#303030] text-white hover:bg-white/10")}
              onClick={onFindGame}
              disabled={disabled}
            >
              <Search /> Find a game
            </button>
          )}
        </div>
      )}
    </section>
  );
}
