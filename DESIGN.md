---
name: Prawnstars MTG
description: The pod's private Magic table, dressed as a freshly cracked booster pack.
colors:
  prawn-pink: "#FF5A7E"
  prawn-pink-hover: "#FF8FA8"
  prawn-pink-deep: "#8A1736"
  prawn-pink-deeper: "#66122A"
  wrapper-teal: "#16C7B7"
  wrapper-teal-deep: "#0B6E66"
  teal-mist: "#D6F7F3"
  wrapper-violet: "#9B74FF"
  wrapper-violet-deep: "#5426C9"
  selection-night: "#1F1048"
  selection-ink: "#D0BFFF"
  plum-soot: "#1A1030"
  plum-cauldron: "#24173F"
  plum-ash: "#2F2152"
  plum-seam: "#3D2C66"
  plum-input: "#7D6BA8"
  dusk-pewter: "#6A5A8F"
  lilac-pewter: "#C3B4E0"
  steam-cream: "#FFF6EC"
  cream: "#FFF3E6"
  linen: "#FFF8F0"
  ivory: "#FFFBF6"
  oat: "#E6DACA"
  oat-seam: "#C7B9A8"
  oat-input: "#887765"
  destructive-night: "#F0788B"
  destructive-day: "#A6283F"
  warning-night: "#D8A640"
  warning-day: "#735400"
  logo-coral: "#FF8A5C"
typography:
  display:
    fontFamily: "Bricolage Grotesque Variable, system-ui, -apple-system, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 1.11
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Bricolage Grotesque Variable, system-ui, -apple-system, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Bricolage Grotesque Variable, system-ui, -apple-system, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.4
  title-bar:
    fontFamily: "Bricolage Grotesque Variable, system-ui, -apple-system, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.56
  body:
    fontFamily: "Figtree Variable, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  body-strong:
    fontFamily: "Figtree Variable, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.5
  label:
    fontFamily: "Figtree Variable, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  meta:
    fontFamily: "Figtree Variable, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
  rail-label:
    fontFamily: "Figtree Variable, system-ui, -apple-system, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.25
  count:
    fontFamily: "Figtree Variable, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    fontFeature: "tnum"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  3xl: "24px"
  full: "9999px"
spacing:
  list-gap: "10px"
  row-y: "12px"
  row-x: "16px"
  tile-gap: "20px"
  column-gap: "24px"
  section-gap: "32px"
  tile-pad: "32px 24px 20px"
components:
  wrapper-tile-pink:
    backgroundColor: "{colors.prawn-pink}"
    textColor: "{colors.plum-soot}"
    rounded: "{rounded.2xl}"
    padding: "32px 24px 20px"
    height: "192px"
  wrapper-tile-teal:
    backgroundColor: "{colors.wrapper-teal}"
    textColor: "{colors.plum-soot}"
    rounded: "{rounded.2xl}"
    padding: "32px 24px 20px"
    height: "192px"
  wrapper-tile-violet:
    backgroundColor: "{colors.wrapper-violet}"
    textColor: "{colors.plum-soot}"
    rounded: "{rounded.2xl}"
    padding: "32px 24px 20px"
    height: "192px"
  wrapper-action-pill:
    backgroundColor: "{colors.plum-soot}"
    textColor: "{colors.steam-cream}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
  pill-primary:
    backgroundColor: "{colors.prawn-pink}"
    textColor: "{colors.plum-soot}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
  pill-primary-hover:
    backgroundColor: "{colors.prawn-pink-hover}"
  pill-play:
    backgroundColor: "{colors.wrapper-teal}"
    textColor: "{colors.plum-soot}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "6px 16px"
  status-chip:
    backgroundColor: "{colors.plum-cauldron}"
    textColor: "{colors.steam-cream}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
  list-row:
    backgroundColor: "{colors.plum-cauldron}"
    textColor: "{colors.steam-cream}"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
  input-field:
    backgroundColor: "{colors.plum-cauldron}"
    textColor: "{colors.steam-cream}"
    rounded: "{rounded.xl}"
    padding: "0 16px"
    height: "48px"
  rail:
    backgroundColor: "{colors.prawn-pink}"
    textColor: "{colors.plum-soot}"
    width: "88px"
  rail-item-active:
    backgroundColor: "{colors.plum-soot}"
    textColor: "{colors.steam-cream}"
    typography: "{typography.rail-label}"
    rounded: "{rounded.xl}"
    width: "68px"
  voice-dock:
    backgroundColor: "{colors.plum-cauldron}"
    textColor: "{colors.steam-cream}"
    rounded: "{rounded.xl}"
    padding: "8px 12px"
  seat-dot-taken:
    backgroundColor: "{colors.prawn-pink}"
    rounded: "{rounded.full}"
    size: "20px"
  seat-dot-open:
    backgroundColor: "{colors.plum-cauldron}"
    rounded: "{rounded.full}"
    size: "20px"
  button-upstream-primary:
    backgroundColor: "{colors.prawn-pink}"
    textColor: "{colors.plum-soot}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
