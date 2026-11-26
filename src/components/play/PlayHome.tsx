import { ArrowRight, PackageOpen, Swords } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UpdateCallout } from "@/components/layout/UpdateCallout";
import { PlayDeckShelf } from "@/components/play/PlayDeckShelf";
import { RejoinMatchCard } from "@/components/play/RejoinMatchCard";
import { useQuickPlay } from "@/hooks/useQuickPlay";
import { peekActiveGameSession } from "@/lib/activeGameSession";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { relayUsername } from "@/lib/relayUsername";
import { usePreferencesStore } from "@/stores/usePreferencesStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { usePodDecksStore } from "@/stores/usePodDecksStore";
import { useServerStore } from "@/stores/useServerStore";
import { usePresetDecks } from "@/stores/usePresetDecksStore";
import type { PresetDeck } from "@/lib/presetDecks";
import type { RoomInfo } from "@/types/server";
import { toast } from "sonner";

const FORMAT_LABELS: Record<string, string> = {
  commander: `Commander`,
  standard: `Standard`,
  pioneer: `Pioneer`,
  modern: `Modern`,
  legacy: `Legacy`,
  vintage: `Vintage`,
  pauper: `Pauper`,
  brawl: `Brawl`,
};

function formatLabel(format: string | undefined): string {
  if (!format) return `Constructed`;
  return FORMAT_LABELS[format] ?? format.charAt(0).toUpperCase() + format.slice(1);
}

/** Up to three house decks, Commander first, then one per other format. */
function pickReadyMade(decks: PresetDeck[]): PresetDeck[] {
  const picked: PresetDeck[] = [];
  const seen = new Set<string>();
  for (const deck of [...decks].sort((a, b) =>
    a.format === "commander" ? -1 : b.format === "commander" ? 1 : 0,
  )) {
    const format = deck.format ?? "standard";
    if (seen.has(format)) continue;
    seen.add(format);
    picked.push(deck);
    if (picked.length === 3) break;
  }
  return picked;
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return `Late one`;
  if (hour < 12) return `Morning`;
  if (hour < 17) return `Afternoon`;
  return `Evening`;
}

const PILL =
  "inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-ui-label font-medium motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-60 [&_svg]:h-4 [&_svg]:w-4";
const PILL_ON_DARK = `${PILL} bg-white text-[#191919] hover:bg-[#f3f3f3] focus-visible:ring-white/60`;
const PILL_ON_DARK_GHOST = `${PILL} border border-[#303030] text-white hover:bg-white/10 focus-visible:ring-white/60`;
const PILL_OUTLINE = `${PILL} min-h-9 shrink-0 px-4 border border-border text-foreground hover:bg-muted focus-visible:ring-ring`;
const BOX = "rounded-2xl border border-border p-5";
const LABEL = "mb-2 text-ui-meta font-medium uppercase tracking-[0.025em] text-muted-foreground";

function seatedCount(room: RoomInfo): number {
  return room.players.filter((player) => !player.is_bot).length;
}

function SeatDots({ room }: { room: RoomInfo }) {
  const seated = seatedCount(room);
  return (
    <span className="flex shrink-0 gap-1" aria-hidden>
      {Array.from({ length: room.max_players }, (_, index) => (
        <span
          key={index}
          className={cn(
            "h-3.5 w-3.5 rounded-full border",
            index < seated ? "border-primary bg-primary" : "border-[#bdbdbd] bg-background",
          )}
        />
      ))}
    </span>
  );
}

