import { matchSummary, winsNeededForBestOf, SIDE } from "@/domain/match";
import type { MatrixResult } from "@/features/tournament/matches/components/MatchMatrix";
import { useMatches, useMatchModal } from "@/features/tournament/matches/hooks";
import { SIDE_KIND, type Match, type Participant } from "@/store/types";
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

export type SinglesRow = {
  key: string;
  aId: string;
  bId: string;
  matchId: string | null;
  leftName: string;
  rightName: string;
  leftWins: number | undefined;
  rightWins: number | undefined;
  hasScore: boolean;
  finished: boolean;
  inProgress: boolean;
  ariaLabel: string;
};

/** 総当たり組み合わせから1行分の表示データを導出（終了済みは勝者を上段へ寄せる） */
export const buildSinglesRows = (
  allPairs: { a: Participant; b: Participant }[],
  singlesCellMatch: Map<string, Match>,
  wins: number,
): SinglesRow[] =>
  allPairs.map(({ a, b }) => {
    const key = [a.id, b.id].toSorted().join("|");
    const match = singlesCellMatch.get(key);
    const summary = match ? matchSummary(match.games, wins) : null;
    const hasScore = !!match && (summary?.finished === true || match.games.length > 0);
    const finished = summary?.finished === true;
    const inProgress = hasScore && !finished;

    const aIsLeft =
      !!match && match.leftSide.kind === SIDE_KIND.SINGLE && match.leftSide.participantId === a.id;
    const aWins = aIsLeft ? summary?.leftWins : summary?.rightWins;
    const bWins = aIsLeft ? summary?.rightWins : summary?.leftWins;
    const aWon =
      finished && (aIsLeft ? summary.winner === SIDE.LEFT : summary.winner === SIDE.RIGHT);

    const swap = finished && !aWon;
    const leftName = swap ? b.name : a.name;
    const rightName = swap ? a.name : b.name;
    const leftWins = swap ? bWins : aWins;
    const rightWins = swap ? aWins : bWins;

    return {
      key,
      aId: a.id,
      bId: b.id,
      matchId: match?.id ?? null,
      leftName,
      rightName,
      leftWins,
      rightWins,
      hasScore,
      finished,
      inProgress,
      ariaLabel: hasScore
        ? `${leftName} 対 ${rightName} ${leftWins}-${rightWins}${inProgress ? " 途中" : ""} 編集`
        : `${a.name} 対 ${b.name} 対戦追加`,
    };
  });

export const useSinglesList = (tournamentId: string) => {
  const { tournament, participants, players, allPairs, singlesCellMatch, ...modal } =
    useSingles(tournamentId);
  const addManualMatch = useAppStore((state) => state.addManualMatch);
  const wins = tournament ? winsNeededForBestOf(tournament.bestOf) : 0;

  const rows = useMemo(
    () => buildSinglesRows(allPairs, singlesCellMatch, wins),
    [allPairs, singlesCellMatch, wins],
  );

  const openRow = (row: SinglesRow) => {
    if (row.matchId) {
      modal.openMatch(row.matchId);
      return;
    }
    const id = addManualMatch(
      tournamentId,
      { kind: SIDE_KIND.SINGLE, participantId: row.aId },
      { kind: SIDE_KIND.SINGLE, participantId: row.bId },
    );
    modal.openMatch(id);
  };

  return {
    tournament,
    participants,
    players,
    rows,
    openRow,
    openMatchId: modal.openMatchId,
    closeMatch: modal.closeMatch,
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
