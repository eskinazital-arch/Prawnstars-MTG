import type { ThemeColors } from "./appTheme";
import type { GameFontSizes, GameThemeColorMap } from "./gameTheme";
import { buildGameColors, type BasePalette } from "./buildGameColors";
import { BRAND_COLORS } from "./brand";

const { ember, mana, sage, neutral, club } = BRAND_COLORS;
const darkBorder = "#303030";
const darkInput = "#8C8C8C";
const lightDestructive = "#A6283F";
const darkDestructive = "#F0788B";
const lightWarning = "#735400";

const palette: BasePalette = {
  foreground: neutral.steam,
  labelMuted: neutral.pewter,
  labelGhost: mana[400],
  placeholderFill: neutral.cauldron,
  placeholderStroke: neutral.pewter,
  canvasBackground: neutral.soot,
  red: "#c93d50",
  redDeep: "#a92f46",
  orange: ember[600],
  amber: ember[600],
  yellow: "#d8d34a",
  green: "#7ca982",
  teal: "#3fb6b8",
  cyan: "#4cbfd3",
  blue: "#527fbd",
  sky: "#58abd2",
  indigo: "#4c2769",
  violet: "#a85fc5",
  purple: "#71379b",
  pink: "#ce5d82",
  slate: "#7a8180",
  brown: "#ad6848",
  paper: neutral.steam,
  poison: "#82ad41",
  promptDefense: "#4f9fd0",
  manaW: "#f8f6d8",
  manaU: "#c1d7e9",
  manaB: "#cac5c0",
  manaR: "#e49977",
  manaG: "#a3c095",
  manaC: "#cac5c0",
};
const MANABREW_THEME: {
  name: string;
  light: ThemeColors;
  dark: ThemeColors;
  gameColors: GameThemeColorMap;
  gameFontSizes: GameFontSizes;
} = {
  name: "Cock Magic Club",
  // The Cock Magic Club: the one look (see PRODUCT.md, DESIGN.md). White page,
  // near-black ink and panels, hairlines; club green only for small accents.
  light: {
    background: "#FFFFFF",
    foreground: "#191919",
    card: "#F3F3F3",
    "card-foreground": "#191919",
    popover: "#FFFFFF",
    "popover-foreground": "#191919",
    primary: "#191919",
    "primary-hover": "#303030",
    "primary-foreground": "#FFFFFF",
    secondary: club.green,
    "secondary-foreground": "#FFFFFF",
    muted: "#F3F3F3",
    "muted-foreground": "#6A6A6A",
    accent: "#F3F3F3",
    "accent-foreground": "#191919",
    "brand-accent": club.green,
    "brand-accent-muted": "#E6F0EA",
    "brand-accent-foreground": club.green,
    destructive: lightDestructive,
    "destructive-foreground": "#FFFFFF",
    border: "#D1D1D1",
    input: "#8C8C8C",
    ring: "#191919",
    selection: "#E6F0EA",
    "selection-border": club.green,
    "selection-foreground": "#123D2A",
    commander: lightWarning,
    warning: lightWarning,
    overlay: "#000000",
  },
  dark: {
    background: neutral.soot,
    foreground: neutral.steam,
    card: neutral.cauldron,
    "card-foreground": neutral.steam,
    popover: neutral.ash,
    "popover-foreground": neutral.steam,
    primary: ember[400],
    "primary-hover": ember[300],
    "primary-foreground": neutral.soot,
    secondary: mana[400],
    "secondary-foreground": neutral.soot,
    muted: neutral.ash,
    "muted-foreground": neutral.pewter,
    accent: neutral.darkPewter,
    "accent-foreground": neutral.steam,
    "brand-accent": sage[400],
    "brand-accent-muted": "#303B2D",
    "brand-accent-foreground": sage[100],
    destructive: darkDestructive,
    "destructive-foreground": neutral.soot,
    border: darkBorder,
    input: darkInput,
    ring: ember[400],
    selection: mana[950],
    "selection-border": mana[400],
    "selection-foreground": mana[200],
    commander: "#d8a640",
    warning: "#d8a640",
    overlay: "#000000",
  },
  gameColors: {
    ...buildGameColors(palette),
    cardRing: ember[400],
    cardSelection: mana[400],
    "activeAction.active": ember[400],
    "playerColors.self": palette.green,
    "playerColors.opponent1": palette.blue,
    "playerColors.opponent2": palette.yellow,
    "playerColors.opponent3": palette.pink,
    "phaseStrip.background": neutral.soot,
  },
  gameFontSizes: {
    badgeCount: "13px",
    life: "14px",
    manaCount: "11px",
    zoneCount: "14px",
    zoneLabel: "10px",
    avatarInitials: "16px",
  },
};
export default MANABREW_THEME;
