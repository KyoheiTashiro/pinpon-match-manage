import type { StateCreator } from "zustand";
import type { MatchSide, Participant } from "@/store/types";
import type { StoreState } from "@/store/useAppStore";
import { uid } from "@/lib/id";

export type ParticipantSlice = {
  participants: Record<string, Participant>;
  addParticipant: (tournamentId: string, name: string, affiliation?: string) => string;
  updateParticipant: (id: string, patch: Partial<Participant>) => void;
  removeParticipant: (tournamentId: string, id: string) => void;
};

export const participantInitial: Pick<ParticipantSlice, "participants"> = {
  participants: {},
};

export const createParticipantSlice: StateCreator<StoreState, [], [], ParticipantSlice> = (
  set,
) => ({
  ...participantInitial,

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
          s.kind === "single" ? s.participantId === id : s.memberIds.includes(id);
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
});
