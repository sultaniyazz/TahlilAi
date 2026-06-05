import { create } from "zustand";

export type SettingsTab = "profile" | "plan" | "history";

type SettingsSheetState = {
  isOpen: boolean;
  tab: SettingsTab;
  open: (tab?: SettingsTab) => void;
  close: () => void;
  setTab: (tab: SettingsTab) => void;
};

export const useSettingsSheet = create<SettingsSheetState>((set) => ({
  isOpen: false,
  tab: "profile",
  open: (tab = "profile") => set({ isOpen: true, tab }),
  close: () => set({ isOpen: false }),
  setTab: (tab) => set({ tab }),
}));
