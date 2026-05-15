import { useMemo } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { computeRanking } from '../../../domain/ranking';
import { matchSummary } from '../../../domain/match';
import type { Game } from '../../../domain/match';
import type { Match, MatchSide, Participant } from '../../../store/types';

const sideLabel = (side: MatchSide, participants: Record<string, Participant>) => {
  if (side.kind === 'single') return participants[side.participantId]?.name ?? '?';
  return side.memberIds.map((id) => participants[id]?.name ?? '?').join(' / ');
};

export type MatchResultRow = {
  id: string;
  leftName: string;
  rightName: string;
  games: Game[];
  leftWins: number;
  rightWins: number;
  winner: 'L' | 'R' | null;
};

const buildMatchResult = (
  m: Match,
  participants: Record<string, Participant>,
): MatchResultRow => {
  const games = m.games.filter((g) => g.leftScore !== 0 || g.rightScore !== 0);
  const s = matchSummary(games);
  return {
    id: m.id,
    leftName: sideLabel(m.leftSide, participants),
    rightName: sideLabel(m.rightSide, participants),
    games,
    leftWins: s.leftWins,
    rightWins: s.rightWins,
    winner: s.winner,
  };
};

export const useRankingRows = (tournamentId: string) => {
  const tournament = useAppStore((s) => s.tournaments[tournamentId]);
  const matches = useAppStore((s) => s.matches);
  const participants = useAppStore((s) => s.participants);

  const rows = useMemo(() => {
    if (!tournament) return [];
    const names: Record<string, string> = {};
    for (const id of tournament.participantIds) {
      const p = participants[id];
      if (p) names[id] = p.name;
    }
    const ms = tournament.matchIds.map((id) => matches[id]).filter(Boolean);
    return computeRanking(ms, names);
  }, [tournament, matches, participants]);

  const matchResults = useMemo<MatchResultRow[]>(() => {
    if (!tournament) return [];
    return tournament.matchIds
      .map((id) => matches[id])
      .filter(Boolean)
      .filter((m) => m.games.some((g) => g.leftScore !== 0 || g.rightScore !== 0))
      .map((m) => buildMatchResult(m, participants));
  }, [tournament, matches, participants]);

  return { rows, matchResults, tournament };
};
