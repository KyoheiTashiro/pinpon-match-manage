import type { StateCreator } from "zustand";
import type { MatchSide, Participant } from "@/store/types";
import type { StoreState } from "@/store/useAppStore";
import { generateId } from "@/lib/id";

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
    const id = generateId();
    const participant: Participant = { id, tournamentId, name: name.trim(), affiliation };
    set((state) => {
      const tournament = state.tournaments[tournamentId];
      if (!tournament) return state;
      return {
        participants: { ...state.participants, [id]: participant },
        tournaments: {
          ...state.tournaments,
          [tournamentId]: {
            ...tournament,
            participantIds: [...tournament.participantIds, id],
          },
        },
      };
    });
    return id;
  },

  updateParticipant: (id, patch) =>
    set((state) => {
      const current = state.participants[id];
      if (!current) return state;
      return {
        participants: {
          ...state.participants,
          [id]: { ...current, ...patch, name: (patch.name ?? current.name).trim() },
        },
      };
    }),

  removeParticipant: (tournamentId, id) =>
    set((state) => {
      const tournament = state.tournaments[tournamentId];
      if (!tournament) return state;
      const participants = { ...state.participants };
      delete participants[id];
      const matches = { ...state.matches };
      const remainingMatchIds: string[] = [];
      for (const matchId of tournament.matchIds) {
        const match = matches[matchId];
        if (!match) continue;
        const involves = (side: MatchSide) =>
          side.kind === "single" ? side.participantId === id : side.memberIds.includes(id);
        if (involves(match.leftSide) || involves(match.rightSide)) {
          delete matches[matchId];
        } else {
          remainingMatchIds.push(matchId);
        }
      }
      return {
        participants,
        matches,
        tournaments: {
          ...state.tournaments,
          [tournamentId]: {
            ...tournament,
            participantIds: tournament.participantIds.filter(
              (participantId) => participantId !== id,
            ),
            matchIds: remainingMatchIds,
          },
        },
      };
    }),
});
