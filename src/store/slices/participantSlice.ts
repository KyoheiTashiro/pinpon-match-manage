import { SIDE_KIND, type MatchSide, type Participant } from "@/store/types";
import type { StoreState } from "@/store/useAppStore";
import { generateId } from "@/utils/id";
import type { StateCreator } from "zustand";

export type ParticipantSlice = {
  participants: Record<string, Participant>;
  addParticipant: (tournamentId: string, name: string, affiliation?: string) => string;
  updateParticipant: (id: string, patch: Partial<Participant>) => void;
  removeParticipant: (tournamentId: string, id: string) => void;
};

export const participantInitial: Pick<ParticipantSlice, "participants"> = {
  participants: {},
};

export const createParticipantSlice: StateCreator<
  StoreState,
  [["zustand/immer", never]],
  [],
  ParticipantSlice
> = (set) => ({
  ...participantInitial,

  addParticipant: (tournamentId, name, affiliation) => {
    const id = generateId();
    const participant: Participant = { id, tournamentId, name: name.trim(), affiliation };
    set((state) => {
      const tournament = state.tournaments[tournamentId];
      if (!tournament) return;
      state.participants[id] = participant;
      state.tournaments[tournamentId].participantIds.push(id);
    });
    return id;
  },

  updateParticipant: (id, patch) =>
    set((state) => {
      const current = state.participants[id];
      if (!current) return;
      Object.assign(state.participants[id], patch);
      state.participants[id].name = (patch.name ?? current.name).trim();
    }),

  removeParticipant: (tournamentId, id) =>
    set((state) => {
      const tournament = state.tournaments[tournamentId];
      if (!tournament) return;
      delete state.participants[id];
      const remainingMatchIds: string[] = [];
      for (const matchId of tournament.matchIds) {
        const match = state.matches[matchId];
        if (!match) continue;
        const involves = (side: MatchSide) =>
          side.kind === SIDE_KIND.SINGLE ? side.participantId === id : side.memberIds.includes(id);
        if (involves(match.leftSide) || involves(match.rightSide)) {
          delete state.matches[matchId];
        } else {
          remainingMatchIds.push(matchId);
        }
      }
      state.tournaments[tournamentId].participantIds = tournament.participantIds.filter(
        (pid) => pid !== id,
      );
      state.tournaments[tournamentId].matchIds = remainingMatchIds;
    }),
});