---

# Design System: Prawnstars MTG

## Overview

**Creative North Star: "The Freshly Cracked Booster Pack"**

Every way into the game is a wrapper in its own bright colour, crimped along the top like the foil seal of a pack, laid on a deep plum ground. The shell around the wrappers is quiet: cream ink on plum, one hot prawn-pink rail down the left edge, and thin seams instead of boxes. Once a game starts, the wrappers step away and the board stays a calm dark table, so the colour lives on the way in and never competes with card art.

Density is moderate and desktop-first. The home screen is a short stack: a greeting, three wrapper tiles, then open tables beside ready-made decks, then the pod deck shelf. Type is chunky and friendly at display sizes (Bricolage Grotesque at extrabold) and plain and legible in the UI (Figtree). The world refuses the category default of a dark navy, gold-trimmed fantasy client.

Scope of the new system: the app shell (rail, top bar, logo), the Play home, the lobby's crimped start strip, the group password gate, and the voice and camera dock. The deck editor, game board, card rendering, draft screens and most dialogs are incumbent upstream (Manabrew) layouts; they inherit this system only through the token swap in the theme files and keep their own component shapes.

**Key Characteristics:**

- Deep plum grounds with cream ink in dark mode (the default); cream grounds with plum ink in light mode.
- One bright colour per way in: pink for the pod, teal for practice against the AI, violet for draft and sealed.
- A crimped zigzag seam on the top edge of every wrapper.
- Two line weights only: 1px seams and 2px rings.
- Bricolage Grotesque extrabold for headings, Figtree for everything you read and click, tabular numerals for counts.
- Low, soft plum shadows under wrappers; flat everywhere else.

## Colors

A saturated three-wrapper palette (pink, teal, violet) on a family of deep plums, with warm cream for ink and day-mode grounds.

### Primary

- **Prawn Pink** (prawn-pink): the brand and the pod. Fills the navigation rail, the "Play the pod" wrapper, the lobby start strip, primary pill buttons, taken seat dots, the "MTG" in the wordmark, the focus ring and the text caret. Hover lightens to Prawn Pink Hover.
- **Deep Prawn** (prawn-pink-deep, hover prawn-pink-deeper): the same role in light mode, darkened so white text on it stays legible.

### Secondary

- **Wrapper Violet** (wrapper-violet): the draft and sealed wrapper, and the selection family. Selection uses Selection Night as the fill with Selection Ink as text, and Wrapper Violet as the selection border. Light mode uses Deep Violet (wrapper-violet-deep).

### Tertiary

- **Wrapper Teal** (wrapper-teal): practice against the AI and talk. Fills the "Practice vs AI" wrapper and the "Play" pills on ready-made decks, and draws the ring around whoever is speaking in the voice dock and camera tiles. Light mode uses Deep Teal (wrapper-teal-deep) with Teal Mist as its muted fill.

### Neutral

