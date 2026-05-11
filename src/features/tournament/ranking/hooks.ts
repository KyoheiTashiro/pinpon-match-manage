import { useMemo } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { computeRanking } from '../../../domain/ranking';

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

  return { rows, tournament };
};
