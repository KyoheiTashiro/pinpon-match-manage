export type Game = { leftScore: number; rightScore: number };

export type Side = 'L' | 'R';

export const isGameEmpty = (g: Game): boolean =>
  g.leftScore === 0 && g.rightScore === 0;

export const realGames = (games: Game[]): Game[] =>
  games.filter((g) => !isGameEmpty(g));

export const isGameFinished = (g: Game): boolean => {
  const { leftScore: l, rightScore: r } = g;
  return Math.max(l, r) >= 11 && Math.abs(l - r) >= 2;
};

export const gameWinner = (g: Game): Side | null => {
  if (!isGameFinished(g)) return null;
  return g.leftScore > g.rightScore ? 'L' : 'R';
};

const opposite = (s: Side): Side => (s === 'L' ? 'R' : 'L');

export const gameFirstServer = (matchFirstServer: Side, gameIndex: number): Side =>
  gameIndex % 2 === 0 ? matchFirstServer : opposite(matchFirstServer);

export const currentServer = (g: Game, firstServerOfGame: Side): Side => {
  const total = g.leftScore + g.rightScore;
  const switches = total < 20 ? Math.floor(total / 2) : 10 + (total - 20);
  return switches % 2 === 0 ? firstServerOfGame : opposite(firstServerOfGame);
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
