import { SIDE_KIND, type Match, type MatchSide } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";
import { useMemo } from "react";

/** 対戦表を成立させる最小参加人数。 */
export const MIN_PLAYERS_SINGLES = 2;
export const MIN_PLAYERS_DOUBLES = 4;

export const sideMembers = (side: MatchSide) =>
  side.kind === SIDE_KIND.SINGLE ? [side.participantId] : [...side.memberIds];

export const involvesSingle = (match: Match, id: string) =>
  (match.leftSide.kind === SIDE_KIND.SINGLE && match.leftSide.participantId === id) ||
  (match.rightSide.kind === SIDE_KIND.SINGLE && match.rightSide.participantId === id);

export const useMatrix = (tournamentId: string) => {
  const tournament = useAppStore((state) => state.tournaments[tournamentId]);
  const participants = useAppStore((state) => state.participants);
  const matches = useAppStore((state) => state.matches);

  const matchList = useMemo(
    () => tournament?.matchIds.map((id) => matches[id]).filter(Boolean) ?? [],
    [tournament?.matchIds, matches],
  );
  const players = tournament?.participantIds.map((id) => participants[id]).filter(Boolean) ?? [];

  const singlesCellMatch = useMemo(() => {
    const map = new Map<string, Match>();
    for (const match of matchList) {
      if (match.leftSide.kind !== SIDE_KIND.SINGLE || match.rightSide.kind !== SIDE_KIND.SINGLE)
        continue;
      const leftId = match.leftSide.participantId;
      const rightId = match.rightSide.participantId;
      const key = [leftId, rightId].toSorted().join("|");
      map.set(key, match);
    }
    return map;
  }, [matchList]);

  return {
    tournament,
    participants,
    matchList,
    players,
    singlesCellMatch,
  };
};

export const useTournamentFormat = (tournamentId: string) =>
  useAppStore((state) => state.tournaments[tournamentId]?.format);
