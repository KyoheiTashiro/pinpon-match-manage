export type Game = { leftScore: number; rightScore: number; pointLog?: Side[] };

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

/** ゲーム数(3/5/7)から先取ゲーム数を求める。 */
export const winsNeededForBestOf = (bestOf: number): number =>
  Math.floor(bestOf / 2) + 1;

export const matchSummary = (games: Game[], winsNeeded = 3) => {
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
  const finished = leftWins >= winsNeeded || rightWins >= winsNeeded;
  const winner: Side | null =
    leftWins >= winsNeeded ? 'L' : rightWins >= winsNeeded ? 'R' : null;
  return { leftWins, rightWins, leftPoints, rightPoints, finished, winner };
};

export const scoresFromLog = (log: Side[]): { leftScore: number; rightScore: number } => ({
  leftScore: log.filter((s) => s === 'L').length,
  rightScore: log.filter((s) => s === 'R').length,
});

export const addPointToGame = (g: Game, side: Side): Game => {
  const log = [...(g.pointLog ?? []), side];
  return { ...g, ...scoresFromLog(log), pointLog: log };
};

export const undoLastPoint = (g: Game): Game => {
  const log = g.pointLog;
  if (!log || log.length === 0) return g;
  const newLog = log.slice(0, -1);
  return { ...g, ...scoresFromLog(newLog), pointLog: newLog };
};

export const lastScorer = (g: Game): Side | null => {
  const log = g.pointLog;
  if (!log || log.length === 0) return null;
  return log[log.length - 1] ?? null;
};
