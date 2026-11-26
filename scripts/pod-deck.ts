#!/usr/bin/env node
// Pod deck importer for the Prawnstars pod shelf (public/pod_decks/).
//
// Usage:
//   yarn pod-deck --owner=Tal --file=path/to/decklist.txt [--label=...] [--desc=...] [--slug=...]
//   yarn pod-deck --owner=Sam --url=<moxfield-or-archidekt-url> [--label=...] [--desc=...]
//   yarn pod-deck --remove=<slug>
//
// Text files use the usual export format ("1 Sol Ring (C21) 263"), with the
// commander under a "Commander" or "// COMMANDER" header. Card data (images,
// types, rules text) is fetched from Scryfall at import time, so the app never
// needs a live lookup. Re-running the same command updates the deck, and every
// player who has it synced gets the new version on their next load.

import { readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { fetchDeckBySource, parseDeckListText, parseDeckUrl } from "../src/lib/deckImport.ts";

const NL = String.fromCharCode(10);
const EM_DASH = String.fromCharCode(0x2014);
const POD_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..", "public/pod_decks");
const SCRYFALL_API = "https://api.scryfall.com";
const SCRYFALL_HEADERS = {
  "User-Agent": "PrawnstarsMTG/0.1",
  Accept: "application/json",
  "Content-Type": "application/json",
};
const BATCH_SIZE = 75;

interface ListEntry {
  name: string;
  count: number;
  set?: string;
  cardNumber?: string;
  commander: boolean;
  side: boolean;
}

// Minimal view of the Scryfall card fields this script reads.
interface ScryfallFace {
  name: string;
  mana_cost?: string;
  type_line?: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
  colors?: string[];
  image_uris?: Record<string, string>;
}
interface ScryfallCard extends ScryfallFace {
  set: string;
  collector_number: string;
  layout?: string;
  cmc?: number;
  color_identity?: string[];
  card_faces?: ScryfallFace[];
  all_parts?: Array<{ name: string; component: string }>;
}

function readArg(name: string): string {
  const prefix = `--${name}=`;
  const hit = process.argv.slice(2).find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length).trim() : "";
}

function fail(message: string): never {
  console.error(`pod-deck: ${message}`);
  process.exit(1);
}

function slugify(str: string): string {
  return (
    str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 60) || "deck"
  );
}

const COLOR_CLASS: Record<string, string> = {
  W: "text-yellow-200",
  U: "text-blue-400",
  B: "text-zinc-400",
  R: "text-red-400",
  G: "text-green-400",
};

function pickColor(colors: string[]): string {
  if (colors.length === 0) return "text-gray-400";
  if (colors.length === 1) return COLOR_CLASS[colors[0]] ?? "text-gray-400";
  return "text-amber-300";
}

const SUPERTYPES = new Set([
  "Basic",
  "Legendary",
  "Snow",
  "World",
  "Ongoing",
  "Tribal",
  "Elite",
  "Host",
  "Token",
]);

function parseTypeLine(typeLine: string) {
  const [main = "", ...subParts] = typeLine.split(EM_DASH).map((s) => s.trim());
  const subtypes = subParts.join(" ").split(" ").filter(Boolean);
  const supertypes: string[] = [];
  const types: string[] = [];
  for (const token of main.split(" ").filter(Boolean)) {
    if (SUPERTYPES.has(token)) supertypes.push(token);
    else types.push(token);
  }
  return { supertypes, types, subtypes };
}

function imageUris(img: Record<string, string> | undefined) {
  return {
    small: img?.small ?? "",
    normal: img?.normal ?? "",
    large: img?.large ?? "",
    png: img?.png ?? "",
    art_crop: img?.art_crop ?? "",
    border_crop: img?.border_crop ?? "",
  };
}

