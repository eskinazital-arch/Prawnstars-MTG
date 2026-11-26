/**
 * Single source of truth for compile-time feature flags. Add a boolean here
 * (default `false` to ship a feature dark) and read it via `isFeatureEnabled`.
 * Do not scatter feature gates anywhere else. A deployment can also turn a
 * flag on at runtime via `window.__MANABREW_RUNTIME__.featureFlags` (config.js,
 * written by the web image entrypoint) — runtime can only enable, not disable.
 */
export const featureFlags = {
  // Ironsmith trusted engine/runtime. The WASM ships as the `ironsmith-wasm` npm
  // dependency, so it is always bundled (`IRONSMITH_WASM_AVAILABLE` is a static
  // `true`) and this flag stays on. The engine is still OFF until the user opts
  // in via Settings (`ironsmithRuntimeEnabled`) — the experimental engine ships
  // dark in prod by default.
  ironsmithRuntime: true,
  // Prawnstars MTG is a private site for one friend group: no public community
  // deck hub and no accounts (a shared group password gates the site instead;
  // see PRODUCT.md). These stay off, and dev builds no longer force them on.
  deckHub: false,
  accounts: false,
  emailSignIn: false,
  forgeWasm: false,
  cardFoil: true,
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  if (featureFlags[flag]) return true;
  const browserDevelopment =
    import.meta.env.DEV &&
    import.meta.env.MODE !== "test" &&
    typeof window !== "undefined" &&
    !("__TAURI_INTERNALS__" in window);
  if (browserDevelopment && flag === "forgeWasm") {
    return true;
  }
  return (
    typeof window !== "undefined" && window.__MANABREW_RUNTIME__?.featureFlags?.[flag] === true
  );
}
