import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { AppState, Tournament } from "@/store/types";
import { createUiSlice, type UiSlice } from "@/store/slices/uiSlice";
import { createTournamentSlice, type TournamentSlice } from "@/store/slices/tournamentSlice";
import { createParticipantSlice, type ParticipantSlice } from "@/store/slices/participantSlice";
import { createMatchSlice, type MatchSlice } from "@/store/slices/matchSlice";
import { STORAGE_KEY, STORAGE_VERSION, MIGRATION_DEFAULT_BEST_OF } from "@/constants/storage";

export type StoreState = UiSlice & TournamentSlice & ParticipantSlice & MatchSlice;

export const useAppStore = create<StoreState>()(
  persist(
    immer((...a) => ({
      ...createUiSlice(...a),
      ...createTournamentSlice(...a),
      ...createParticipantSlice(...a),
      ...createMatchSlice(...a),
    })),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      migrate: (persisted, version) => {
        const state = persisted as AppState;
        // version < 2 は bestOf を導入したマイグレーション境界(現行 STORAGE_VERSION とは別概念)。
        if (version < 2 && state?.tournaments) {
          // v1は5ゲーム制固定だった。既存大会へ bestOf を付与。
          const tournaments: Record<string, Tournament> = {};
          for (const [id, tournament] of Object.entries(state.tournaments)) {
            tournaments[id] = {
              ...tournament,
              bestOf: tournament.bestOf ?? MIGRATION_DEFAULT_BEST_OF,
            };
          }
          state.tournaments = tournaments;
        }
        return state;
      },
    },
  ),
);
