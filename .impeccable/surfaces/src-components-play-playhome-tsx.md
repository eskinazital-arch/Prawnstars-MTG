---
version: 1
slug: "src-components-play-playhome-tsx"
primary_target: "src/components/play/PlayHome.tsx"
related_targets: ["src/components/voice/VoiceChatBar.tsx"]
---

# Play home and app shell

Scope: the app shell (side panel, top bar, logo), the Play home, the lobby start strip, the group password screen, the voice and camera dock, and the cursor. Mode: Operate. Desktop and laptop first.

Audience and job: a pod member opening the club on game night to take a seat at the pod's table, or to practise with a deck.

Constraints: never crowd the game board; never fight card art; clean and modern (Tal's reference: theonyxla.com). Keep every existing route and function.

## Direction contract

THESIS: The Cock Magic Club is the pod's local, drawn as a clean modern members' club. The pub lives in the words and the logo, never in texture. Refuses the dark fantasy Magic client and any faux wood, chalk or gold leaf.

OWN-WORLD: White page; near-black #191919 rounded 16px panels set 10px in from the edge; tiles #f3f3f3; hairlines #d1d1d1 and #303030; muted #6a6a6a, faint #8c8c8c. Figtree only: 300 display at -0.05em, 400 body, 500 uppercase labels at +0.025em. Pill buttons black on white and white on black with an arrow. Colour comes only from the logo (club green, gold rooster, red comb) and card art.

STORY: The member sees who is in tonight, sits down in one click, or picks up a house deck.

FIRST VIEWPORT: Left: a near-black panel with the club mark, "The Cock Magic Club", nav pills, and who you are at the foot. Right: a near-black welcome panel ("Evening, Tal." in large light type, Take a seat and Practice pills), then two bordered boxes side by side, On tonight and House decks, then your decks as tiles with card art.

FORM: Pub concept (Impeccable's pick from the roll) executed in Tal's pinned clean-modern reference; seed:ec7349671560eb3f. Signature move: the club voice ("On tonight", "House decks", "Evening, Tal.") over a strictly quiet monochrome system.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
