import { matchesOf } from "@/store/selectors";
import { SIDE_KIND, type MatchSide, type Participant } from "@/store/types";
import type { StoreState } from "@/store/useAppStore";
import { generateId } from "@/utils/id";
import type { StateCreator } from "zustand";

export type ParticipantSlice = {
  participants: Record<string, Participant>;
  addParticipant: (tournamentId: string, name: string, affiliation?: string) => string;
  addParticipants: (tournamentId: string, names: string[]) => void;
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

  addParticipants: (tournamentId, names) =>
    set((state) => {
      const tournament = state.tournaments[tournamentId];
      if (!tournament) return;
      const existingNames = new Set(
        tournament.participantIds.map((id) => state.participants[id]?.name.trim()).filter(Boolean),
      );
      for (const name of names) {
        const trimmed = name.trim();
        if (!trimmed || existingNames.has(trimmed)) continue;
        const id = generateId();
        state.participants[id] = { id, tournamentId, name: trimmed };
        state.tournaments[tournamentId].participantIds.push(id);
        existingNames.add(trimmed);
      }
    }),

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
      for (const match of matchesOf(state.matches, tournamentId)) {
        const involves = (side: MatchSide) =>
          side.kind === SIDE_KIND.SINGLE ? side.participantId === id : side.memberIds.includes(id);
        if (involves(match.leftSide) || involves(match.rightSide)) {
          delete state.matches[match.id];
        }
      }
      state.tournaments[tournamentId].participantIds = tournament.participantIds.filter(
        (participantId) => participantId !== id,
      );
    }),
});
