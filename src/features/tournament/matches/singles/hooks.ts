import { matchSummary, winsNeededForBestOf } from "@/domain/match";
import type { MatrixResult } from "@/features/tournament/matches/components/MatchMatrix";
import { useMatches, useMatchModal } from "@/features/tournament/matches/hooks";
import { SIDE_KIND, type Match } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";
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

export const useSinglesMatrix = (tournamentId: string) => {
  const {
    tournament,
    participants,
    players,
    singlesCellMatch,
    openMatchId,
    openMatch,
    closeMatch,
  } = useSingles(tournamentId);
  const addManualMatch = useAppStore((state) => state.addManualMatch);
  const wins = tournament ? winsNeededForBestOf(tournament.bestOf) : 0;

  const results = useMemo(() => {
    const list: MatrixResult[] = [];
    for (const match of singlesCellMatch.values()) {
      // 型ガード（singlesCellMatch は SINGLE 同士のみ格納だが Match 型では絞れない）
      if (match.leftSide.kind !== SIDE_KIND.SINGLE || match.rightSide.kind !== SIDE_KIND.SINGLE)
        continue;
      // ゲーム未入力の試合はリスト表示同様「対戦」扱い（セル押下で既存試合を開く）
      if (match.games.length === 0) continue;
      const summary = matchSummary(match.games, wins);
      list.push({
        playerAId: match.leftSide.participantId,
        playerBId: match.rightSide.participantId,
        winsA: summary.leftWins,
        winsB: summary.rightWins,
        finished: summary.finished,
      });
    }
    return list;
  }, [singlesCellMatch, wins]);

  const selectCell = (rowPlayerId: string, columnPlayerId: string) => {
    const pairKey = [rowPlayerId, columnPlayerId].toSorted().join("|");
    const match = singlesCellMatch.get(pairKey);
    if (match) {
      openMatch(match.id);
      return;
    }
    const id = addManualMatch(
      tournamentId,
      { kind: SIDE_KIND.SINGLE, participantId: rowPlayerId },
      { kind: SIDE_KIND.SINGLE, participantId: columnPlayerId },
    );
    openMatch(id);
  };

  return { tournament, participants, players, results, selectCell, openMatchId, closeMatch };
};
