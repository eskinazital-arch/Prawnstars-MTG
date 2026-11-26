// The Cock Magic Club palette (see PRODUCT.md and DESIGN.md). Clean and modern:
// near-black ink and panels on a white page, hairlines, and colour only from the
// club mark (green, gold, red) and the card art. Scale names are kept from the
// upstream theme so every token mapping in default.ts keeps working; the light
// theme in default.ts is the one the app uses.
export const BRAND_COLORS = {
  club: {
    green: "#1F6B4A",
    gold: "#F5C542",
    red: "#E8483B",
  },
  ember: {
    50: "#F5F5F5",
    100: "#E6E6E6",
    200: "#D1D1D1",
    300: "#BDBDBD",
    400: "#FFFFFF",
    500: "#F3F3F3",
    600: "#D1D1D1",
    700: "#303030",
    800: "#191919",
    900: "#0F0F0F",
    950: "#0A0A0A",
  },
  mana: {
    50: "#F2F7F4",
    100: "#E6F0EA",
    200: "#C3DCCD",
    300: "#9CC4AC",
    400: "#6FA889",
    500: "#3F8A63",
    600: "#2B7A53",
    700: "#1F6B4A",
    800: "#17553A",
    900: "#123D2A",
    950: "#0B2619",
  },
  sage: {
    100: "#E6F0EA",
    400: "#6FA889",
    700: "#1F6B4A",
  },
  sun: {
    300: "#F8D97A",
    400: "#F5C542",
    600: "#D9A92A",
  },
  neutral: {
    soot: "#191919",
    cauldron: "#232323",
    ash: "#303030",
    steam: "#F5F5F5",
    cream: "#FFFFFF",
    linen: "#F3F3F3",
    ivory: "#FFFFFF",
    pewter: "#8C8C8C",
    darkPewter: "#6A6A6A",
    white: "#FFFFFF",
  },
} as const;
