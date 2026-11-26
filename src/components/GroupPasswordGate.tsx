import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { PrawnMark } from "@/components/layout/PrawnMark";
import { groupPasswordRequired } from "@/config/knownRelays";
import { clearGroupKey, getGroupKey, isGroupKeyRejection, setGroupKey } from "@/lib/groupKey";
import { useServerStore } from "@/stores/useServerStore";

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
    // The relay connection reads the key at start-up.
    window.location.reload();
  }

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-background px-6 text-foreground">
      <form onSubmit={submit} className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-4">
          <span className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-primary">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-background">
              <PrawnMark size={52} />
            </span>
          </span>
          <h1 className="font-serif text-3xl font-extrabold leading-tight tracking-[-0.015em]">
            Prawnstars <span className="text-primary">MTG</span>
          </h1>
        </div>
        <p className="mb-5 text-ui-body text-muted-foreground">
          This table is for the Prawnstars pod. Enter the group password to come in; you only need
          to do this once on this browser.
        </p>
        <label htmlFor="group-password" className="mb-2 block text-ui-label font-semibold">
          Group password
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
          className="h-12 w-full rounded-xl border border-input bg-card px-4 text-ui-input text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {rejected && (
          <p id="group-password-error" className="mt-2 text-ui-meta text-destructive">
            That password did not work. Check it with whoever runs the server and try again.
          </p>
        )}
        <button
          type="submit"
          disabled={!value.trim()}
          className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground motion-safe:transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
        >
          Come in
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </main>
  );
}
