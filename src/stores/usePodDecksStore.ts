import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { reserveGuestName } from "@/lib/guestName";
import { getGroupKey } from "@/lib/groupKey";
import { memberDisplayName, memberFromKey } from "@/lib/podMembers";
import { loadPodDecks, podDeckKey, type PodDeck } from "@/lib/podDecks";
import { useDeckStore } from "@/stores/useDeckStore";
import { usePreferencesStore } from "@/stores/usePreferencesStore";

/**
 * The pod name doubles as this player's name on the relay, so seats, the
 * player list and chat show "Cuckold Tal" rather than a generated handle.
 */
function applyRelayName(owner: string): void {
  const name = memberDisplayName(owner);
  if (usePreferencesStore.getState().serverUsername === name) return;
  void reserveGuestName(name).catch((err) => {
    console.warn("[PodDecks] could not use the pod name on the relay:", err);
  });
}

/** Which saved deck in My Decks is this player's copy of a pod deck. */
interface PodDeckLink {
  savedDeckId: string;
  fingerprint: string;
}

interface PodDecksState {
  decks: PodDeck[];
  resolved: boolean;
  /** The pod member using this browser; their decks stay synced into My Decks. */
  me: string | null;
  links: Record<string, PodDeckLink>;
  prefetch: () => Promise<void>;
  setMe: (owner: string | null) => void;
  /** Copies a pod deck into My Decks (or refreshes the copy) and returns its saved id. */
  addToMyDecks: (deck: PodDeck) => string;
  syncMine: () => void;
}

let prefetchPromise: Promise<void> | null = null;

function deckStoreHydrated(): boolean {
  return useDeckStore.persist.hasHydrated();
}

export const usePodDecksStore = create<PodDecksState>()(
  persist(
    (set, get) => ({
      decks: [],
      resolved: false,
      me: null,
      links: {},
      prefetch: () => {
        if (prefetchPromise) return prefetchPromise;
        prefetchPromise = (async () => {
          try {
            set({ decks: await loadPodDecks(), resolved: true });
          } catch (err) {
            set({ resolved: true });
            if (import.meta.env?.DEV) console.warn("[usePodDecks] prefetch failed:", err);
          }
          get().syncMine();
        })();
        return prefetchPromise;
      },
      setMe: (owner) => {
        set({ me: owner });
        get().syncMine();
        if (owner) applyRelayName(owner);
      },
      addToMyDecks: (deck) => {
        const key = podDeckKey(deck);
        const deckStore = useDeckStore.getState();
        const link = get().links[key];
        if (link && deckStore.savedDecks.some((saved) => saved.id === link.savedDeckId)) {
          if (link.fingerprint === deck.fingerprint) return link.savedDeckId;
          // The pod file changed: replace the old copy with the new list.
          deckStore.deleteSavedDeck(link.savedDeckId);
        }
        const { owner: _owner, fingerprint: _fingerprint, engines: _engines, ...editorDeck } = deck;
        const savedDeckId = deckStore.addSavedDeck({ ...editorDeck, id: undefined });
        set((state) => ({
          links: { ...state.links, [key]: { savedDeckId, fingerprint: deck.fingerprint } },
        }));
        return savedDeckId;
      },
      syncMine: () => {
        const { me, decks, resolved, addToMyDecks } = get();
        // Writing before My Decks loads from storage would be dropped or clobbered.
        if (!me || !resolved || !deckStoreHydrated()) return;
        for (const deck of decks) {
          if (deck.owner === me) addToMyDecks(deck);
        }
      },
    }),
    {
      name: "prawnstars-pod-decks",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ me: state.me, links: state.links }),
    },
  ),
);

/** Loads the pod shelf and keeps this player's decks synced once My Decks is ready. */
export function startPodDeckSync(): () => void {
  // A member password decides who you are; the shelf picker is only for
  // browsers that came in on the shared server key.
  const keyMember = memberFromKey(getGroupKey());
  if (keyMember && usePodDecksStore.getState().me !== keyMember) {
    usePodDecksStore.setState({ me: keyMember });
  }
  const me = usePodDecksStore.getState().me;
  if (me) applyRelayName(me);
  void usePodDecksStore.getState().prefetch();
  usePodDecksStore.getState().syncMine();
  return useDeckStore.persist.onFinishHydration(() => usePodDecksStore.getState().syncMine());
}
