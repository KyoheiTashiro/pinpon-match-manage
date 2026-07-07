import { useMatches, useMatchModal } from "@/features/tournament/matches/hooks";
import { SIDE_KIND, type Match } from "@/store/types";
import { useMemo } from "react";

export const MIN_PLAYERS_SINGLES = 2;

export const involvesSingle = (match: Match, id: string) =>
  (match.leftSide.kind === SIDE_KIND.SINGLE && match.leftSide.participantId === id) ||
  (match.rightSide.kind === SIDE_KIND.SINGLE && match.rightSide.participantId === id);

export const useSingles = (tournamentId: string) => {
  const { tournament, participants, matchList, players } = useMatches(tournamentId);
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

  const allPairs = useMemo(() => {
    const pairs: { a: (typeof players)[number]; b: (typeof players)[number] }[] = [];
    for (let index = 0; index < players.length; index++) {
      for (let innerIndex = index + 1; innerIndex < players.length; innerIndex++) {
        pairs.push({ a: players[index], b: players[innerIndex] });
      }
    }
    return pairs;
  }, [players]);

  return {
    tournament,
    participants,
    players,
    allPairs,
    singlesCellMatch,
    openMatchId,
    openMatch,
    closeMatch,
  };
};
