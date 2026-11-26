import { HeartPulse, House, Layers, PackageOpen, Search, Swords, Users } from "lucide-react";
import type { ComponentType } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { PrawnMark } from "./PrawnMark";
import { isNavDestinationActive } from "./navDestinations";

interface RailItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const RAIL_ITEMS: RailItem[] = [
  { to: ROUTES.PLAY, label: `Play`, icon: House },
  { to: ROUTES.LOBBY, label: `Multiplayer`, icon: Users },
  { to: ROUTES.PLAY_OFFLINE_CONSTRUCTED, label: `Practice`, icon: Swords },
  { to: ROUTES.PLAY_OFFLINE_LIMITED, label: `Draft`, icon: PackageOpen },
  { to: ROUTES.DECK_EDITOR, label: `Decks`, icon: Layers },
  { to: ROUTES.SEARCH, label: `Cards`, icon: Search },
  { to: ROUTES.COMPANION, label: `Life`, icon: HeartPulse },
];

function isLimitedPath(pathname: string): boolean {
  return (
    pathname.startsWith(ROUTES.PLAY_OFFLINE_LIMITED) ||
    pathname.startsWith(ROUTES.DRAFT) ||
    pathname.startsWith(ROUTES.SEALED) ||
    pathname.startsWith(ROUTES.WINSTON)
  );
}

function isRailItemActive(to: string, pathname: string): boolean {
  if (to === ROUTES.PLAY_OFFLINE_LIMITED) return isLimitedPath(pathname);
  if (to === ROUTES.PLAY_OFFLINE_CONSTRUCTED && isLimitedPath(pathname)) return false;
  return isNavDestinationActive(to, pathname);
}

/** The pink rail: the app's primary navigation on desktop-class screens. */
export function AppRail({ disabled = false }: { disabled?: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <nav
      aria-label="Primary"
      className="hidden w-[5.5rem] shrink-0 flex-col items-center gap-1.5 bg-primary pb-4 pl-[var(--safe-area-inset-left)] pt-[calc(var(--safe-area-inset-top)+1rem)] text-primary-foreground md:pointer-fine:flex"
    >
      <button
        type="button"
        onClick={() => navigate(ROUTES.PLAY)}
        aria-label={`Prawnstars MTG home`}
        disabled={disabled}
        className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-background shadow-[0_6px_14px_-6px_rgb(26_16_48/0.6)] motion-safe:transition-transform motion-safe:hover:-rotate-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
      >
        <PrawnMark size={42} />
      </button>
      {RAIL_ITEMS.map(({ to, label, icon: Icon }) => {
        const active = isRailItemActive(to, location.pathname);
        return (
          <button
            key={to}
            type="button"
            disabled={disabled}
            aria-current={active ? "page" : undefined}
            onClick={() => navigate(to)}
            className={cn(
              "flex w-[4.25rem] flex-col items-center gap-1 rounded-xl px-1 py-2 text-[0.6875rem] font-semibold leading-tight motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background disabled:opacity-50",
              active
                ? "bg-background text-foreground"
                : "text-primary-foreground hover:bg-background/15",
            )}
          >
            <Icon className={cn("h-5 w-5", active && "text-primary")} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
