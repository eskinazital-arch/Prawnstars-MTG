import { isFeatureEnabled } from "@/featureFlags";
import { getGroupKey } from "@/lib/groupKey";
import { memberDisplayName, memberFromKey } from "@/lib/podMembers";
import { ensureUsernameTag } from "@/lib/username";
import { useAuthStore } from "@/stores/useAuthStore";
import { usePreferencesStore } from "@/stores/usePreferencesStore";

export function relayUsername(): string {
  const auth = useAuthStore.getState();
  if (isFeatureEnabled("accounts") && auth.status === "signedIn" && auth.account) {
    return auth.account.handle;
  }
  const saved = usePreferencesStore.getState().serverUsername;
  // A member password makes the relay seat this browser as "Cuckold <Name>",
  // keeping the client's @NNNN tag. Send that same name from the first
  // connection, or a browser that has not visited Home yet (where the pod
  // name gets applied) cannot find its own seat when a game starts.
  const member = memberFromKey(getGroupKey());
  if (member) return ensureUsernameTag(memberDisplayName(member), saved);
  return saved;
}
