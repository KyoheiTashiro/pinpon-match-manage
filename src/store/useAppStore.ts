import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppState, Tournament } from "@/store/types";
import { createUiSlice, type UiSlice } from "@/store/slices/uiSlice";
import { createTournamentSlice, type TournamentSlice } from "@/store/slices/tournamentSlice";
import { createParticipantSlice, type ParticipantSlice } from "@/store/slices/participantSlice";
import { createMatchSlice, type MatchSlice } from "@/store/slices/matchSlice";

export type StoreState = UiSlice & TournamentSlice & ParticipantSlice & MatchSlice;

export const useAppStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...createUiSlice(...a),
      ...createTournamentSlice(...a),
      ...createParticipantSlice(...a),
      ...createMatchSlice(...a),
    }),
    {
      name: "pinpon-match-manage:v1",
      version: 2,
      migrate: (persisted, version) => {
        const state = persisted as AppState;
        if (version < 2 && state?.tournaments) {
          // v1は5ゲーム制固定だった。既存大会へ bestOf:5 を付与。
          const tournaments: Record<string, Tournament> = {};
          for (const [id, tournament] of Object.entries(state.tournaments)) {
            tournaments[id] = { ...tournament, bestOf: tournament.bestOf ?? 5 };
          }
          state.tournaments = tournaments;
        }
        return state;
      },
    },
  ),
);
