// Prawnstars pod decks: ready-made decks for each player in the group, served
// from public/pod_decks/ in the same JSON shape as preset decks plus an
// `owner`. Add or update one with `yarn pod-deck` (see scripts/pod-deck.ts).
import {
  expandPresetDeckDefinition,
  loadPresetDeckDefinitions,
  type PresetDeck,
  type PresetDeckDefinition,
} from "@/lib/presetDecks";
import { frontFaceName } from "@/lib/scryfall.utils";

export const POD_DECKS_INDEX_URL = "/pod_decks/index.json";
export const POD_DECKS_BASE_URL = "/pod_decks";

export type PodDeckDefinition = PresetDeckDefinition & {
  owner?: string;
  /** Every commander name when the deck has partners; `commander` holds the first. */
  partners?: string[];
};

export type PodDeck = PresetDeck & {
  owner: string;
  /** Changes whenever the deck file's list changes, so synced copies can update. */
  fingerprint: string;
};

// FNV-1a, 32-bit. Only used to notice that a deck file changed.
function hashString(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

export function podDeckFingerprint(definition: PodDeckDefinition): string {
  const list = (entries: PresetDeckDefinition["cards"] | undefined) =>
    (entries ?? []).map((c) => [c.name, c.count, c.set, c.cardNumber]);
  return hashString(
    JSON.stringify({
      label: definition.label,
      commander: definition.commander,
      partners: definition.partners,
      cards: list(definition.cards),
      sideboard: list(definition.sideboard),
    }),
  );
}

export function expandPodDeckDefinition(definition: PodDeckDefinition): PodDeck {
  const [first, ...others] = definition.partners?.length
    ? definition.partners
    : definition.commander
      ? [definition.commander]
      : [];
  const deck = expandPresetDeckDefinition({ ...definition, commander: first });
  // Preset decks support one commander; move any partners into the command zone.
  for (const name of others) {
    const index = deck.cards.findIndex((card) => card.identity.name === frontFaceName(name));
    if (index < 0) continue;
    const [card] = deck.cards.splice(index, 1);
    deck.commanders = [...(deck.commanders ?? []), card];
  }
  return {
    ...deck,
    owner: definition.owner?.trim() || "Pod",
    fingerprint: podDeckFingerprint(definition),
  };
}

export async function loadPodDecks(): Promise<PodDeck[]> {
  const definitions = (await loadPresetDeckDefinitions(
    POD_DECKS_INDEX_URL,
    POD_DECKS_BASE_URL,
  )) as PodDeckDefinition[];
  const decks: PodDeck[] = [];
  for (const definition of definitions) {
    try {
      decks.push(expandPodDeckDefinition(definition));
    } catch (err) {
      console.warn(`[PodDecks] Skipping '${definition.id}':`, err);
    }
  }
  return decks;
}

export function podOwners(decks: PodDeck[]): string[] {
  return [...new Set(decks.map((deck) => deck.owner))].sort((a, b) => a.localeCompare(b));
}

export function podDeckKey(deck: PodDeck): string {
  return deck.id ?? deck.name;
}
