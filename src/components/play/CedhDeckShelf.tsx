import { useState } from "react";
import { DeckGridCard } from "@/components/deck/DeckGridCard";
import { CollapsibleDeckShelf } from "@/components/play/CollapsibleDeckShelf";
import { DECK_SHELF_CARD_CLASS, DeckShelfRow } from "@/components/play/DeckShelfRow";
import { podDeckKey, type PodDeck } from "@/lib/podDecks";
import { usePodDecksStore } from "@/stores/usePodDecksStore";

/**
 * The cEDH meta shelf: the top commanders on EDHTop16 with a real tournament
 * list for each, built by scripts/cedh-meta.py. Each deck's description names
 * its rank and the event it came from.
 */
export function CedhDeckShelf({
  pendingDeckId,
  onOpenSavedDeck,
  onPlayDeck,
}: {
  pendingDeckId: string | null;
  onOpenSavedDeck: (savedDeckId: string) => void;
  onPlayDeck: (deck: PodDeck) => void;
}) {
  const decks = usePodDecksStore((state) => state.cedh);
  const addToMyDecks = usePodDecksStore((state) => state.addToMyDecks);
  const [open, setOpen] = useState(false);
  if (decks.length === 0) return null;
  return (
    <CollapsibleDeckShelf
      title={`cEDH meta, top ${decks.length}`}
      count={decks.length}
      open={open}
      onOpenChange={setOpen}
    >
      <p className="mb-4 px-2 text-ui-meta text-muted-foreground">
        The most played commanders in cEDH tournaments over the last six months (EDHTop16, events of
        50+ players), each with a list played at a real tournament. Bracket 5: expect fast combo.
      </p>
      <DeckShelfRow label={`Ranked by meta share`}>
        {decks.map((deck, index) => {
          const id = podDeckKey(deck);
          return (
            <div key={`cedh:${id}`} className={DECK_SHELF_CARD_CLASS}>
              <DeckGridCard
                deck={{ id, deck, savedAt: 0 }}
                onOpen={() => onOpenSavedDeck(addToMyDecks(deck))}
                onPlay={() => onPlayDeck(deck)}
                badge={`#${index + 1} cEDH`}
                engines={deck.engines}
                playing={pendingDeckId === id}
                playDisabled={pendingDeckId !== null}
                readOnly
              />
            </div>
          );
        })}
      </DeckShelfRow>
    </CollapsibleDeckShelf>
  );
}
