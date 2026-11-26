// The Prawnstars pod. Each member has their own password, "cuck-<first name>",
// which the relay accepts in place of the shared server key and which signs
// them in as "Cuckold <Name>" (MANABREW_MEMBER_KEYS, see deploy/prawnstars).
export const POD_MEMBERS = ["Tal", "Eden", "Dante", "Mitchell", "Jackson", "Dillon"] as const;

export type PodMember = (typeof POD_MEMBERS)[number];

/** The member a password belongs to, or null for any other key. */
export function memberFromKey(key: string | null | undefined): PodMember | null {
  const match = key
    ?.trim()
    .toLowerCase()
    .match(/^cuck-([a-z]+)$/);
  if (!match) return null;
  return POD_MEMBERS.find((member) => member.toLowerCase() === match[1]) ?? null;
}

/** How a member is shown on the relay, in seats and in chat. */
export function memberDisplayName(member: string): string {
  return `Cuckold ${member}`;
}
