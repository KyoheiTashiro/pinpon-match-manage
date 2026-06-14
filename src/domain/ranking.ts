import { SIDE_KIND, type Match } from "@/store/types";
import { SIDE, matchSummary } from "@/domain/match";

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

const sideMembers = (side: Match["leftSide"]): string[] =>
  side.kind === SIDE_KIND.SINGLE ? [side.participantId] : [...side.memberIds];

export const computeRanking = (
  matches: Match[],
  participantNames: Record<string, string>,
  winsNeeded = 3,
): RankingRow[] => {
  const stats = new Map<string, Omit<RankingRow, "rank">>();

  const ensure = (id: string) => {
    if (!stats.has(id)) {
      stats.set(id, {
        participantId: id,
        name: participantNames[id] ?? "?",
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

  for (const match of matches) {
    const summary = matchSummary(match.games, winsNeeded);
    if (!summary.finished) continue;
    const leftIds = sideMembers(match.leftSide);
    const rightIds = sideMembers(match.rightSide);
    const leftWon = summary.winner === SIDE.LEFT;

    for (const id of leftIds) {
      const stat = ensure(id);
      stat.played++;
      if (leftWon) stat.wins++;
      else stat.losses++;
      stat.gamesWon += summary.leftWins;
      stat.gamesLost += summary.rightWins;
      stat.pointsFor += summary.leftPoints;
      stat.pointsAgainst += summary.rightPoints;
    }
    for (const id of rightIds) {
      const stat = ensure(id);
      stat.played++;
      if (leftWon) stat.losses++;
      else stat.wins++;
      stat.gamesWon += summary.rightWins;
      stat.gamesLost += summary.leftWins;
      stat.pointsFor += summary.rightPoints;
      stat.pointsAgainst += summary.leftPoints;
    }
  }

  for (const id of Object.keys(participantNames)) ensure(id);

  // stats values are locally created objects not shared outside computeRanking; mutate
  // directly to avoid the spread overhead flagged by oxc/no-map-spread, then cast to
  // RankingRow (rank will be filled in below).
  const rows = Array.from(stats.values()) as RankingRow[];
  for (const row of rows) {
    row.gameDiff = row.gamesWon - row.gamesLost;
    row.pointDiff = row.pointsFor - row.pointsAgainst;
    row.rank = 0;
  }

  rows.sort((rowA, rowB) => {
    if (rowB.wins !== rowA.wins) return rowB.wins - rowA.wins;
    if (rowB.gameDiff !== rowA.gameDiff) return rowB.gameDiff - rowA.gameDiff;
    if (rowB.pointDiff !== rowA.pointDiff) return rowB.pointDiff - rowA.pointDiff;
    return rowA.name.localeCompare(rowB.name, "ja");
  });

  // rows elements are locally owned objects; assign rank directly instead of spreading.
  // 同順位（wins/gameDiff/pointDiff が同値）は同じ rank、次の異なる行で順位が飛ぶ（1,2,2,4 形式）。
  let rank = 0;
  let previousKey = "";
  rows.forEach((row, index) => {
    const key = `${row.wins}-${row.gameDiff}-${row.pointDiff}`;
    if (key !== previousKey) {
      rank = index + 1;
      previousKey = key;
    }
    row.rank = rank;
  });
  return rows;
};
