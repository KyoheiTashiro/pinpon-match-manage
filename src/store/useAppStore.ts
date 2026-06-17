import { STORAGE_KEY, STORAGE_VERSION } from "@/constants/storage";
import { appStateSchema, sanitizeAppState } from "@/store/schema";
import { createMatchSlice, type MatchSlice } from "@/store/slices/matchSlice";
import { createParticipantSlice, type ParticipantSlice } from "@/store/slices/participantSlice";
import { createTournamentSlice, type TournamentSlice } from "@/store/slices/tournamentSlice";
import { createUiSlice, type UiSlice } from "@/store/slices/uiSlice";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

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
      partialize: (state) => ({
        tournaments: state.tournaments,
        participants: state.participants,
        matches: state.matches,
        currentTournamentId: state.currentTournamentId,
        fontSize: state.fontSize,
      }),
      merge: (persisted, current) => {
        const parsed = appStateSchema.safeParse(persisted);
        if (!parsed.success) {
          console.warn("[store] persisted state invalid, starting fresh", parsed.error);
          return current; // current は初期化済みアクション+初期データを持つ
        }
        return { ...current, ...sanitizeAppState(parsed.data) };
      },
    },
  ),
);