function toPresetCard(entry: ListEntry, sc: ScryfallCard) {
  const front = sc.card_faces?.[0] ?? sc;
  const back = sc.card_faces?.[1];
  const { supertypes, types, subtypes } = parseTypeLine(front.type_line ?? sc.type_line ?? "");
  const card: Record<string, unknown> = {
    name: sc.name,
    count: entry.count,
    set: sc.set,
    cardNumber: sc.collector_number,
    manaCost: front.mana_cost ?? sc.mana_cost ?? "",
    colors: sc.colors ?? front.colors ?? [],
    colorIdentity: sc.color_identity ?? [],
    cmc: sc.cmc ?? 0,
    types,
    subtypes,
    supertypes,
    text: front.oracle_text ?? sc.oracle_text ?? "",
    layout: sc.layout ?? "normal",
    power: front.power ?? sc.power,
    toughness: front.toughness ?? sc.toughness,
    uris: imageUris(sc.image_uris ?? front.image_uris),
    allParts: (sc.all_parts ?? []).map((p) => ({ name: p.name, component: p.component })),
  };
  if (back?.image_uris) {
    card.backFace = {
      name: back.name,
      manaCost: back.mana_cost ?? "",
      typeLine: back.type_line ?? "",
      oracleText: back.oracle_text ?? "",
      power: back.power,
      toughness: back.toughness,
      uris: imageUris(back.image_uris),
    };
  }
  return card;
}

function lookupKeys(name: string, set?: string, cardNumber?: string): string[] {
  const n = name.split(" // ")[0].trim().toLowerCase();
  const s = (set ?? "").toLowerCase();
  const c = (cardNumber ?? "").toLowerCase();
  return [`${n}::${s}::${c}`, `${n}::${s}::`, `${n}::::`];
}

async function fetchScryfall(entries: ListEntry[]): Promise<Map<string, ScryfallCard>> {
  const found = new Map<string, ScryfallCard>();
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const identifiers = entries.slice(i, i + BATCH_SIZE).map((e) => {
      const name = e.name.split(" // ")[0].trim();
      const set = e.set?.toLowerCase();
      if (set && e.cardNumber) return { set, collector_number: e.cardNumber.toLowerCase() };
      return set ? { name, set } : { name };
    });
    const res = await fetch(`${SCRYFALL_API}/cards/collection`, {
      method: "POST",
      headers: SCRYFALL_HEADERS,
      body: JSON.stringify({ identifiers }),
    });
    if (!res.ok) fail(`Scryfall returned ${res.status}`);
    const body = (await res.json()) as { data: ScryfallCard[] };
    for (const sc of body.data) {
      const names = [sc.name, ...(sc.card_faces ?? []).map((f) => f.name)];
      for (const name of names) {
        for (const key of lookupKeys(name, sc.set, sc.collector_number)) {
          if (!found.has(key)) found.set(key, sc);
        }
      }
    }
    // Scryfall asks clients to wait 50 to 100 ms between requests.
    await new Promise((r) => setTimeout(r, 120));
  }
  return found;
}

async function readEntries(): Promise<{
  entries: ListEntry[];
  sourceName: string;
  sourceDesc: string;
}> {
  const file = readArg("file");
  const url = readArg("url");
  if (file) {
    // Drop carriage returns and the etched-foil marker, which the shared parser
    // does not know and would otherwise leave stuck to the card name.
    const text = (await readFile(file, "utf8"))
      .split(String.fromCharCode(13))
      .join("")
      .split(" *E*")
      .join("");
    const entries = parseDeckListText(text)
      .filter((e) => !e.maybe)
      .map((e) => ({
        name: e.name,
        count: e.count,
        set: e.setCode,
        cardNumber: e.collectorNumber,
        commander: e.commander || e.commanderCandidate === true,
        side: e.side,
      }));
    return { entries, sourceName: "", sourceDesc: "" };
  }
  if (url) {
    const parsed = parseDeckUrl(url);
    if (!parsed) fail(`not a Moxfield or Archidekt deck link: ${url}`);
    const deck = await fetchDeckBySource(parsed.source, parsed.id);
    const entries: ListEntry[] = [
      ...deck.commanders.map((c) => ({ ...c, commander: true, side: false })),
      ...deck.cards.map((c) => ({ ...c, commander: false, side: false })),
    ].filter((c) => c.name && c.count > 0);
    return { entries, sourceName: deck.name, sourceDesc: deck.description.split(NL)[0] ?? "" };
  }
  fail("pass --file=<decklist.txt> or --url=<deck link>");
}

