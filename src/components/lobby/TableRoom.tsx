import { useState } from "react";
import { boardBackgroundUrl } from "@/pixi/board/boardBackgrounds";
import { LibraryBig, LogOut, Swords } from "lucide-react";
import { OpenTableSeats } from "@/components/lobby/OpenTableSeats";
import { tableController, tableStartsAutomatically } from "@/components/lobby/tables.utils";
import { TableRoomHeader } from "@/components/lobby/TableRoomHeader";
import { InvitePlayersDialog } from "@/components/lobby/InvitePlayersDialog";
import { Button } from "@/components/ui/button";
import { RELAY_FEATURE, type GameFormat, type RoomInfo } from "@/types/server";
import { useServerStore } from "@/stores/useServerStore";
import { stripUsernameTag } from "@/lib/username";
import type { TableRoomDeckSelection } from "./tableRoom.types";
interface TableRoomProps {
  room: RoomInfo;
  roomPassword?: string | null;
  username: string | null;
  onLeaveRoom: () => void;
  onSetReady: (ready: boolean) => void;
  onSetFormat?: (format: GameFormat) => void;
  onSetMaxPlayers?: (maxPlayers: number) => void;
  deckSelection?: TableRoomDeckSelection;
  onStartGame: () => void;
  onStartDraft?: () => void;
  onStartSealed?: () => void;
  startingLimited?: boolean;
  startingGame?: boolean;
  onAddBot?: (seatIndex: number) => void;
  onRemoveBot?: (username: string) => void;
  mySpawnedBots?: string[];
}
export function TableRoom({
  room,
  roomPassword,
  username,
  onLeaveRoom,
  onSetReady,
  onSetFormat,
  onSetMaxPlayers,
  deckSelection,
  onStartGame,
  onStartDraft,
  onStartSealed,
  startingLimited = false,
  startingGame = false,
  onAddBot,
  onRemoveBot,
  mySpawnedBots = [],
}: TableRoomProps) {
  const [inviting, setInviting] = useState(false);
  const invitesEnabled = useServerStore((s) => s.relayFeatures.includes(RELAY_FEATURE.RoomInvites));
  const myPlayer = room.players.find((player) => player.username === username);
  const controllerName = tableController(room);
  const autoStart = tableStartsAutomatically(room);
  const isController = controllerName === username;
  const isLimitedRoom = !!(room.draft_config || room.sealed_config);
  const needsFormat = room.format === "Any" && !isLimitedRoom;
  const isOpenFormat = room.format === "Any" || isLimitedRoom;
  const minReady = room.draft_config
    ? room.draft_config.fill_with_bots
      ? 1
      : room.max_players
    : isOpenFormat
      ? 1
      : 2;
  const allOtherPlayersReady =
    room.players.length >= minReady &&
    room.players
      .filter((player) => player.username !== controllerName)
      .every((player) => player.ready);
  const controllerHasDeck =
    isLimitedRoom ||
    !!room.players.find((player) => player.username === controllerName)?.selected_deck_name;
  const canStart =
    room.status === "Lobby" &&
    !needsFormat &&
    allOtherPlayersReady &&
    controllerHasDeck &&
    room.players.every(
      (player) => player.connected && (isOpenFormat || !!player.selected_deck_name),
    );
  const needsDeck = !isOpenFormat && !myPlayer?.selected_deck_name;
  const readyCount = room.players.filter(
    (player) => player.ready || (!autoStart && player.username === controllerName),
  ).length;
  const openSeats = room.max_players - room.players.length;
  const requiredPlayers = Math.max(0, minReady - room.players.length);
  const modeLabel = room.draft_config
    ? (room.draft_config.cube_name ?? room.draft_config.set_code ?? `Draft`)
    : room.sealed_config
      ? (room.sealed_config.cube_name ?? room.sealed_config.set_code ?? `Sealed`)
      : room.format;
  // One plain sentence naming who the start is waiting on, so nobody has to
  // work out why Start is greyed out.
  function nameList(names: string[]): string {
    const shown = names.map((name) => (name === username ? `you` : stripUsernameTag(name)));
    if (shown.length <= 1) return shown.join(``);
    return `${shown.slice(0, -1).join(`, `)} and ${shown[shown.length - 1]}`;
  }
  const humans = room.players.filter((player) => !player.is_bot);
  const offline = humans.filter((player) => !player.connected).map((player) => player.username);
  const deckless = isOpenFormat
    ? []
    : room.players.filter((player) => !player.selected_deck_name).map((player) => player.username);
  const notReady = humans
    .filter((player) => player.username !== controllerName && !player.ready)
    .filter((player) => !deckless.includes(player.username))
    .map((player) => player.username);
  const waitingOn: string | null =
    room.status !== "Lobby"
      ? null
      : needsFormat
        ? `Waiting on ${controllerName === username ? `you` : stripUsernameTag(controllerName ?? `the host`)} to choose a format.`
        : requiredPlayers > 0
          ? `Waiting for ${requiredPlayers} more ${requiredPlayers === 1 ? `player` : `players`} to sit down.`
          : offline.length > 0
            ? `Waiting on ${nameList(offline)} to reconnect.`
            : deckless.length > 0
              ? `Waiting on ${nameList(deckless)} to pick a deck.`
              : notReady.length > 0
                ? `Waiting on ${nameList(notReady)} to ready up.`
                : autoStart
                  ? `Everyone is ready. Starting now.`
                  : isController
                    ? `Everyone is ready. Start when you like.`
                    : `Everyone is ready. Waiting on ${stripUsernameTag(controllerName ?? `the host`)} to start.`;
  const canChooseDeck = !isOpenFormat && room.status === "Lobby" && !!deckSelection;
  const onInvitePlayer =
    room.status === "Lobby" && openSeats > 0 && invitesEnabled
      ? () => setInviting(true)
      : undefined;
  function renderPrimaryAction() {
    if (room.status !== "Lobby") {
      return (
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-center sm:text-right">
          <p className="text-ui-label font-medium text-primary">Game in progress</p>
          <p className="text-ui-meta text-muted-foreground">Opening the game table...</p>
        </div>
      );
    }
    if (needsFormat) {
      return (
        <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-2.5 text-center sm:text-right">
          <p className="text-ui-label font-medium">Choose a format</p>
          <p className="text-ui-meta text-muted-foreground">Select a format above to continue.</p>
        </div>
      );
    }
    if (needsDeck) {
      return (
        <Button variant="primary" size="lg" disabled className="w-full sm:w-auto">
          {isController ? "Start game" : "Ready up"}
        </Button>
      );
    }
    if (!isController && myPlayer && !myPlayer.ready) {
      return (
        <Button
          variant="primary"
          size="lg"
          onClick={() => onSetReady(true)}
          disabled={deckSelection?.busy}
          className="w-full sm:w-auto"
        >
          Ready up
        </Button>
      );
    }
    if (!isController && myPlayer?.ready) {
      return (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
          <div>
            <p className="text-ui-label font-medium text-primary">You're ready</p>
            <p className="text-ui-meta text-muted-foreground">
              You can unready until the game starts.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSetReady(false)}
            disabled={deckSelection?.busy}
            className="rounded-sm text-ui-meta text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:no-underline"
          >
            Unready
          </button>
        </div>
      );
    }
    if (isController && canStart) {
      if (room.draft_config && onStartDraft) {
        return (
          <Button
            variant="primary"
            size="lg"
            onClick={onStartDraft}
            disabled={startingLimited}
            className="w-full sm:w-auto"
          >
            <Swords /> {startingLimited ? `Starting...` : `Start draft`}
          </Button>
        );
      }
      if (room.sealed_config && onStartSealed) {
        return (
          <Button
            variant="primary"
            size="lg"
            onClick={onStartSealed}
            disabled={startingLimited}
            className="w-full sm:w-auto"
          >
            <Swords /> {startingLimited ? `Starting...` : `Start sealed`}
          </Button>
        );
      }
      return (
        <Button
          variant="primary"
          size="lg"
          onClick={onStartGame}
          disabled={startingGame || deckSelection?.busy}
          className="w-full sm:w-auto"
        >
          <Swords /> {startingGame ? `Starting...` : `Start game`}
        </Button>
      );
    }
    return (
      <Button
        variant="primary"
        size="lg"
        disabled
        title={waitingOn ?? undefined}
        className="w-full sm:w-auto"
      >
        <Swords /> {isController ? `Start game` : `Ready up`}
      </Button>
    );
  }
  return (
    <div className="flex h-full min-h-0 flex-col px-4 py-3 sm:px-6 lg:px-8">
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-card/85">
        <TableRoomHeader
          room={room}
          roomPassword={roomPassword}
          modeLabel={modeLabel}
          isController={isController}
          isLimitedRoom={isLimitedRoom}
          onSetFormat={onSetFormat}
          onSetMaxPlayers={onSetMaxPlayers}
        />
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="flex min-h-64 flex-1 items-center justify-center p-4 [container-type:size] sm:p-6">
            <OpenTableSeats
              players={room.players}
              maxPlayers={room.max_players}
              showSeatLabels
              openFormat={isOpenFormat}
              youUsername={username}
              removableBots={isController && room.status === "Lobby" ? mySpawnedBots : []}
              onRemoveBot={deckSelection?.busy ? undefined : onRemoveBot}
              selectedUsername={canChooseDeck ? deckSelection?.selectedUsername : undefined}
              onSelectSeat={
                canChooseDeck && !deckSelection?.busy ? deckSelection?.onSelectSeat : undefined
              }
              onAddBot={
                canChooseDeck && isController && !deckSelection?.busy ? onAddBot : undefined
              }
              onInvitePlayer={onInvitePlayer}
              size="room"
              className="w-[min(100%,160cqh)] max-w-none"
              backgroundUrl={boardBackgroundUrl(room.table_style)}
              centerContent={
                <span className="flex flex-col items-center gap-1">
                  <span className="font-serif text-lg font-semibold text-foreground/90 sm:text-xl">
                    {modeLabel}
                  </span>
                  <span className="text-ui-meta font-medium text-muted-foreground">
                    {readyCount} of {room.players.length} ready
                  </span>
                </span>
              }
            />
          </div>
          {canChooseDeck && isController && (
            <p className="px-3 pb-3 text-center text-ui-meta text-muted-foreground">
              Select a bot to choose its deck. Hover or tap + for seat actions.
            </p>
          )}
        </div>
        {waitingOn && (
          <p
            role="status"
            className="border-t px-4 py-2.5 text-center text-ui-label text-muted-foreground sm:px-6"
          >
            {waitingOn}
          </p>
        )}
        <footer className="flex shrink-0 flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 flex-wrap items-center gap-3 sm:flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLeaveRoom}
              className="order-last text-muted-foreground hover:text-destructive sm:order-none"
            >
              <LogOut /> Leave table
            </Button>
            {canChooseDeck ? (
              <Button
                variant="outline"
                size="lg"
                onClick={() => username && deckSelection?.onSelectSeat(username)}
                disabled={deckSelection?.busy}
                className="w-full min-w-0 sm:w-auto sm:max-w-sm"
              >
                <LibraryBig />
                <span className="truncate">{myPlayer?.selected_deck_name ?? "Choose deck"}</span>
              </Button>
            ) : (
              <div className="min-w-0 sm:flex-1">
                <span className="block text-ui-meta text-muted-foreground">Your deck</span>
                <span className="block truncate text-ui-label font-medium">
                  {isOpenFormat
                    ? "Ready when you are"
                    : (myPlayer?.selected_deck_name ?? "Choose your deck")}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {renderPrimaryAction()}
          </div>
        </footer>
      </section>
      <InvitePlayersDialog open={inviting && !!onInvitePlayer} onClose={() => setInviting(false)} />
    </div>
  );
}
