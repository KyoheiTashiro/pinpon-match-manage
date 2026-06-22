import { SIDE, matchSummary, realGames, winsNeededForBestOf } from "@/domain/match";
import type { Game, Side } from "@/domain/match";
import { computeRanking } from "@/domain/ranking";
import { sideMembers, sideName } from "@/domain/side";
import { matchesOf } from "@/store/selectors";
import { type Match, type Participant } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";
import { useImageCapture } from "@/utils/imageCapture/useImageCapture";
import { useMemo, useState } from "react";

export const DISPLAY_MODE = {
  OVERALL: "overall",
  GRAPH: "graph",
  INDIVIDUAL: "individual",
} as const;
type DisplayMode = (typeof DISPLAY_MODE)[keyof typeof DISPLAY_MODE];

export const MATCH_RESULT = { WIN: "win", LOSE: "lose" } as const;
type MatchResult = (typeof MATCH_RESULT)[keyof typeof MATCH_RESULT];

export type MatchResultRow = {
  id: string;
  leftName: string;
  rightName: string;
  leftMembers: string[];
  rightMembers: string[];
  games: Game[];
  leftWins: number;
  rightWins: number;
  winner: Side | null;
  firstServer: Side;
};

/** 選択した参加者を「自分(左)」に正規化した1対戦。 */
export type PersonalMatchRow = {
  id: string;
  selfName: string;
  opponentName: string;
  selfWins: number;
  oppWins: number;
  games: { selfScore: number; oppScore: number }[];
  result: MatchResult | null;
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
    leftName: sideName(match.leftSide, participants),
    rightName: sideName(match.rightSide, participants),
    leftMembers: sideMembers(match.leftSide),
    rightMembers: sideMembers(match.rightSide),
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
    const matchList = matchesOf(matches, tournamentId);
    return computeRanking(matchList, names, winsNeededForBestOf(tournament.bestOf));
  }, [tournament, tournamentId, matches, participants]);

  const matchResults = useMemo<MatchResultRow[]>(() => {
    if (!tournament) return [];
    return matchesOf(matches, tournamentId)
      .filter((match) => realGames(match.games).length > 0)
      .map((match) =>
        buildMatchResult(match, participants, winsNeededForBestOf(tournament.bestOf)),
      );
  }, [tournament, tournamentId, matches, participants]);

  // 表示中コンテナ（table全体 or 選択中1対戦）用
  const main = useImageCapture();
  const [mode, setMode] = useState<DisplayMode>(DISPLAY_MODE.OVERALL);

  // 個人モード: 参加者セレクト
  const participantOptions = useMemo(() => {
    if (!tournament) return [];
    return tournament.participantIds
      .map((id) => ({ value: id, label: participants[id]?.name ?? "?" }))
      .filter((o) => o.label !== "?");
  }, [tournament, participants]);

  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const resolvedParticipantId =
    selectedParticipantId !== null &&
    participantOptions.some((o) => o.value === selectedParticipantId)
      ? selectedParticipantId
      : (participantOptions[0]?.value ?? null);

  // 選択参加者が関与する試合に selfSide を付与した中間配列（personalMatches/chartMatches の共通元）
  const myMatches = useMemo<{ row: MatchResultRow; selfSide: Side }[]>(() => {
    if (resolvedParticipantId === null) return [];
    const pid = resolvedParticipantId;
    return matchResults
      .filter((m) => m.leftMembers.includes(pid) || m.rightMembers.includes(pid))
      .map((m) => ({
        row: m,
        selfSide: m.leftMembers.includes(pid) ? SIDE.LEFT : SIDE.RIGHT,
      }));
  }, [matchResults, resolvedParticipantId]);

  // 選択者を「自分(左)」に正規化した対戦一覧
  const personalMatches = useMemo<PersonalMatchRow[]>(
    () =>
      myMatches.map(({ row: m, selfSide }) => {
        const selfIsLeft = selfSide === SIDE.LEFT;
        return {
          id: m.id,
          selfName: selfIsLeft ? m.leftName : m.rightName,
          opponentName: selfIsLeft ? m.rightName : m.leftName,
          selfWins: selfIsLeft ? m.leftWins : m.rightWins,
          oppWins: selfIsLeft ? m.rightWins : m.leftWins,
          games: m.games.map((g) => ({
            selfScore: selfIsLeft ? g.leftScore : g.rightScore,
            oppScore: selfIsLeft ? g.rightScore : g.leftScore,
          })),
          result:
            m.winner === null ? null : m.winner === selfSide ? MATCH_RESULT.WIN : MATCH_RESULT.LOSE,
        };
      }),
    [myMatches],
  );

  // グラフ用: 選択参加者が関わる pointLog ありの対戦（選択者を上段=selfSideに正規化）
  const chartMatches = useMemo(
    () =>
      myMatches
        .filter(({ row: m }) => m.games.some((g) => g.pointLog && g.pointLog.length > 0))
        .map(({ row: m, selfSide }) => ({ match: m, selfSide })),
    [myMatches],
  );

  const isSaving = main.saving;

  return {
    tournament,
    rows,
    matchResults,
    main,
    mode,
    setMode,
    chartMatches,
    participantOptions,
    selectedParticipantId,
    setSelectedParticipantId,
    resolvedParticipantId,
    personalMatches,
    isSaving,
  };
};