async function rebuildIndex(): Promise<string[]> {
  const ids = (await readdir(POD_DIR))
    .filter((f) => f.endsWith(".json") && f !== "index.json")
    .map((f) => f.slice(0, -".json".length))
    .sort();
  await writeFile(join(POD_DIR, "index.json"), JSON.stringify(ids, null, 2) + NL, "utf8");
  return ids;
}

async function main() {
  const remove = readArg("remove");
  if (remove) {
    await unlink(join(POD_DIR, `${slugify(remove)}.json`));
    await rebuildIndex();
    console.log(`Removed ${remove}`);
    return;
  }

  const owner = readArg("owner");
  if (!owner) fail("--owner=<player name> is required");
  const { entries, sourceName, sourceDesc } = await readEntries();
  if (entries.length === 0) fail("no card lines found in the deck list");

  const describe = (e: ListEntry) =>
    `${e.count} ${e.name}${e.set ? ` (${e.set.toUpperCase()})` : ""}`;
  const find = (lookup: Map<string, ScryfallCard>, e: ListEntry) =>
    lookupKeys(e.name, e.set, e.cardNumber)
      .map((k) => lookup.get(k))
      .find(Boolean);
  const lookup = await fetchScryfall(entries);
  // Some printings (The List, promos) do not resolve from set code alone. Fall
  // back to the card's default printing rather than failing the whole deck.
  const unmatched = entries.filter((e) => !find(lookup, e));
  const fallback =
    unmatched.length > 0
      ? await fetchScryfall(unmatched.map((e) => ({ ...e, set: undefined, cardNumber: undefined })))
      : new Map<string, ScryfallCard>();
  const missing: string[] = [];
  const reprinted: string[] = [];
  const resolved = entries.map((entry) => {
    let sc = find(lookup, entry);
    if (!sc) {
      sc = find(fallback, { ...entry, set: undefined, cardNumber: undefined });
      if (sc)
        reprinted.push(`${describe(entry)} -> ${sc.set.toUpperCase()} ${sc.collector_number}`);
    }
    if (!sc) missing.push(describe(entry));
    return { entry, sc };
  });
  if (reprinted.length > 0) {
    console.warn(
      `  Exact printing not found; used the default printing for:${NL}    ${reprinted.join(`${NL}    `)}`,
    );
  }
  if (missing.length > 0) {
    fail(
      `Scryfall could not match ${missing.length} card(s); fix them and re-run:${NL}  ${missing.join(`${NL}  `)}`,
    );
  }

  const commanders = resolved.filter((r) => r.entry.commander);
  const commanderNames = commanders.map((r) => r.sc!.name);
  const label = readArg("label") || commanderNames.join(" / ") || sourceName || "Untitled deck";
  const identity = [...new Set(commanders.flatMap((r) => r.sc!.color_identity ?? []))];
  const preset: Record<string, unknown> = {
    label,
    desc: readArg("desc") || sourceDesc,
    color: pickColor(identity),
    format: commanders.length > 0 ? "commander" : "standard",
    owner,
    ai_eligible: false,
    cards: resolved.filter((r) => !r.entry.side).map((r) => toPresetCard(r.entry, r.sc!)),
  };
  const sideboard = resolved.filter((r) => r.entry.side).map((r) => toPresetCard(r.entry, r.sc!));
  if (sideboard.length > 0) preset.sideboard = sideboard;
  if (commanderNames.length > 0) preset.commander = commanderNames[0];
  if (commanderNames.length > 1) preset.partners = commanderNames;

  const slug = slugify(readArg("slug") || `${owner}_${label}`);
  await writeFile(join(POD_DIR, `${slug}.json`), JSON.stringify(preset, null, 2) + NL, "utf8");
  const ids = await rebuildIndex();

  const total = resolved.reduce((sum, r) => sum + r.entry.count, 0);
  console.log(`Saved ${label} for ${owner}: ${total} cards -> public/pod_decks/${slug}.json`);
  if (commanders.length > 0 && total !== 100) {
    console.warn(`  note: a Commander deck should have 100 cards; this one has ${total}.`);
  }
  console.log(`  ${ids.length} deck(s) on the pod shelf.`);
}

main().catch((err) => fail(err instanceof Error ? err.message : String(err)));