- **Plum Soot** (plum-soot): the page and game-board ground in dark mode, the ink on bright wrappers, and the fill of action pills sitting on a wrapper.
- **Plum Cauldron** (plum-cauldron): cards, list rows, chips, inputs, the voice dock.
- **Plum Ash** (plum-ash): popovers and muted fills.
- **Plum Seam** (plum-seam): every 1px border in dark mode.
- **Plum Input** (plum-input): input strokes. **Dusk Pewter** (dusk-pewter): the dark-mode accent fill.
- **Lilac Pewter** (lilac-pewter): secondary text and scrollbar thumbs in dark mode.
- **Steam Cream** (steam-cream): primary ink in dark mode and the logo's star eye.
- **Cream, Linen, Ivory** (cream, linen, ivory): light-mode page, card and popover grounds. **Oat** (oat) is the light muted fill, **Oat Seam** (oat-seam) the light border, **Oat Input** (oat-input) the light input stroke.
- **Destructive** (destructive-night / destructive-day) and **Warning** (warning-night / warning-day) keep their status jobs in each mode.
- **Logo Coral** (logo-coral): appears only as one shell segment of the prawn mark. It is not a UI colour.

### Named Rules

**The One Colour, One Job Rule.** Each wrapper hue names one way in and keeps it everywhere: pink is the pod and the primary action, teal is practice and talk, violet is draft and selection. A new surface does not borrow a wrapper hue for an unrelated job.

