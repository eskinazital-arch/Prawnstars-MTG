// The club's other deck sources, next to the static pod shelf (podDecks.ts):
// - decks members share from the app, kept on the PC's relay (/pod-api),
// - the cEDH meta shelf built by scripts/cedh-meta.py (public/cedh_decks/),
// - Archidekt community decks, reached through Caddy's /archidekt-api proxy.
import type { Deck } from "@/protocol/deck";
import { getGroupKey } from "@/lib/groupKey";
import { loadPresetDeckDefinitions } from "@/lib/presetDecks";
import { expandPodDeckDefinition, type PodDeck, type PodDeckDefinition } from "@/lib/podDecks";
import type { FetchFn } from "@/lib/archidekt";

const SHARED_API = "/pod-api/decks";
const TITLE_PREFIX = /^Cuckold +/;

interface SharedDeckRecord {
  id: string;
  owner: string;
  savedAt: number;
  deck: Deck;
}

// FNV-1a over the card list, so a re-shared deck refreshes synced copies.
function fingerprintOf(deck: Deck): string {
  const text = JSON.stringify(
    [...(deck.commanders ?? []), ...deck.cards].map((c) => c.identity.name),
  );
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

export async function fetchSharedPodDecks(): Promise<PodDeck[]> {
  const res = await fetch(SHARED_API, { cache: "no-store" });
  if (!res.ok) return [];
  const records = (await res.json()) as SharedDeckRecord[];
  return records
    .filter((record) => record?.deck && Array.isArray(record.deck.cards))
    .map((record) => ({
      ...record.deck,
      id: `shared:${record.id}`,
      owner: record.owner.replace(TITLE_PREFIX, ""),
      fingerprint: fingerprintOf(record.deck),
      shared: true,
      sharedId: record.id,
    }));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function sharedDeckId(member: string, deckName: string): string {
  return slugify(`${member}-${deckName}`) || slugify(member);
}

async function sharedRequest(method: "PUT" | "DELETE", id: string, body?: unknown) {
  const key = getGroupKey();
  const res = await fetch(`${SHARED_API}/${encodeURIComponent(id)}`, {
    method,
    headers: { "Content-Type": "application/json", "x-club-key": key ?? "" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(detail?.error ?? `The server said no (${res.status}).`);
  }
}

/** Puts a deck on the pod shelf under the signed-in member's name. */
export async function shareDeckWithPod(member: string, deck: Deck): Promise<void> {
  // Saved decks can carry editor-only extras; the shelf needs the list itself.
  const { editor: _editor, ...rest } = deck;
  await sharedRequest("PUT", sharedDeckId(member, deck.name), { deck: rest });
}

export async function unshareDeck(sharedId: string): Promise<void> {
  await sharedRequest("DELETE", sharedId);
}

export const CEDH_INDEX_URL = "/cedh_decks/index.json";
export const CEDH_BASE_URL = "/cedh_decks";

/** The cEDH meta shelf, in EDHTop16 rank order. */
export async function loadCedhDecks(): Promise<PodDeck[]> {
  const definitions = (await loadPresetDeckDefinitions(
    CEDH_INDEX_URL,
    CEDH_BASE_URL,
  )) as PodDeckDefinition[];
  const decks: PodDeck[] = [];
  for (const definition of definitions) {
    try {
      decks.push(expandPodDeckDefinition(definition));
    } catch (err) {
      console.warn(`[cEDH] Skipping '${definition.id}':`, err);
    }
  }
  return decks;
}

/** Archidekt's API sends no CORS headers, so the browser goes through Caddy. */
export const archidektFetch: FetchFn = (input, init) =>
  fetch(String(input).replace("https://archidekt.com/api/", "/archidekt-api/"), {
    signal: init?.signal,
  });
