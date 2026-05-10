import type { Match } from '../store/types';
import { matchSummary } from './match';

export type RankingRow = {
  participantId: string;
  name: string;
  played: number;
  wins: number;
  losses: number;
  gamesWon: number;
  gamesLost: number;
  gameDiff: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
  rank: number;
};

const sideMembers = (side: Match['leftSide']): string[] =>
  side.kind === 'single' ? [side.participantId] : [...side.memberIds];

export const computeRanking = (
  matches: Match[],
  participantNames: Record<string, string>,
): RankingRow[] => {
  const stats = new Map<string, Omit<RankingRow, 'rank'>>();

  const ensure = (id: string) => {
    if (!stats.has(id)) {
      stats.set(id, {
        participantId: id,
        name: participantNames[id] ?? '?',
        played: 0,
        wins: 0,
        losses: 0,
        gamesWon: 0,
        gamesLost: 0,
        gameDiff: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        pointDiff: 0,
      });
    }
    return stats.get(id)!;
  };

  for (const m of matches) {
    const summary = matchSummary(m.games);
    if (!summary.finished) continue;
    const leftIds = sideMembers(m.leftSide);
    const rightIds = sideMembers(m.rightSide);
    const leftWon = summary.winner === 'L';

    for (const id of leftIds) {
      const s = ensure(id);
      s.played++;
      if (leftWon) s.wins++;
      else s.losses++;
      s.gamesWon += summary.leftWins;
      s.gamesLost += summary.rightWins;
      s.pointsFor += summary.leftPoints;
      s.pointsAgainst += summary.rightPoints;
    }
    for (const id of rightIds) {
      const s = ensure(id);
      s.played++;
      if (!leftWon) s.wins++;
      else s.losses++;
      s.gamesWon += summary.rightWins;
      s.gamesLost += summary.leftWins;
      s.pointsFor += summary.rightPoints;
      s.pointsAgainst += summary.leftPoints;
    }
  }

  for (const id of Object.keys(participantNames)) ensure(id);

  const rows = Array.from(stats.values()).map((s) => ({
    ...s,
    gameDiff: s.gamesWon - s.gamesLost,
    pointDiff: s.pointsFor - s.pointsAgainst,
  }));

  rows.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.gameDiff !== a.gameDiff) return b.gameDiff - a.gameDiff;
    if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff;
    return a.name.localeCompare(b.name, 'ja');
  });

  let rank = 0;
  let prevKey = '';
  let sameCount = 0;
  return rows.map((r, i) => {
    const key = `${r.wins}-${r.gameDiff}-${r.pointDiff}`;
    if (key !== prevKey) {
      rank = i + 1;
      sameCount = 1;
    } else {
      sameCount++;
    }
    prevKey = key;
    void sameCount;
    return { ...r, rank };
  });
};
