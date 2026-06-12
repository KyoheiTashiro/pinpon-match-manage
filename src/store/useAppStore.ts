import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Tournament } from './types';
import { createUiSlice, type UiSlice } from './slices/uiSlice';
import { createTournamentSlice, type TournamentSlice } from './slices/tournamentSlice';
import { createParticipantSlice, type ParticipantSlice } from './slices/participantSlice';
import { createMatchSlice, type MatchSlice } from './slices/matchSlice';

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
      name: 'pinpon-match-manage:v1',
      version: 2,
      migrate: (persisted, version) => {
        const st = persisted as AppState;
        if (version < 2 && st?.tournaments) {
          // v1は5ゲーム制固定だった。既存大会へ bestOf:5 を付与。
          const tournaments: Record<string, Tournament> = {};
          for (const [id, t] of Object.entries(st.tournaments)) {
            tournaments[id] = { ...t, bestOf: t.bestOf ?? 5 };
          }
          st.tournaments = tournaments;
        }
        return st;
      },
    },
  ),
);
