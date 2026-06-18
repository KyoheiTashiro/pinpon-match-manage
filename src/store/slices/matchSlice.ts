import { SIDE } from "@/domain/match";
import { matchesOf } from "@/store/selectors";
import { SIDE_KIND, type Match, type MatchSide } from "@/store/types";
import type { StoreState } from "@/store/useAppStore";
import { generateId } from "@/utils/id";
import type { StateCreator } from "zustand";

export type MatchSlice = {
  matches: Record<string, Match>;
  addManualMatch: (tournamentId: string, left: MatchSide, right: MatchSide) => string;
  updateMatch: (id: string, patch: Partial<Match>) => void;
  deleteMatch: (id: string) => void;
};

export const matchInitial: Pick<MatchSlice, "matches"> = {
  matches: {},
};

export const createMatchSlice: StateCreator<
  StoreState,
  [["zustand/immer", never]],
  [],
  MatchSlice
> = (set, get) => ({
  ...matchInitial,

  addManualMatch: (tournamentId, left, right) => {
    if (left.kind === SIDE_KIND.SINGLE && right.kind === SIDE_KIND.SINGLE) {
      const tournament = get().tournaments[tournamentId];
      if (tournament) {
        const leftParticipantId = left.participantId;
        const rightParticipantId = right.participantId;
        for (const match of matchesOf(get().matches, tournamentId)) {
          if (match.leftSide.kind !== SIDE_KIND.SINGLE || match.rightSide.kind !== SIDE_KIND.SINGLE)
            continue;
          const existingLeftId = match.leftSide.participantId;
          const existingRightId = match.rightSide.participantId;
          if (
            (existingLeftId === leftParticipantId && existingRightId === rightParticipantId) ||
            (existingLeftId === rightParticipantId && existingRightId === leftParticipantId)
          )
            return match.id;
        }
      }
    }
    const id = generateId();
    const match: Match = {
      id,
      tournamentId,
      leftSide: left,
      rightSide: right,
      games: [],
      firstServer: SIDE.LEFT,
    };
    set((state) => {
      const tournament = state.tournaments[tournamentId];
      if (!tournament) return;
      state.matches[id] = match;
    });
    return id;
  },

  updateMatch: (id, patch) =>
    set((state) => {
      const current = state.matches[id];
      if (!current) return;
      Object.assign(state.matches[id], patch);
    }),

  deleteMatch: (id) =>
    set((state) => {
      const match = state.matches[id];
      if (!match) return;
      delete state.matches[id];
    }),
});
