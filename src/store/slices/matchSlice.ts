import { SIDE, type Game, type Side } from "@/domain/match";
import { pairKey, sideMembers } from "@/domain/side";
import { matchesOf } from "@/store/selectors";
import { FORMAT, type Match, type MatchSides } from "@/store/types";
import type { StoreState } from "@/store/useAppStore";
import { generateId } from "@/utils/id";
import type { StateCreator } from "zustand";

export type MatchSlice = {
  matches: Record<string, Match>;
  /** 作成した（または既存の同一対戦の）試合 ID。大会形式・所属・重複の検証に落ちたら null。 */
  addManualMatch: (tournamentId: string, sides: MatchSides) => string | null;
  setGames: (id: string, games: Game[]) => void;
  setFirstServer: (id: string, side: Side) => void;
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

  addManualMatch: (tournamentId, sides) => {
    const tournament = get().tournaments[tournamentId];
    if (!tournament || tournament.format !== sides.kind) return null;
    const members = [...sideMembers(sides.left), ...sideMembers(sides.right)];
    if (new Set(members).size !== members.length) return null;
    if (!members.every((memberId) => tournament.participantIds.includes(memberId))) return null;

    if (sides.kind === FORMAT.SINGLES) {
      const key = pairKey(sides.left, sides.right);
      const existing = matchesOf(get().matches, tournamentId).find(
        (match) => match.kind === FORMAT.SINGLES && pairKey(match.left, match.right) === key,
      );
      if (existing) return existing.id;
    }

    const id = generateId();
    set((state) => {
      state.matches[id] = { id, tournamentId, ...sides, games: [], firstServer: SIDE.LEFT };
    });
    return id;
  },

  setGames: (id, games) =>
    set((state) => {
      if (state.matches[id]) state.matches[id].games = games;
    }),

  setFirstServer: (id, side) =>
    set((state) => {
      if (state.matches[id]) state.matches[id].firstServer = side;
    }),

  deleteMatch: (id) =>
    set((state) => {
      delete state.matches[id];
    }),
});
