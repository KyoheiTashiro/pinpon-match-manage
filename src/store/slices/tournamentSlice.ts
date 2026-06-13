import type { StateCreator } from "zustand";
import type { BestOf, Format, Tournament } from "@/store/types";
import type { StoreState } from "@/store/useAppStore";
import { uid } from "@/lib/id";
import { participantInitial } from "@/store/slices/participantSlice";
import { matchInitial } from "@/store/slices/matchSlice";

export type TournamentSlice = {
  tournaments: Record<string, Tournament>;
  currentTournamentId: string | null;
  createTournament: (name: string, format: Format, date: string, bestOf: BestOf) => string;
  deleteTournament: (id: string) => void;
  setCurrentTournament: (id: string | null) => void;
  resetTournament: (id: string) => void;
  resetAll: () => void;
};

export const tournamentInitial: Pick<TournamentSlice, "tournaments" | "currentTournamentId"> = {
  tournaments: {},
  currentTournamentId: null,
};

export const createTournamentSlice: StateCreator<StoreState, [], [], TournamentSlice> = (set) => ({
  ...tournamentInitial,

  createTournament: (name, format, date, bestOf) => {
    const id = uid();
    const t: Tournament = {
      id,
      name,
      format,
      bestOf,
      date,
      createdAt: new Date().toISOString(),
      participantIds: [],
      matchIds: [],
    };
    set((st) => ({
      tournaments: { ...st.tournaments, [id]: t },
      currentTournamentId: id,
    }));
    return id;
  },

  deleteTournament: (id) => {
    set((st) => {
      const t = st.tournaments[id];
      if (!t) return st;
      const tournaments = { ...st.tournaments };
      delete tournaments[id];
      const matches = { ...st.matches };
      for (const mid of t.matchIds) delete matches[mid];
      const participants = { ...st.participants };
      for (const pid of t.participantIds) delete participants[pid];
      return {
        tournaments,
        matches,
        participants,
        currentTournamentId: st.currentTournamentId === id ? null : st.currentTournamentId,
      };
    });
  },

  setCurrentTournament: (id) => set({ currentTournamentId: id }),

  resetTournament: (id) => {
    set((st) => {
      const t = st.tournaments[id];
      if (!t) return st;
      const matches = { ...st.matches };
      for (const mid of t.matchIds) delete matches[mid];
      return {
        matches,
        tournaments: {
          ...st.tournaments,
          [id]: { ...t, matchIds: [] },
        },
      };
    });
  },

  resetAll: () => set({ ...tournamentInitial, ...participantInitial, ...matchInitial }),
});
