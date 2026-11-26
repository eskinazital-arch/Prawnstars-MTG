// The club's cheeky cursor. On by default for everyone (the pod agreed, see
// PRODUCT.md); Settings > Preferences has the off switch. The look lives in
// index.css under `html.club-cursor`.
const STORAGE_KEY = "club.cursor";
const CLASS_NAME = "club-cursor";

export function clubCursorEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function applyClubCursor(enabled = clubCursorEnabled()): void {
  document.documentElement.classList.toggle(CLASS_NAME, enabled);
}

export function setClubCursorEnabled(enabled: boolean): void {
  try {
    if (enabled) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, "off");
  } catch {
    // Storage blocked: the choice lasts for this visit only.
  }
  applyClubCursor(enabled);
}
