// The Prawnstars group password. It is the relay's server key
// (MANABREW_SERVER_KEY on the relay): a deployment that does not publish the
// key in its config makes every player enter it once, and nobody without it
// can connect to the pod's tables. Stored per browser.
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
