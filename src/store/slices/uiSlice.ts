import type { StateCreator } from "zustand";
import type { FontSize } from "../types";
import type { StoreState } from "../useAppStore";

export type UiSlice = {
  fontSize: FontSize;
  setFontSize: (s: FontSize) => void;
};

export const createUiSlice: StateCreator<StoreState, [], [], UiSlice> = (set) => ({
  fontSize: "normal",
  setFontSize: (s) => set({ fontSize: s }),
});
