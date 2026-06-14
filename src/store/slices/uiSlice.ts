import type { StateCreator } from "zustand";
import { FONT_SIZE, type FontSize } from "@/store/types";
import type { StoreState } from "@/store/useAppStore";

export type UiSlice = {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
};

export const createUiSlice: StateCreator<StoreState, [["zustand/immer", never]], [], UiSlice> = (
  set,
) => ({
  fontSize: FONT_SIZE.NORMAL,
  setFontSize: (size) =>
    set((state) => {
      state.fontSize = size;
    }),
});
