import { useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { computeRanking } from "@/domain/ranking";
import { matchSummary, realGames, winsNeededForBestOf } from "@/domain/match";
import type { Game, Side } from "@/domain/match";
import { SIDE_KIND, type Match, type MatchSide, type Participant } from "@/store/types";
import { useImageCapture } from "@/lib/useImageCapture";

type DisplayMode = "table" | "graph";

const sideLabel = (side: MatchSide, participants: Record<string, Participant>) => {
  if (side.kind === SIDE_KIND.SINGLE) return participants[side.participantId]?.name ?? "?";
  return side.memberIds.map((id) => participants[id]?.name ?? "?").join(" / ");
};

export type MatchResultRow = {
  id: string;
  leftName: string;
  rightName: string;
  games: Game[];
  leftWins: number;
  rightWins: number;
  winner: Side | null;
  firstServer: Side;
};

const buildMatchResult = (
  match: Match,
  participants: Record<string, Participant>,
  winsNeeded: number,
): MatchResultRow => {
  const games = realGames(match.games);
  const summary = matchSummary(games, winsNeeded);
  return {
    id: match.id,
    leftName: sideLabel(match.leftSide, participants),
    rightName: sideLabel(match.rightSide, participants),
    games,
    leftWins: summary.leftWins,
    rightWins: summary.rightWins,
    winner: summary.winner,
    firstServer: match.firstServer,
  };
};

export const useResult = (tournamentId: string) => {
  const tournament = useAppStore((state) => state.tournaments[tournamentId]);
  const matches = useAppStore((state) => state.matches);
  const participants = useAppStore((state) => state.participants);

  const rows = useMemo(() => {
    if (!tournament) return [];
    const names: Record<string, string> = {};
    for (const id of tournament.participantIds) {
      const participant = participants[id];
      if (participant) names[id] = participant.name;
    }
    const matchList = tournament.matchIds.map((id) => matches[id]).filter(Boolean);
    return computeRanking(matchList, names, winsNeededForBestOf(tournament.bestOf));
  }, [tournament, matches, participants]);

  const matchResults = useMemo<MatchResultRow[]>(() => {
    if (!tournament) return [];
    return tournament.matchIds
      .map((id) => matches[id])
      .filter(Boolean)
      .filter((match) => realGames(match.games).length > 0)
      .map((match) =>
        buildMatchResult(match, participants, winsNeededForBestOf(tournament.bestOf)),
      );
  }, [tournament, matches, participants]);

  // 表示中コンテナ（table全体 or 選択中1対戦）用
  const main = useImageCapture("結果", tournament?.name);
  // off-screen 全対戦版用
  const allMatches = useImageCapture("結果", tournament?.name);
  const [mode, setMode] = useState<DisplayMode>("table");

  // ログのある対戦のみ選択肢に出す
  const graphMatches = useMemo(
    () =>
      matchResults.filter((match) =>
        match.games.some((game) => game.pointLog && game.pointLog.length > 0),
      ),
    [matchResults],
  );
  const graphOptions = useMemo(
    () => graphMatches.map((m) => ({ value: m.id, label: `${m.leftName} vs ${m.rightName}` })),
    [graphMatches],
  );

  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  // 初期選択: graphMatches が変わったときに未選択 or 消えた id をリセット
  const resolvedSelectedId =
    selectedMatchId !== null && graphMatches.some((m) => m.id === selectedMatchId)
      ? selectedMatchId
      : (graphMatches[0]?.id ?? null);
  const selectedMatch = graphMatches.find((m) => m.id === resolvedSelectedId) ?? null;

  const isSaving = main.saving || allMatches.saving;

  return {
    tournament,
    rows,
    matchResults,
    main,
    allMatches,
    mode,
    setMode,
    graphMatches,
    graphOptions,
    selectedMatchId,
    setSelectedMatchId,
    resolvedSelectedId,
    selectedMatch,
    isSaving,
  };
};
