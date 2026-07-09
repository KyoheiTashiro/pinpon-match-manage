import { FONT_SIZE, MATCHES_VIEW, type FontSize, type MatchesView } from "@/store/types";
import type { StoreState } from "@/store/useAppStore";
import type { StateCreator } from "zustand";

export type UiSlice = {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  matchesView: MatchesView;
  setMatchesView: (view: MatchesView) => void;
};

export const createUiSlice: StateCreator<StoreState, [["zustand/immer", never]], [], UiSlice> = (
  set,
) => ({
  fontSize: FONT_SIZE.NORMAL,
  setFontSize: (size) =>
    set((state) => {
      state.fontSize = size;
    }),
  matchesView: MATCHES_VIEW.MATRIX,
  setMatchesView: (view) =>
    set((state) => {
      state.matchesView = view;
    }),
});
