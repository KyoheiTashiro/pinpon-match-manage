import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppState,
  FontSize,
  Format,
  Match,
  MatchSide,
  Participant,
  Tournament,
} from './types';
import { uid } from '../lib/id';

type Actions = {
  setFontSize: (s: FontSize) => void;

  createTournament: (name: string, format: Format, date: string) => string;
  deleteTournament: (id: string) => void;
  setCurrentTournament: (id: string | null) => void;
  resetTournament: (id: string) => void;
  resetAll: () => void;

  addParticipant: (tournamentId: string, name: string, affiliation?: string) => string;
  updateParticipant: (id: string, patch: Partial<Participant>) => void;
  removeParticipant: (tournamentId: string, id: string) => void;

  addManualMatch: (
    tournamentId: string,
    left: MatchSide,
    right: MatchSide,
  ) => string;
  updateMatch: (id: string, patch: Partial<Match>) => void;
  deleteMatch: (id: string) => void;
};

const initial: AppState = {
  tournaments: {},
  participants: {},
  matches: {},
  currentTournamentId: null,
  fontSize: 'normal',
};

export const useAppStore = create<AppState & Actions>()(
  persist(
    (set, get) => ({
      ...initial,

      setFontSize: (s) => set({ fontSize: s }),

      createTournament: (name, format, date) => {
        const id = uid();
        const t: Tournament = {
          id,
          name,
          format,
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
            currentTournamentId:
              st.currentTournamentId === id ? null : st.currentTournamentId,
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

      resetAll: () => set({ ...initial, fontSize: get().fontSize }),

      addParticipant: (tournamentId, name, affiliation) => {
        const id = uid();
        const p: Participant = { id, tournamentId, name: name.trim(), affiliation };
        set((st) => {
          const t = st.tournaments[tournamentId];
          if (!t) return st;
          return {
            participants: { ...st.participants, [id]: p },
            tournaments: {
              ...st.tournaments,
              [tournamentId]: {
                ...t,
                participantIds: [...t.participantIds, id],
              },
            },
          };
        });
        return id;
      },

      updateParticipant: (id, patch) =>
        set((st) => {
          const cur = st.participants[id];
          if (!cur) return st;
          return {
            participants: {
              ...st.participants,
              [id]: { ...cur, ...patch, name: (patch.name ?? cur.name).trim() },
            },
          };
        }),

      removeParticipant: (tournamentId, id) =>
        set((st) => {
          const t = st.tournaments[tournamentId];
          if (!t) return st;
          const participants = { ...st.participants };
          delete participants[id];
          const matches = { ...st.matches };
          const remainingMatchIds: string[] = [];
          for (const mid of t.matchIds) {
            const m = matches[mid];
            if (!m) continue;
            const involves = (s: MatchSide) =>
              s.kind === 'single'
                ? s.participantId === id
                : s.memberIds.includes(id);
            if (involves(m.leftSide) || involves(m.rightSide)) {
              delete matches[mid];
            } else {
              remainingMatchIds.push(mid);
            }
          }
          return {
            participants,
            matches,
            tournaments: {
              ...st.tournaments,
              [tournamentId]: {
                ...t,
                participantIds: t.participantIds.filter((p) => p !== id),
                matchIds: remainingMatchIds,
              },
            },
          };
        }),

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
    }),
    {
      name: 'pinpon-match-manage:v1',
      version: 1,
    },
  ),
);
