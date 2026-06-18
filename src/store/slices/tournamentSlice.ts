import { matchInitial } from "@/store/slices/matchSlice";
import { participantInitial } from "@/store/slices/participantSlice";
import type { BestOf, Format, Tournament } from "@/store/types";
import type { StoreState } from "@/store/useAppStore";
import { generateId } from "@/utils/id";
import type { StateCreator } from "zustand";

export type TournamentSlice = {
  tournaments: Record<string, Tournament>;
  currentTournamentId: string | null;
  createTournament: (name: string, format: Format, date: string, bestOf: BestOf) => string;
  updateTournament: (id: string, patch: Partial<Pick<Tournament, "name" | "date">>) => void;
  deleteTournament: (id: string) => void;
  setCurrentTournament: (id: string | null) => void;
  resetTournament: (id: string) => void;
  resetAll: () => void;
};

export const tournamentInitial: Pick<TournamentSlice, "tournaments" | "currentTournamentId"> = {
  tournaments: {},
  currentTournamentId: null,
};

export const createTournamentSlice: StateCreator<
  StoreState,
  [["zustand/immer", never]],
  [],
  TournamentSlice
> = (set) => ({
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
    };
    set((state) => {
      state.tournaments[id] = tournament;
      state.currentTournamentId = id;
    });
    return id;
  },

  updateTournament: (id, patch) => {
    set((state) => {
      const tournament = state.tournaments[id];
      if (!tournament) return;
      Object.assign(state.tournaments[id], patch);
    });
  },

  deleteTournament: (id) => {
    set((state) => {
      const tournament = state.tournaments[id];
      if (!tournament) return;
      for (const match of Object.values(state.matches))
        if (match.tournamentId === id) delete state.matches[match.id];
      for (const participantId of tournament.participantIds)
        delete state.participants[participantId];
      delete state.tournaments[id];
      if (state.currentTournamentId === id) state.currentTournamentId = null;
    });
  },

  setCurrentTournament: (id) =>
    set((state) => {
      state.currentTournamentId = id;
    }),

  resetTournament: (id) => {
    set((state) => {
      const tournament = state.tournaments[id];
      if (!tournament) return;
      for (const match of Object.values(state.matches))
        if (match.tournamentId === id) delete state.matches[match.id];
    });
  },

  resetAll: () =>
    set((state) => {
      Object.assign(state, tournamentInitial, participantInitial, matchInitial);
    }),
});
