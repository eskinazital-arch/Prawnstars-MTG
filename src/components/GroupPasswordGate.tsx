import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { ClubMark } from "@/components/layout/ClubMark";
import { groupPasswordRequired } from "@/config/knownRelays";
import { clearGroupKey, getGroupKey, isGroupKeyRejection, setGroupKey } from "@/lib/groupKey";
import { useServerStore } from "@/stores/useServerStore";
import { usePodDecksStore } from "@/stores/usePodDecksStore";
import { memberFromKey } from "@/lib/podMembers";

const REJECTED_FLAG = "prawnstars.groupKeyRejected";

/**
 * Keeps the app behind the pod's shared password when the deployment does not
 * publish its relay key. A wrong password comes back from the relay as
 * "Invalid server key"; the gate clears it and asks again.
 */
export function GroupPasswordGate({ children }: { children: ReactNode }) {
  const required = groupPasswordRequired();
  const [hasKey] = useState(() => getGroupKey() !== null);
  const serverError = useServerStore((state) => state.error);

  useEffect(() => {
    if (!required || !hasKey || !isGroupKeyRejection(serverError)) return;
    clearGroupKey();
    sessionStorage.setItem(REJECTED_FLAG, "1");
    window.location.reload();
  }, [required, hasKey, serverError]);

  if (!required || hasKey) return <>{children}</>;
  return <GroupPasswordScreen />;
}

function GroupPasswordScreen() {
  const [value, setValue] = useState("");
  const [rejected] = useState(() => {
    const flagged = sessionStorage.getItem(REJECTED_FLAG) === "1";
    sessionStorage.removeItem(REJECTED_FLAG);
    return flagged;
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!value.trim()) return;
    setGroupKey(value);
    // A member password says who you are; the relay signs you in under it.
    const member = memberFromKey(value);
    if (member) usePodDecksStore.setState({ me: member });
    // The relay connection reads the key at start-up.
    window.location.reload();
  }

  return (
    <main className="grid min-h-[100dvh] bg-background p-2.5 text-foreground">
      <div className="grid place-items-center rounded-2xl bg-primary px-6 text-primary-foreground">
        <form onSubmit={submit} className="w-full max-w-sm py-12">
          <ClubMark size={64} className="mb-8" />
          <p className="mb-3 text-ui-meta font-medium uppercase tracking-[0.025em] text-[#8c8c8c]">
            Members only
          </p>
          <h1 className="text-5xl font-light leading-[1.05] tracking-[-0.05em]">
            The Cock Magic Club
          </h1>
          <p className="mb-8 mt-4 text-ui-body text-[#bdbdbd]">
            The Prawnstars pod drinks here. Give the door your own member password; this browser
            will remember you after that.
          </p>
          <label htmlFor="group-password" className="mb-2 block text-ui-label font-medium">
            Your password
          </label>
          <input
            id="group-password"
            type="password"
            autoComplete="current-password"
            autoFocus
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-invalid={rejected || undefined}
            aria-describedby={rejected ? "group-password-error" : undefined}
            className="h-12 w-full rounded-xl border border-[#303030] bg-[#0f0f0f] px-4 text-ui-input text-white placeholder:text-[#6a6a6a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          />
          {rejected && (
            <p id="group-password-error" className="mt-2 text-ui-meta text-[#ff8a80]">
              That password did not work. Check it with whoever runs the server and try again.
            </p>
          )}
          <button
            type="submit"
            disabled={!value.trim()}
            className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white font-medium text-[#191919] motion-safe:transition-colors hover:bg-[#f3f3f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#191919] disabled:opacity-50"
          >
            Come in
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </main>
  );
}
