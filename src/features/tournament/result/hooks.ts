import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { computeRanking } from "@/domain/ranking";
import { matchSummary, realGames, winsNeededForBestOf } from "@/domain/match";
import type { Game, Side } from "@/domain/match";
import type { Match, MatchSide, Participant } from "@/store/types";

const sideLabel = (side: MatchSide, participants: Record<string, Participant>) => {
  if (side.kind === "single") return participants[side.participantId]?.name ?? "?";
  return side.memberIds.map((id) => participants[id]?.name ?? "?").join(" / ");
};

export type MatchResultRow = {
  id: string;
  leftName: string;
  rightName: string;
  games: Game[];
  leftWins: number;
  rightWins: number;
  winner: "L" | "R" | null;
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

export const useResultRows = (tournamentId: string) => {
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

  return { rows, matchResults, tournament };
};
