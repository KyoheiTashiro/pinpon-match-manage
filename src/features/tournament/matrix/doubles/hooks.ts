import { useMatrix, useMatchModal } from "../hooks";

/** 対戦表を成立させる最小参加人数（ダブルス）。 */
export const MIN_PLAYERS_DOUBLES = 4;

export const useDoublesMatrix = (tournamentId: string) => {
  const { tournament, participants, matchList, players } = useMatrix(tournamentId);
  const { openMatchId, openMatch, closeMatch } = useMatchModal();

  return {
    tournament,
    participants,
    matchList,
    players,
    openMatchId,
    openMatch,
    closeMatch,
  };
};
