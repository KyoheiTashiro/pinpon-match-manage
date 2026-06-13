import type { StateCreator } from "zustand";
import type { FontSize } from "@/store/types";
import type { StoreState } from "@/store/useAppStore";

export type UiSlice = {
  fontSize: FontSize;
  setFontSize: (s: FontSize) => void;
};

export const createUiSlice: StateCreator<StoreState, [], [], UiSlice> = (set) => ({
  fontSize: "normal",
  setFontSize: (s) => set({ fontSize: s }),
});
