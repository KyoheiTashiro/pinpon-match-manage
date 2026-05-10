export type Game = { leftScore: number; rightScore: number };

export type Side = 'L' | 'R';

export const isGameFinished = (g: Game): boolean => {
  const { leftScore: l, rightScore: r } = g;
  return Math.max(l, r) >= 11 && Math.abs(l - r) >= 2;
};

export const gameWinner = (g: Game): Side | null => {
  if (!isGameFinished(g)) return null;
  return g.leftScore > g.rightScore ? 'L' : 'R';
};

export const matchSummary = (games: Game[]) => {
  let leftWins = 0;
  let rightWins = 0;
  let leftPoints = 0;
  let rightPoints = 0;
  for (const g of games) {
    leftPoints += g.leftScore;
    rightPoints += g.rightScore;
    const w = gameWinner(g);
    if (w === 'L') leftWins++;
    else if (w === 'R') rightWins++;
  }
  const finished = leftWins === 3 || rightWins === 3;
  const winner: Side | null = leftWins === 3 ? 'L' : rightWins === 3 ? 'R' : null;
  return { leftWins, rightWins, leftPoints, rightPoints, finished, winner };
};
