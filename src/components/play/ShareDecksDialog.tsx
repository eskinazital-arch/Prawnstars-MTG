import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sharedDeckId, shareDeckWithPod, unshareDeck } from "@/lib/clubDecks";
import { memberDisplayName } from "@/lib/podMembers";
import { useDeckStore } from "@/stores/useDeckStore";
import { usePodDecksStore } from "@/stores/usePodDecksStore";

const PILL =
  "inline-flex min-h-9 shrink-0 items-center rounded-full px-4 text-ui-label font-medium motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60";

/** Lets a member put their saved decks on the pod shelf, or take them off. */
export function ShareDecksDialog({
  member,
  open,
  onOpenChange,
}: {
  member: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const savedDecks = useDeckStore((state) => state.savedDecks);
  const podDecks = usePodDecksStore((state) => state.decks);
  const refresh = usePodDecksStore((state) => state.refresh);
  const [busy, setBusy] = useState<string | null>(null);
  const sharedIds = new Set(
    podDecks.filter((deck) => deck.shared && deck.owner === member).map((deck) => deck.sharedId),
  );

  async function toggle(savedId: string) {
    const saved = savedDecks.find((entry) => entry.id === savedId);
    if (!saved) return;
    const id = sharedDeckId(member, saved.deck.name);
    setBusy(savedId);
    try {
      if (sharedIds.has(id)) {
        await unshareDeck(id);
        toast.success(`${saved.deck.name} is off the pod shelf.`);
      } else {
        await shareDeckWithPod(member, saved.deck);
        toast.success(`${saved.deck.name} is on the pod shelf for everyone.`);
      }
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Could not update the pod shelf.`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share decks with the pod</DialogTitle>
          <DialogDescription>
            Shared decks show on everyone&apos;s pod shelf as {memberDisplayName(member)}&apos;s,
            and anyone can play them. Share again after editing to update the pod&apos;s copy.
          </DialogDescription>
        </DialogHeader>
        {savedDecks.length === 0 ? (
          <p className="text-ui-body text-muted-foreground">
            You have no saved decks yet. Import or build one first.
          </p>
        ) : (
          <ul className="max-h-[60vh] divide-y divide-border overflow-y-auto">
            {savedDecks.map((saved) => {
              const shared = sharedIds.has(sharedDeckId(member, saved.deck.name));
              return (
                <li key={saved.id} className="flex items-center justify-between gap-4 py-3">
                  <span className="min-w-0">
                    <b className="block truncate font-medium">{saved.deck.name}</b>
                    <span className="text-ui-meta text-muted-foreground">
                      {shared ? `On the pod shelf` : `Only on this browser`}
                    </span>
                  </span>
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void toggle(saved.id)}
                    className={
                      shared
                        ? `${PILL} border border-border hover:bg-muted`
                        : `${PILL} bg-primary text-primary-foreground hover:bg-primary-hover`
                    }
                  >
                    {busy === saved.id ? `Saving…` : shared ? `Unshare` : `Share`}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
