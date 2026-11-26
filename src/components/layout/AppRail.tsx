import { HeartPulse, House, Layers, PackageOpen, Search, Swords, Users } from "lucide-react";
import type { ComponentType } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { usePodDecksStore } from "@/stores/usePodDecksStore";
import { memberDisplayName } from "@/lib/podMembers";
import { ClubMark } from "./ClubMark";
import { isNavDestinationActive } from "./navDestinations";

interface RailItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const RAIL_ITEMS: RailItem[] = [
  { to: ROUTES.PLAY, label: `Home`, icon: House },
  { to: ROUTES.LOBBY, label: `Tables`, icon: Users },
  { to: ROUTES.PLAY_OFFLINE_CONSTRUCTED, label: `Practice`, icon: Swords },
  { to: ROUTES.PLAY_OFFLINE_LIMITED, label: `Draft`, icon: PackageOpen },
  { to: ROUTES.DECK_EDITOR, label: `Decks`, icon: Layers },
  { to: ROUTES.SEARCH, label: `Cards`, icon: Search },
  { to: ROUTES.COMPANION, label: `Life counter`, icon: HeartPulse },
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

/** The club's side panel: primary navigation on desktop-class screens. */
export function AppRail({ disabled = false }: { disabled?: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const podMe = usePodDecksStore((state) => state.me);
  return (
    <div className="hidden w-60 shrink-0 p-2.5 pr-0 pt-[calc(var(--safe-area-inset-top)+0.625rem)] md:pointer-fine:block">
      <nav
        aria-label="Primary"
        className="flex h-full flex-col gap-1 rounded-2xl bg-primary px-3 py-5 text-primary-foreground"
      >
        <button
          type="button"
          onClick={() => navigate(ROUTES.PLAY)}
          disabled={disabled}
          className="mb-6 flex items-center gap-3 rounded-xl px-2 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <ClubMark size={42} className="shrink-0" />
          <span className="text-[0.9375rem] font-medium leading-tight tracking-[-0.01em]">
            The Cock Magic Club
          </span>
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
                "flex items-center gap-3 rounded-full px-4 py-2.5 text-left text-ui-label font-medium motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-50",
                active
                  ? "bg-white text-[#191919]"
                  : "text-[#bdbdbd] hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="h-[1.125rem] w-[1.125rem] shrink-0" />
              {label}
            </button>
          );
        })}
        <div className="mt-auto border-t border-[#303030] px-2 pt-4 text-ui-meta text-[#8c8c8c]">
          {podMe ? `Drinking with` : `You are`}
          <b className="block truncate text-ui-label font-medium text-white">
            {podMe ? memberDisplayName(podMe) : `a guest, pick your name on Home`}
          </b>
        </div>
      </nav>
    </div>
  );
}