**The Sun Is Reserved Rule.** Sun yellow (#FFB830, with #FFD27A and #D99412) is defined in the brand scale for "your turn / active" and nothing else. It is not wired to any surface yet; until it is, nothing else uses it.

**The Calm Table Rule.** The game board keeps the Plum Soot ground. Wrapper fields stay on the way in and never become board backgrounds.

## Typography

**Display Font:** Bricolage Grotesque Variable (with system-ui, -apple-system, sans-serif), exposed as the font-serif token; its default weight is 700.
**Body Font:** Figtree Variable (with system-ui, -apple-system, sans-serif), exposed as font-sans and font-game.

Both are self-hosted through @fontsource-variable.

**Character:** Bricolage is wide-shouldered and a little cheeky at extrabold, which carries the booster-pack energy; Figtree is round and plain, so menus, rows and game text stay easy to read.

### Hierarchy

- **Display** (800, 2.25rem, tight tracking): the page greeting ("Ready to play?").
- **Headline** (800, 1.875rem, line-height 1): wrapper titles and the lobby strip title.
- **Title** (800, 1.25rem): section headings such as "Open tables".
- **Title bar** (700, 1.125rem): the route name in the top bar, after a 1px divider.
- **Body** (400, 0.875rem, line-height 1.5): running text. On coarse pointers it grows to 1rem, and to 1.25rem on large touch screens.
- **Body strong** (600, 0.875rem): the one-line detail under a wrapper title.
- **Label** (600, 0.875rem): buttons, pills, chips, form labels.
- **Meta** (400, 0.75rem): secondary lines in list rows, in Lilac Pewter.
- **Rail label** (600, 0.6875rem): the words under rail icons.

### Named Rules

**The Extrabold Headline Rule.** Headings in the new system are Bricolage at 800 with slightly negative tracking (-0.01em to -0.015em). Body copy is never Bricolage.

**The Tabular Count Rule.** Player counts, seat counts and life totals use tabular numerals so the numbers don't jump as they change.

## Layout

The shell is a fixed left rail (88px, shown at 768px and up with a fine pointer) plus a top bar at least 64px tall, with content in a scroll panel. On touch and narrow screens the rail goes away; the top bar carries the prawn symbol and a menu sheet.

The Play home is centred with a 90rem maximum width and side padding of 20px, 32px and 40px as the screen widens. Sections stack 32px apart. The wrapper row is one column on mobile, two columns from 768px (the pod tile spans both), and a 1.4 / 1 / 1 row from 1280px, 20px apart. Below it, open tables and ready-made decks sit in a 1.2 / 1 two-column grid from 1024px with a 24px gap; list rows stack 10px apart.

The voice and camera dock never sits on page content. Outside games it docks inside the top bar, left of the sound and account buttons; in a game it is a slim strip at the top centre of the board. Camera tiles (160 by 120px) hang below the strip.

## Elevation & Depth

Mostly flat, with tonal layering doing the work: Plum Soot ground, Plum Cauldron cards, Plum Ash popovers, separated by 1px Plum Seam borders. Shadows are reserved for the pieces that physically sit on top: wrapper tiles, the rail's logo tile, and the floating voice dock. They are soft, low, pulled in with a negative spread, and tinted toward black or plum, never coloured.

### Shadow Vocabulary

- **Wrapper lift** (`box-shadow: 0 10px 24px -14px rgb(0 0 0 / 0.7)`): wrapper tiles and the lobby start strip.
- **Logo tile** (`box-shadow: 0 6px 14px -6px rgb(26 16 48 / 0.6)`): the plum tile holding the prawn mark on the rail.
- **Dock float** (`box-shadow: 0 8px 20px -10px rgb(0 0 0 / 0.6)`): the voice dock.

### Named Rules

**The Flat Seam Rule.** Lists, rows, chips and inputs use a 1px seam and a tonal step, not a shadow. A shadow means the piece is sitting on top of the page.

## Shapes

Corners are friendly and round, never sharp. Pills (fully rounded) for buttons and chips in the new system; 12px for list rows, inputs and the voice dock; 16px for the bottom of wrappers and the rail logo tile; 24px for the password gate's outer logo frame.

The signature silhouette is the crimp: a zigzag cut along the top edge of a wrapper, 14px wide and 7px deep per tooth, made with a CSS mask (the crimp-top utility). A crimped wrapper has 6px top corners under the crimp and 16px bottom corners, so it reads as a sealed pack.

**The Two Weights Rule.** Lines come in two weights: 1px for seams, borders and dividers; 2px for focus rings, the speaking ring and the outline pill on a wrapper.

**The Crimp Means a Way In Rule.** The crimp appears only on wrappers that start play: the three Play home tiles and the lobby's start strip. Lists, dialogs and panels are not crimped.

## Components

### Buttons

Tactile, round and direct.

- **Shape:** fully rounded pills in the new system.
- **Primary pill:** Prawn Pink fill, Plum Soot label at 600 (Pick your name; the gate's 48px tall "Come in" button with a trailing arrow). Hover lightens to Prawn Pink Hover.
- **Play pill:** Wrapper Teal fill, Plum Soot label, for starting a practice game from a ready-made deck. Hover drops opacity to 90%.
- **Pill on a wrapper:** Plum Soot fill, cream label, trailing arrow; on hover the gap between label and arrow widens from 8px to 12px. The lobby strip pairs it with an outline pill (2px border in the ground colour at 70%).
- **Focus:** a 2px ring in Prawn Pink, offset 2px from the ground on wrappers and the gate button.
- **Upstream button:** the incumbent Button component (6px corners, 36px tall by default, 1px focus ring) still serves the deck editor, dialogs and the voice dock's controls. It takes the new colours through tokens but keeps its upstream shape.

### Chips

- **Style:** status chips ("Playing as", "2 online") are pills with a Plum Cauldron fill and a 1px seam, label type, tabular numerals for counts.
- **Speaker chips** in the voice dock are small pills in meta type; the speaking one gets a Wrapper Teal border and a 2px teal ring at 60%.

### Cards / Containers

- **Corner Style:** 12px.
- **Background:** Plum Cauldron on Plum Soot.
- **Shadow Strategy:** none (see the Flat Seam Rule).
- **Border:** 1px Plum Seam; on hover a clickable row's border shifts to Prawn Pink at 60%. Empty states use a dashed 1px border with no fill.
- **Internal Padding:** 12px by 16px.

### Inputs / Fields

- **Style:** 48px tall, 12px corners, Plum Cauldron fill, 1px Plum Input stroke, 16px side padding, placeholder in Lilac Pewter.
- **Focus:** 2px Prawn Pink ring, no outline.
- **Error:** message below in meta type, destructive colour.

### Navigation

- **Rail:** an 88px Prawn Pink column. At the top, a 56px Plum Soot tile with 16px corners holds the prawn mark; it tilts 6 degrees on hover. Below it, seven destinations (Play, Multiplayer, Practice, Draft, Decks, Cards, Life), each a 68px wide stack of a 20px icon over a rail label. Idle items are Plum Soot on pink with a 15% ground wash on hover; the active item becomes a Plum Soot block with 12px corners, cream text and a pink icon.
- **Top bar:** Plum Soot ground with a 1px seam below. On desktop it shows the wordmark ("Prawnstars" in cream, "MTG" in Prawn Pink); on mid-size screens the mark and name; on phones the mark alone, next to a menu sheet.

### Wrapper Tile (signature)

The way into each kind of game. A button at least 192px tall, crimped on top, 6px top corners and 16px bottom corners, padded 32px top, 24px sides, 20px bottom, carrying the wrapper lift shadow. Inside, top to bottom: a 24px line icon at 80% opacity, a headline title, a body-strong detail line, and a pill on the wrapper with the action. On hover the whole tile rises 4px (only when motion is allowed). One tile per colour: pink "Play the pod", teal "Practice vs AI", violet "Draft and sealed".

### Lobby Start Strip (signature)

The Multiplayer screen's way in, in the same wrapper language: a crimped Prawn Pink strip with a headline ("Pull up a chair."), a body-strong line and two pills (solid "Create a table", outline "Find a game"). On short touch screens it falls back to a plain 12px card.

### Seat Dots

One 20px circle per seat on an open table row: Prawn Pink with a pink border for a seated player, Plum Cauldron with a seam border for an open seat. The row's label reads the count out for screen readers.

### Voice and Camera Dock

A floating Plum Cauldron strip with 12px corners, a 1px seam and the dock float shadow, holding join, mute, camera and leave controls plus speaker chips. Camera tiles are 160 by 120px with 8px corners, a black fill, and a name caption on a 60% black band; the speaker gets a 2px Wrapper Teal ring.

### Group Password Gate

A single centred column, at most 384px wide, on the page ground: the prawn mark inside a 64px plum tile inside an 80px pink frame, the wordmark beside it, one sentence of explanation, the input, and a full-width primary pill.

### Logo

The prawn mark: a curled prawn drawn from five thick shell segments (pink, coral, violet, teal, pink), a three-lobe tail fan in violet and teal, two antennae, pink legs, and a cream star for an eye, on a 64-unit grid. Flat colour only, no outlines or gradients, so it reads at favicon size. The favicon puts the same drawing on a Plum Soot tile with 16-unit corners. The wordmark pairs it with "Prawnstars MTG" in Bricolage extrabold.

## Do's and Don'ts

### Do:

- **Do** give every new way into play a wrapper: one hue from pink, teal or violet, the crimp on top, 6px top and 16px bottom corners, and the wrapper lift shadow.
- **Do** set headings in Bricolage Grotesque at 800 and everything else in Figtree.
- **Do** keep lines to 1px seams and 2px rings.
- **Do** use tabular numerals for counts, seats and life.
- **Do** put the action on a wrapper in a Plum Soot pill with a trailing arrow.
- **Do** mark the speaker with a 2px Wrapper Teal ring.
- **Do** gate hover lifts and gap changes behind the reduced-motion preference.

### Don't:

- **Don't** use a wrapper hue for a job it doesn't already have (One Colour, One Job).
- **Don't** use sun yellow for decoration; it is reserved for "your turn / active".
- **Don't** crimp lists, dialogs or panels; the crimp means a way in.
- **Don't** paint wrapper colours on the game board or behind card art.
- **Don't** add coloured or glowing shadows to UI chrome; shadows are soft, low and dark.
- **Don't** drift back to the dark navy, gold-trimmed fantasy-client look this world was built to refuse.
- **Don't** use Logo Coral outside the prawn mark.
