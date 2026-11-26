import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PromptType } from "@/protocol";

export interface PromptPreferencesState {
  show: Partial<Record<PromptType, boolean>>;
  fullControl: boolean;
  confirmPassWithMana: boolean;

  setShow: (promptType: PromptType, show: boolean) => void;
  clearShow: (promptType: PromptType) => void;
  setFullControl: (fullControl: boolean) => void;
  setConfirmPassWithMana: (confirmPassWithMana: boolean) => void;
}

export const usePromptPreferencesStore = create<PromptPreferencesState>()(
  persist(
    (set) => ({
      show: {},
      // The club plays on FULL by default: you pass priority yourself.
      fullControl: true,
      confirmPassWithMana: false,
      setShow: (promptType, show) => set((s) => ({ show: { ...s.show, [promptType]: show } })),
      clearShow: (promptType) =>
        set((s) => {
          const next = { ...s.show };
          delete next[promptType];
          return { show: next };
        }),
      setFullControl: (fullControl) => set({ fullControl }),
      setConfirmPassWithMana: (confirmPassWithMana) => set({ confirmPassWithMana }),
    }),
    {
      name: "manabrew.promptPreferences",
      // v1 moved everyone to FULL once; the toggle still switches to AUTO.
      version: 1,
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as {
          show?: PromptPreferencesState["show"];
          confirmPassWithMana?: boolean;
          fullControl?: boolean;
        };
        return {
          show: state.show ?? {},
          confirmPassWithMana: state.confirmPassWithMana ?? false,
          fullControl: version < 1 ? true : (state.fullControl ?? true),
        };
      },
      partialize: (s) => ({
        show: s.show,
        fullControl: s.fullControl,
        confirmPassWithMana: s.confirmPassWithMana,
      }),
    },
  ),
);
