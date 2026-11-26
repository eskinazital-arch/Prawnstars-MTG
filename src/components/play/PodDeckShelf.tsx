import { useEffect, useMemo, useState } from "react";
import { DeckGridCard } from "@/components/deck/DeckGridCard";
import { CollapsibleDeckShelf } from "@/components/play/CollapsibleDeckShelf";
import { DECK_SHELF_CARD_CLASS, DeckShelfRow } from "@/components/play/DeckShelfRow";
import { AppSelect, AppSelectOption } from "@/components/ui/AppSelect";
import { podDeckKey, podOwners, type PodDeck } from "@/lib/podDecks";
import { startPodDeckSync, usePodDecksStore } from "@/stores/usePodDecksStore";
import { getGroupKey } from "@/lib/groupKey";
import { ShareDecksDialog } from "@/components/play/ShareDecksDialog";
import { memberDisplayName, memberFromKey } from "@/lib/podMembers";

interface PodDeckShelfProps {
  pendingDeckId: string | null;
  onOpenSavedDeck: (savedDeckId: string) => void;
  onPlayDeck: (deck: PodDeck) => void;
}

export function PodDeckShelf({ pendingDeckId, onOpenSavedDeck, onPlayDeck }: PodDeckShelfProps) {
  const decks = usePodDecksStore((state) => state.decks);
  const resolved = usePodDecksStore((state) => state.resolved);
  const me = usePodDecksStore((state) => state.me);
  const setMe = usePodDecksStore((state) => state.setMe);
  const addToMyDecks = usePodDecksStore((state) => state.addToMyDecks);
  const [open, setOpen] = useState(true);
  const [sharing, setSharing] = useState(false);
  const keyMember = memberFromKey(getGroupKey());

  useEffect(() => startPodDeckSync(), []);

  const owners = useMemo(() => podOwners(decks), [decks]);
  if (resolved && decks.length === 0) return null;
  const orderedOwners =
    me && owners.includes(me) ? [me, ...owners.filter((o) => o !== me)] : owners;

  return (
    <CollapsibleDeckShelf
      title={`Prawnstars Pod`}
      count={resolved ? decks.length : `Loading…`}
      open={open}
      onOpenChange={setOpen}
    >
      {keyMember ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-2">
          <p className="text-ui-meta text-muted-foreground">
            Everyone&apos;s decks, playable by anyone. Share yours so the pod can borrow them.
          </p>
          <button
            type="button"
            onClick={() => setSharing(true)}
            className="inline-flex min-h-9 items-center rounded-full bg-primary px-4 text-ui-label font-medium text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Share my decks
          </button>
          <ShareDecksDialog member={keyMember} open={sharing} onOpenChange={setSharing} />
        </div>
      ) : (
        <div className="mb-4 flex flex-wrap items-center gap-2 px-2">
          <label htmlFor="pod-me" className="text-ui-label font-medium">
            {`I'm`}
          </label>
          <AppSelect
            id="pod-me"
            value={me ?? ""}
            onValueChange={(value) => setMe(value || null)}
            className="touch:min-h-11 min-h-9 cursor-pointer rounded-md border bg-background px-2 text-ui-label"
          >
            <AppSelectOption value="">Pick your name</AppSelectOption>
            {owners.map((owner) => (
              <AppSelectOption key={owner} value={owner}>
                {memberDisplayName(owner)}
              </AppSelectOption>
            ))}
          </AppSelect>
          <span className="text-ui-meta text-muted-foreground">
            {me
              ? `Your decks are on your shelf and stay in sync with the pod.`
              : `Pick your name and your decks land on your shelf, ready to play.`}
          </span>
        </div>
      )}
      <div className="space-y-4">
        {orderedOwners.map((owner) => (
          <DeckShelfRow
            key={owner}
            label={owner === me ? `${memberDisplayName(owner)} (you)` : memberDisplayName(owner)}
          >
            {decks
              .filter((deck) => deck.owner === owner)
              .map((deck) => {
                const id = podDeckKey(deck);
                return (
                  <div key={`pod:${id}`} className={DECK_SHELF_CARD_CLASS}>
                    <DeckGridCard
                      deck={{ id, deck, savedAt: 0 }}
                      onOpen={() => onOpenSavedDeck(addToMyDecks(deck))}
                      onPlay={() => onPlayDeck(deck)}
                      badge={owner === me ? `Your deck` : `${memberDisplayName(owner)}'s deck`}
                      engines={deck.engines}
                      playing={pendingDeckId === id}
                      playDisabled={pendingDeckId !== null}
                      readOnly
                    />
                  </div>
                );
              })}
          </DeckShelfRow>
        ))}
      </div>
    </CollapsibleDeckShelf>
  );
}
