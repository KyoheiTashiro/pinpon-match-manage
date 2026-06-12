import type { StateCreator } from 'zustand';
import type { Match, MatchSide } from '../types';
import type { StoreState } from '../useAppStore';
import { uid } from '../../lib/id';

export type MatchSlice = {
  matches: Record<string, Match>;
  addManualMatch: (tournamentId: string, left: MatchSide, right: MatchSide) => string;
  updateMatch: (id: string, patch: Partial<Match>) => void;
  deleteMatch: (id: string) => void;
};

export const matchInitial: Pick<MatchSlice, 'matches'> = {
  matches: {},
};

export const createMatchSlice: StateCreator<StoreState, [], [], MatchSlice> = (set, get) => ({
  ...matchInitial,

  addManualMatch: (tournamentId, left, right) => {
    if (left.kind === 'single' && right.kind === 'single') {
      const t = get().tournaments[tournamentId];
      if (t) {
        const a = left.participantId;
        const b = right.participantId;
        for (const mid of t.matchIds) {
          const m = get().matches[mid];
          if (!m) continue;
          if (m.leftSide.kind !== 'single' || m.rightSide.kind !== 'single') continue;
          const x = m.leftSide.participantId;
          const y = m.rightSide.participantId;
          if ((x === a && y === b) || (x === b && y === a)) return mid;
        }
      }
    }
    const id = uid();
    const m: Match = {
      id,
      tournamentId,
      leftSide: left,
      rightSide: right,
      games: [],
      firstServer: 'L',
    };
    set((st) => {
      const t = st.tournaments[tournamentId];
      if (!t) return st;
      return {
        matches: { ...st.matches, [id]: m },
        tournaments: {
          ...st.tournaments,
          [tournamentId]: { ...t, matchIds: [...t.matchIds, id] },
        },
      };
    });
    return id;
  },

  updateMatch: (id, patch) =>
    set((st) => {
      const cur = st.matches[id];
      if (!cur) return st;
      return { matches: { ...st.matches, [id]: { ...cur, ...patch } } };
    }),

  deleteMatch: (id) =>
    set((st) => {
      const m = st.matches[id];
      if (!m) return st;
      const matches = { ...st.matches };
      delete matches[id];
      const t = st.tournaments[m.tournamentId];
      return {
        matches,
        tournaments: t
          ? {
              ...st.tournaments,
              [m.tournamentId]: {
                ...t,
                matchIds: t.matchIds.filter((mid) => mid !== id),
              },
            }
          : st.tournaments,
      };
    }),
});
