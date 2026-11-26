import type { EngineKind } from "@/types/server";

/** User-facing engine name. The "Manabrew" engine kind is shown as the Rust engine. */
export function engineLabel(engine: EngineKind): string {
  return engine === "Manabrew" ? "Rust" : engine;
}
