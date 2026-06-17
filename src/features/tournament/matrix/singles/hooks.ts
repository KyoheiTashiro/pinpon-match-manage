import { useMatrix, useMatchModal } from "@/features/tournament/matrix/hooks";
import { SIDE_KIND, type Match } from "@/store/types";
import { useMemo } from "react";

/** 対戦表を成立させる最小参加人数（シングルス）。 */
export const MIN_PLAYERS_SINGLES = 2;

export const involvesSingle = (match: Match, id: string) =>
  (match.leftSide.kind === SIDE_KIND.SINGLE && match.leftSide.participantId === id) ||
  (match.rightSide.kind === SIDE_KIND.SINGLE && match.rightSide.participantId === id);

export const useSinglesMatrix = (tournamentId: string) => {
  const { tournament, participants, matchList, players } = useMatrix(tournamentId);
  const { openMatchId, openMatch, closeMatch } = useMatchModal();

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
    players,
    singlesCellMatch,
    openMatchId,
    openMatch,
    closeMatch,
  };
};
