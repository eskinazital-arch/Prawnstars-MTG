import { useEffect, useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { CollapsibleDeckShelf } from "@/components/play/CollapsibleDeckShelf";
import { useDeckTextImport } from "@/components/editor/useDeckTextImport";
import { archidektFetch } from "@/lib/clubDecks";
import { fetchArchidektDeck, searchArchidekt, type ArchidektSearchResult } from "@/lib/archidekt";
import { parseDeckListText } from "@/lib/deckImport";
import { cn } from "@/lib/utils";

const BRACKETS = [1, 2, 3, 4, 5] as const;
const DEFAULT_BRACKETS = [3, 4];
const NL = String.fromCharCode(10);

/**
 * Public Commander decks from Archidekt, filtered by the owner's own bracket
 * rating (3 and 4 by default, where the pod plays). Adding one imports it into
 * My Decks, where it can be played, edited or shared with the pod.
 */
export function ArchidektDeckShelf({ onOpenSavedDeck }: { onOpenSavedDeck: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [brackets, setBrackets] = useState<number[]>(DEFAULT_BRACKETS);
  const [results, setResults] = useState<ArchidektSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const importDeckText = useDeckTextImport();

  async function search(text: string, picked: number[]) {
    setLoading(true);
    try {
      const pages = await Promise.all(
        (picked.length > 0 ? picked : DEFAULT_BRACKETS).map((bracket) =>
          searchArchidekt(text, {
            fetch: archidektFetch,
            formatId: "commander",
            bracket,
            pageSize: 30,
          }),
        ),
      );
      // Interleave the brackets so one does not bury the other.
      const merged: ArchidektSearchResult[] = [];
      for (let i = 0; i < Math.max(...pages.map((p) => p.length)); i += 1) {
        for (const page of pages) if (page[i]) merged.push(page[i]);
      }
      setResults(merged.slice(0, 40));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Archidekt did not answer.`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open && results.length === 0 && !loading) void search("", brackets);
    // Only the first open loads; later searches come from the form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function toggleBracket(bracket: number) {
    const next = brackets.includes(bracket)
      ? brackets.filter((b) => b !== bracket)
      : [...brackets, bracket].sort();
    setBrackets(next);
    void search(query, next);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void search(query, brackets);
  }

  async function add(result: ArchidektSearchResult) {
    setAdding(result.id);
    try {
      const deck = await fetchArchidektDeck(result.id, { fetch: archidektFetch });
      const text = [
        `Commander`,
        ...deck.commanders.map((c) => `${c.count} ${c.name}`),
        ``,
        `Deck`,
        ...deck.cards.map((c) => `${c.count} ${c.name}`),
      ].join(NL);
      const id = await importDeckText(parseDeckListText(text), deck.name, "commander", () => {});
      toast.success(`${deck.name} is in your decks.`);
      onOpenSavedDeck(id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Could not import that deck.`);
    } finally {
      setAdding(null);
    }
  }

  return (
    <CollapsibleDeckShelf
      title={`Community decks`}
      count={results.length || `Archidekt`}
      open={open}
      onOpenChange={setOpen}
    >
      <div className="space-y-4 px-2">
        <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-56 flex-1">
            <span className="sr-only">Search community decks</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by deck or commander name"
              className="h-10 w-full rounded-full border border-input bg-background pl-9 pr-4 text-ui-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <span className="text-ui-meta text-muted-foreground">Bracket</span>
          {BRACKETS.map((bracket) => (
            <button
              key={bracket}
              type="button"
              aria-pressed={brackets.includes(bracket)}
              onClick={() => toggleBracket(bracket)}
              className={cn(
                "h-9 min-w-9 rounded-full border px-3 text-ui-label font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                brackets.includes(bracket)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-muted",
              )}
            >
              {bracket}
            </button>
          ))}
        </form>
        <p className="text-ui-meta text-muted-foreground">
          Most viewed Commander decks on Archidekt. Brackets are what each deck&apos;s owner says,
          so treat them as a guide.
        </p>
        {loading ? (
          <p className="py-4 text-ui-body text-muted-foreground">Looking on Archidekt…</p>
        ) : results.length === 0 ? (
          <p className="py-4 text-ui-body text-muted-foreground">
            No decks found. Try another name.
          </p>
        ) : (
          <ul className="grid gap-x-6 divide-y divide-border md:grid-cols-2 md:divide-y-0">
            {results.map((result) => (
              <li
                key={result.id}
                className="flex items-center justify-between gap-4 border-border py-3 md:border-b"
              >
                <span className="min-w-0">
                  <b className="block truncate font-medium">{result.name}</b>
                  <span className="text-ui-meta text-muted-foreground">
                    {result.bracket ? `Bracket ${result.bracket} · ` : ``}by {result.author}
                  </span>
                </span>
                <button
                  type="button"
                  disabled={adding !== null}
                  onClick={() => void add(result)}
                  className="inline-flex min-h-9 shrink-0 items-center rounded-full border border-border px-4 text-ui-label font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                >
                  {adding === result.id ? `Adding…` : `Add to my decks`}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CollapsibleDeckShelf>
  );
}
