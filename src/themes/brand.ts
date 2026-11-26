// Prawnstars MTG brand palette ("Booster Pack" direction; see PRODUCT.md and
// .impeccable/surfaces/). Scale names are kept from the upstream theme so every
// token mapping in default.ts keeps working:
//   ember -> prawn pink (primary), mana -> wrapper violet (secondary, selection),
//   sage -> wrapper teal (brand accent), neutral -> deep plum grounds and cream ink.
// Sun yellow is reserved for "your turn / active" and nothing else.
export const BRAND_COLORS = {
  ember: {
    50: "#FFF0F3",
    100: "#FFDCE4",
    200: "#FFB8C8",
    300: "#FF8FA8",
    400: "#FF5A7E",
    500: "#F23D66",
    600: "#D62652",
    700: "#B01C43",
    800: "#8A1736",
    900: "#66122A",
    950: "#3A0817",
  },
  mana: {
    50: "#F4F0FF",
    100: "#E7DEFF",
    200: "#D0BFFF",
    300: "#B497FF",
    400: "#9B74FF",
    500: "#7B4DFF",
    600: "#6633F0",
    700: "#5426C9",
    800: "#431FA0",
    900: "#351A7A",
    950: "#1F1048",
  },
  sage: {
    100: "#D6F7F3",
    400: "#16C7B7",
    700: "#0B6E66",
  },
  sun: {
    300: "#FFD27A",
    400: "#FFB830",
    600: "#D99412",
  },
  neutral: {
    soot: "#1A1030",
    cauldron: "#24173F",
    ash: "#2F2152",
    steam: "#FFF6EC",
    cream: "#FFF3E6",
    linen: "#FFF8F0",
    ivory: "#FFFBF6",
    pewter: "#C3B4E0",
    darkPewter: "#6A5A8F",
    white: "#FFFFFF",
  },
} as const;