export function PlayHome() {
  const navigate = useNavigate();
  const { quickPlay, quickPlayPreset, quickPlayCommunity, pendingDeckId } = useQuickPlay();
  const [resumeSession, setResumeSession] = useState(peekActiveGameSession);
  const resumePending = resumeSession !== null;
  const connected = useServerStore((state) => state.connected);
  const connecting = useServerStore((state) => state.connecting);
  const connectionError = useServerStore((state) => state.error);
  const switchingRelay = useServerStore((state) => state.switchingRelay);
  const rooms = useServerStore((state) => state.rooms);
  const players = useServerStore((state) => state.players);
  const connectPreferred = useServerStore((state) => state.connectPreferred);
  const listRooms = useServerStore((state) => state.listRooms);
  const listPlayers = useServerStore((state) => state.listPlayers);
  const serverUsername = usePreferencesStore((state) => state.serverUsername);
  const podMe = usePodDecksStore((state) => state.me);
  const accountHandle = useAuthStore((s) =>
    s.status === "signedIn" ? (s.account?.handle ?? null) : null,
  );
  const joinRoom = useServerStore((state) => state.joinRoom);
  const presetDecks = usePresetDecks();
  const [seating, setSeating] = useState<string | null>(null);
  const openRooms = rooms.filter((room) => room.status === "Lobby" && room.engine !== "Manabrew");
  const firstRoom = openRooms[0];
  const readyMade = pickReadyMade(presetDecks);

  // One click from home to a seat: join the table, then show it on Tables.
  async function takeSeat(room: RoomInfo) {
    if (seating) return;
    setSeating(room.room_id);
    try {
      await joinRoom(room.room_id);
      navigate(ROUTES.LOBBY);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Could not join ${room.room_name}.`);
    } finally {
      setSeating(null);
    }
  }

  function focusNamePicker() {
    const picker = document.getElementById("pod-me");
    picker?.scrollIntoView({ behavior: "smooth", block: "center" });
    picker?.focus({ preventScroll: true });
  }

  const heroDetail = !connected
    ? connecting
      ? `Getting you through the door…`
      : `The server is not answering. Practice and draft still work.`
    : firstRoom
      ? seatedCount(firstRoom) === 0
        ? `${firstRoom.room_name} is set up and empty. Be the first to sit down.`
        : `${firstRoom.room_name} has a seat for you. ${seatedCount(firstRoom)} of ${firstRoom.max_players} are in.`
      : `No tables open yet. Open one and the pod will see it here.`;

  useEffect(() => {
    const name = relayUsername();
    if (
      !resumePending &&
      !connected &&
      !connecting &&
      !connectionError &&
      !switchingRelay &&
      name
    ) {
      void connectPreferred(name);
    }
  }, [
    connectPreferred,
    connected,
    connecting,
    connectionError,
    switchingRelay,
    resumePending,
    serverUsername,
    accountHandle,
  ]);
  useEffect(() => {
    if (!connected || resumePending) return;
    listRooms();
    listPlayers();
    const id = setInterval(() => {
      listRooms();
      listPlayers();
    }, 5000);
    return () => clearInterval(id);
  }, [connected, listPlayers, listRooms, resumePending]);

  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-2.5 p-2.5">
        <UpdateCallout />

        {resumeSession && (
          <RejoinMatchCard session={resumeSession} onAbandoned={() => setResumeSession(null)} />
        )}

        <section
          aria-label={`Tonight`}
          className={cn(
            "flex flex-col justify-between gap-8 rounded-2xl bg-primary px-7 py-8 text-primary-foreground sm:px-10 sm:py-10 lg:min-h-72",
            resumePending && "hidden",
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-5xl font-light leading-[1.02] tracking-[-0.05em] text-balance sm:text-6xl">
                {greeting()}
                {podMe ? `, ${podMe}.` : `.`}
              </h1>
              <p className="mt-4 max-w-xl text-ui-body text-[#bdbdbd]">{heroDetail}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-ui-meta text-[#bdbdbd]">
              {connected && (
                <span className="rounded-full border border-[#303030] px-3 py-1.5 tabular-nums">
                  {players.length} in the club
                </span>
              )}
              {!podMe && (
                <button
                  type="button"
                  onClick={focusNamePicker}
                  className="rounded-full border border-[#303030] px-3 py-1.5 text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  Tell us who you are
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={PILL_ON_DARK}
              disabled={seating !== null}
              onClick={() => (firstRoom ? void takeSeat(firstRoom) : navigate(ROUTES.LOBBY))}
            >
              {firstRoom ? (seating ? `Taking your seat…` : `Take a seat`) : `Open a table`}
              <ArrowRight />
            </button>
            <button
              type="button"
              className={PILL_ON_DARK_GHOST}
              onClick={() => navigate(ROUTES.PLAY_OFFLINE_CONSTRUCTED)}
            >
              <Swords /> Practice vs AI
            </button>
            <button
              type="button"
              className={PILL_ON_DARK_GHOST}
              onClick={() => navigate(ROUTES.PLAY_OFFLINE_LIMITED)}
            >
              <PackageOpen /> Draft and sealed
            </button>
          </div>
        </section>

        <div className={cn("grid items-start gap-2.5 lg:grid-cols-2", resumePending && "hidden")}>
          <section aria-labelledby="on-tonight" className={BOX}>
            <h2 id="on-tonight" className={LABEL}>
              On tonight
            </h2>
            {connected && openRooms.length > 0 ? (
              <ul className="divide-y divide-border">
                {openRooms.map((room) => (
                  <li key={room.room_id}>
                    <button
                      type="button"
                      onClick={() => void takeSeat(room)}
                      disabled={seating !== null}
                      className="group flex w-full items-center justify-between gap-4 rounded-lg py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                    >
                      <span className="min-w-0">
                        <b className="block truncate font-medium group-hover:underline">
                          {room.room_name}
                        </b>
                        <span className="text-ui-meta text-muted-foreground">
                          {seating === room.room_id
                            ? `Taking your seat…`
                            : `${room.format === "Any" ? `Any format` : room.format} · ${seatedCount(room)} of ${room.max_players} seated`}
                        </span>
                      </span>
                      <SeatDots room={room} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 py-2">
                <p className="text-ui-body text-muted-foreground">
                  {connected ? `Nothing on yet.` : `Waiting on the server…`}
                </p>
                {connected && (
                  <button
                    type="button"
                    className={PILL_OUTLINE}
                    onClick={() => navigate(ROUTES.LOBBY)}
                  >
                    Open a table
                  </button>
                )}
              </div>
            )}
          </section>

          <section aria-labelledby="house-decks" className={BOX}>
            <h2 id="house-decks" className={LABEL}>
              House decks
            </h2>
            <ul className="divide-y divide-border">
              {readyMade.map((deck) => (
                <li
                  key={deck.id ?? deck.name}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <span className="min-w-0">
                    <b className="block truncate font-medium">{deck.name}</b>
                    <span className="text-ui-meta text-muted-foreground">
                      {formatLabel(deck.format)} · borrow it against the AI
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => void quickPlayPreset(deck)}
                    disabled={pendingDeckId !== null}
                    className={PILL_OUTLINE}
                  >
                    Play
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className={cn("px-1 pt-4", resumePending && "hidden")}>
          <PlayDeckShelf
            onPlay={quickPlay}
            onPlayPreset={quickPlayPreset}
            onPlayCommunity={quickPlayCommunity}
            pendingDeckId={pendingDeckId}
          />
        </div>
      </div>
    </div>
  );
}
