import type { StateCreator } from "zustand";
import type { BestOf, Format, Tournament } from "@/store/types";
import type { StoreState } from "@/store/useAppStore";
import { generateId } from "@/lib/id";
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
    const id = generateId();
    const tournament: Tournament = {
      id,
      name,
      format,
      bestOf,
      date,
      createdAt: new Date().toISOString(),
      participantIds: [],
      matchIds: [],
    };
    set((state) => ({
      tournaments: { ...state.tournaments, [id]: tournament },
      currentTournamentId: id,
    }));
    return id;
  },

  deleteTournament: (id) => {
    set((state) => {
      const tournament = state.tournaments[id];
      if (!tournament) return state;
      const tournaments = { ...state.tournaments };
      delete tournaments[id];
      const matches = { ...state.matches };
      for (const matchId of tournament.matchIds) delete matches[matchId];
      const participants = { ...state.participants };
      for (const participantId of tournament.participantIds) delete participants[participantId];
      return {
        tournaments,
        matches,
        participants,
        currentTournamentId: state.currentTournamentId === id ? null : state.currentTournamentId,
      };
    });
  },

  setCurrentTournament: (id) => set({ currentTournamentId: id }),

  resetTournament: (id) => {
    set((state) => {
      const tournament = state.tournaments[id];
      if (!tournament) return state;
      const matches = { ...state.matches };
      for (const matchId of tournament.matchIds) delete matches[matchId];
      return {
        matches,
        tournaments: {
          ...state.tournaments,
          [id]: { ...tournament, matchIds: [] },
        },
      };
    });
  },

  resetAll: () => set({ ...tournamentInitial, ...participantInitial, ...matchInitial }),
});
