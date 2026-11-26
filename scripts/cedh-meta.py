"""Build the cEDH meta shelf (public/cedh_decks/) from EDHTop16.

For each of the top commanders on edhtop16.com (its default view: popularity,
last 6 months, tournaments of 50+ players) this takes the first decklist the
commander page lists, writes it as a text list and builds it with
`yarn pod-deck --dir=cedh_decks`, which resolves every card on Scryfall.

Usage:  python scripts/cedh-meta.py [--top=10]
Re-run it to refresh the shelf; it replaces the folder's decks.
"""

import html
import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.parse
import urllib.request

NL = chr(10)
SITE = "https://edhtop16.com"
HEADERS = {"User-Agent": "Mozilla/5.0 (club deck shelf)"}
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "cedh_decks")


def get(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=60) as res:
        return res.read().decode("utf-8")


def top_commanders(limit):
    page = get(SITE + "/")
    names = []
    for match in re.finditer(r'href="/commander/([^"]+)"', page):
        name = html.unescape(urllib.parse.unquote(html.unescape(match.group(1))))
        if name not in names:
            names.append(name)
        if len(names) == limit:
            break
    return names


def first_decklist(commander):
    page = get(SITE + "/commander/" + urllib.parse.quote(commander, safe=""))
    match = re.search(r'/tournament/([^"/]+)/decklist/([A-Za-z0-9]+)', page)
    if not match:
        return None
    return match.group(0), match.group(1)


def decklist_items(path):
    page = get(SITE + path)
    start = page.find('"decklistItems":[')
    if start < 0:
        return [], None
    # Walk the JSON array by bracket depth (strings never contain brackets
    # that matter here once escaped quotes are skipped).
    i = page.index("[", start)
    depth, j, in_str, esc = 0, i, False, False
    while j < len(page):
        ch = page[j]
        if in_str:
            if esc:
                esc = False
            elif ch == chr(92):
                esc = True
            elif ch == '"':
                in_str = False
        elif ch == '"':
            in_str = True
        elif ch == "[":
            depth += 1
        elif ch == "]":
            depth -= 1
            if depth == 0:
                break
        j += 1
    items = json.loads(page[i : j + 1])
    source = re.search(r'"decklist":"([^"]+)"', page)
    url = source.group(1).replace(chr(92) + "u002F", "/") if source else None
    return [(it["count"], it["card"]["name"]) for it in items], url


def main():
    limit = 10
    for arg in sys.argv[1:]:
        if arg.startswith("--top="):
            limit = int(arg.split("=", 1)[1])
    os.makedirs(OUT, exist_ok=True)
    for name in os.listdir(OUT):
        if name.endswith(".json"):
            os.remove(os.path.join(OUT, name))
    commanders = top_commanders(limit)
    built = []
    for rank, commander in enumerate(commanders, start=1):
        print("#" + str(rank), commander)
        try:
            found = first_decklist(commander)
        except Exception as err:  # one bad page should not stop the rest
            print("  Could not read the EDHTop16 page:", err)
            continue
        if not found:
            print("No decklist listed for", commander)
            continue
        path, event = found
        items, source = decklist_items(path)
        partners = [part.strip() for part in commander.split(" / ")]
        lines = ["Commander"] + ["1 " + p for p in partners] + ["", "Deck"]
        lines += [str(count) + " " + card for count, card in items if card not in partners]
        with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
            f.write(NL.join(lines) + NL)
            listfile = f.name
        desc = "#" + str(rank) + " on EDHTop16. Tournament list from " + event
        if source:
            desc += " (" + source + ")"
        slug = "cedh-" + str(rank).zfill(2)
        cmd = [
            "yarn", "-s", "pod-deck", "--dir=cedh_decks", "--owner=cEDH meta",
            "--file=" + listfile, "--slug=" + slug, "--desc=" + desc,
        ]
        result = subprocess.run(cmd, cwd=ROOT, shell=(os.name == "nt"))
        os.remove(listfile)
        if result.returncode == 0:
            built.append(commander)
        else:
            print("Could not build", commander)
    print("Built", len(built), "of", len(commanders), "cEDH decks.")


if __name__ == "__main__":
    main()
