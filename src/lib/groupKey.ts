// The password a browser came in with: a member's own password (see
// podMembers.ts) or the relay's shared server key (MANABREW_SERVER_KEY). A
// deployment that does not publish the server key makes every player enter
// one once; nobody without one can reach the pod's tables. Stored per browser.
const STORAGE_KEY = "prawnstars.groupKey";

export function getGroupKey(): string | null {
  if (typeof localStorage === "undefined") return null;
  const value = localStorage.getItem(STORAGE_KEY)?.trim();
  return value ? value : null;
}

export function setGroupKey(value: string): void {
  localStorage.setItem(STORAGE_KEY, value.trim());
}

export function clearGroupKey(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/** The relay rejected our key (wrong or changed group password). */
export function isGroupKeyRejection(error: string | null | undefined): boolean {
  return typeof error === "string" && /invalid server key/i.test(error);
}
