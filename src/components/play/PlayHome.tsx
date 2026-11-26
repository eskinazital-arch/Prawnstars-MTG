import { ArrowRight, PackageOpen, Swords, Users } from "lucide-react";
import type { ComponentType } from "react";
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

type WrapperTone = "pink" | "teal" | "violet";

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

/** Up to three ready-made decks, Commander first, then one per other format. */
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

const WRAPPER_TONE: Record<WrapperTone, string> = {
  pink: "bg-primary text-primary-foreground",
  teal: "bg-brand-accent text-background",
  violet: "bg-secondary text-background",
};

/** A booster-wrapper tile: one bright colour per way into the game, crimped on top. */
function WrapperTile({
  tone,
  title,
  detail,
  action,
  icon: Icon,
  onClick,
  wide = false,
}: {
  tone: WrapperTone;
  title: string;
  detail: string;
  action: string;
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "crimp-top group relative flex min-h-48 flex-col justify-between rounded-b-2xl rounded-t-md px-6 pb-5 pt-8 text-left shadow-[0_10px_24px_-14px_rgb(0_0_0/0.7)] motion-safe:transition-transform motion-safe:hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        WRAPPER_TONE[tone],
        wide && "md:col-span-2 xl:col-span-1",
      )}
    >
      <div>
        <Icon className="mb-3 h-6 w-6 opacity-80" />
        <h2 className="font-serif text-3xl font-extrabold leading-none tracking-[-0.01em]">
          {title}
        </h2>
        <p className="mt-2 text-ui-body font-semibold">{detail}</p>
      </div>
      <span className="mt-5 inline-flex items-center gap-2 self-start rounded-full bg-background px-4 py-2 text-ui-label font-semibold text-foreground motion-safe:transition-[gap] group-hover:gap-3">
        {action}
        <ArrowRight className="h-4 w-4" />
      </span>
    </button>
  );
}

function SeatDots({ room }: { room: RoomInfo }) {
  const seated = room.players.filter((player) => !player.is_bot).length;
  return (
    <span className="flex gap-1" aria-label={`${seated} of ${room.max_players} seats taken`}>
      {Array.from({ length: room.max_players }, (_, index) => (
        <span
          key={index}
          className={cn(
            "h-5 w-5 rounded-full border",
            index < seated ? "border-primary bg-primary" : "border-border bg-card",
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

  // One click from home to a seat: join the table, then show it in Multiplayer.
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
  const podDetail = !connected
    ? connecting
      ? `Connecting to the server…`
      : `Server offline`
    : firstRoom
      ? `${firstRoom.room_name} · ${firstRoom.players.filter((p) => !p.is_bot).length} of ${firstRoom.max_players} seated`
      : `No open tables yet`;

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
      <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-5 py-7 sm:px-8 lg:px-10">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-serif text-4xl font-extrabold tracking-[-0.015em] text-balance">
            {podMe ? `Ready to play, ${podMe}?` : `Ready to play?`}
          </h1>
          <div className="flex flex-wrap gap-2 text-ui-label">
            {podMe ? (
              <span className="rounded-full border border-border bg-card px-3 py-1.5">
                Playing as <b className="font-semibold">{podMe}</b>
              </span>
            ) : (
              <button
                type="button"
                onClick={focusNamePicker}
                className="rounded-full bg-primary px-3 py-1.5 font-semibold text-primary-foreground motion-safe:transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Pick your name
              </button>
            )}
            {connected && (
              <span className="rounded-full border border-border bg-card px-3 py-1.5 tabular-nums">
                {players.length} online
              </span>
            )}
          </div>
        </header>

        <UpdateCallout />

        {resumeSession && (
          <RejoinMatchCard session={resumeSession} onAbandoned={() => setResumeSession(null)} />
        )}

        <section
          aria-label={`Ways to play`}
          className={cn(
            "grid gap-5 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr]",
            resumePending && "hidden",
          )}
        >
          <WrapperTile
            tone="pink"
            title={`Play the pod`}
            detail={podDetail}
            action={firstRoom ? `Take a seat` : `Open a table`}
            icon={Users}
            onClick={() => (firstRoom ? void takeSeat(firstRoom) : navigate(ROUTES.LOBBY))}
            wide
          />
          <WrapperTile
            tone="teal"
            title={`Practice vs AI`}
            detail={`Any deck, any format`}
            action={`Start a game`}
            icon={Swords}
            onClick={() => navigate(ROUTES.PLAY_OFFLINE_CONSTRUCTED)}
          />
          <WrapperTile
            tone="violet"
            title={`Draft and sealed`}
            detail={`Crack packs and build on the spot`}
            action={`Open packs`}
            icon={PackageOpen}
            onClick={() => navigate(ROUTES.PLAY_OFFLINE_LIMITED)}
          />
        </section>

        <div
          className={cn(
            "grid items-start gap-6 lg:grid-cols-[1.2fr_1fr]",
            resumePending && "hidden",
          )}
        >
          <section aria-labelledby="open-tables">
            <h2 id="open-tables" className="mb-3 font-serif text-xl font-extrabold">
              Open tables
            </h2>
            {connected && openRooms.length > 0 ? (
              <ul className="grid gap-2.5">
                {openRooms.map((room) => (
                  <li key={room.room_id}>
                    <button
                      type="button"
                      onClick={() => void takeSeat(room)}
                      disabled={seating !== null}
                      className="flex w-full items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3 text-left motion-safe:transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                    >
                      <span>
                        <b className="block font-semibold">{room.room_name}</b>
                        <span className="text-ui-meta text-muted-foreground">
                          {seating === room.room_id
                            ? `Taking your seat…`
                            : `${room.format === "Any" ? `Any format` : room.format} · click to take a seat`}
                        </span>
                      </span>
                      <SeatDots room={room} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl border border-dashed border-border px-4 py-5 text-ui-body text-muted-foreground">
                {connected
                  ? `No open tables right now. Open one from Multiplayer and the pod will see it here.`
                  : `Connecting to the server…`}
              </p>
            )}
          </section>

          <section aria-labelledby="ready-made">
            <h2 id="ready-made" className="mb-3 font-serif text-xl font-extrabold">
              Try a ready-made deck
            </h2>
            <ul className="grid gap-2.5">
              {readyMade.map((deck) => (
                <li
                  key={deck.id ?? deck.name}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3"
                >
                  <span className="min-w-0">
                    <b className="block truncate font-semibold">{deck.name}</b>
                    <span className="text-ui-meta text-muted-foreground">
                      {formatLabel(deck.format)} · practice vs AI
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => void quickPlayPreset(deck)}
                    disabled={pendingDeckId !== null}
                    className="shrink-0 rounded-full bg-brand-accent px-4 py-1.5 text-ui-label font-semibold text-background motion-safe:transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                  >
                    Play
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className={cn(resumePending && "hidden")}>
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
