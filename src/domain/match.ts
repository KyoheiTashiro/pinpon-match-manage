export type Game = { leftScore: number; rightScore: number; pointLog?: Side[] };

export type Side = "L" | "R";

export const isGameEmpty = (game: Game): boolean => game.leftScore === 0 && game.rightScore === 0;

export const realGames = (games: Game[]): Game[] => games.filter((game) => !isGameEmpty(game));

export const isGameFinished = (game: Game): boolean => {
  const { leftScore, rightScore } = game;
  return Math.max(leftScore, rightScore) >= 11 && Math.abs(leftScore - rightScore) >= 2;
};

export const gameWinner = (game: Game): Side | null => {
  if (!isGameFinished(game)) return null;
  return game.leftScore > game.rightScore ? "L" : "R";
};

const opposite = (side: Side): Side => (side === "L" ? "R" : "L");

export const gameFirstServer = (matchFirstServer: Side, gameIndex: number): Side =>
  gameIndex % 2 === 0 ? matchFirstServer : opposite(matchFirstServer);

export const currentServer = (game: Game, firstServerOfGame: Side): Side => {
  const total = game.leftScore + game.rightScore;
  const switches = total < 20 ? Math.floor(total / 2) : 10 + (total - 20);
  return switches % 2 === 0 ? firstServerOfGame : opposite(firstServerOfGame);
};

/** ゲーム数(3/5/7)から先取ゲーム数を求める。 */
export const winsNeededForBestOf = (bestOf: number): number => Math.floor(bestOf / 2) + 1;

export const matchSummary = (games: Game[], winsNeeded = 3) => {
  let leftWins = 0;
  let rightWins = 0;
  let leftPoints = 0;
  let rightPoints = 0;
  for (const game of games) {
    leftPoints += game.leftScore;
    rightPoints += game.rightScore;
    const winner = gameWinner(game);
    if (winner === "L") leftWins++;
    else if (winner === "R") rightWins++;
  }
  const finished = leftWins >= winsNeeded || rightWins >= winsNeeded;
  const winner: Side | null = leftWins >= winsNeeded ? "L" : rightWins >= winsNeeded ? "R" : null;
  return { leftWins, rightWins, leftPoints, rightPoints, finished, winner };
};

export const scoresFromLog = (log: Side[]): { leftScore: number; rightScore: number } => ({
  leftScore: log.filter((side) => side === "L").length,
  rightScore: log.filter((side) => side === "R").length,
});

export const addPointToGame = (game: Game, side: Side): Game => {
  const log = [...(game.pointLog ?? []), side];
  return { ...game, ...scoresFromLog(log), pointLog: log };
};

export const undoLastPoint = (game: Game): Game => {
  const log = game.pointLog;
  if (!log || log.length === 0) return game;
  const newLog = log.slice(0, -1);
  return { ...game, ...scoresFromLog(newLog), pointLog: newLog };
};

export const lastScorer = (game: Game): Side | null => {
  const log = game.pointLog;
  if (!log || log.length === 0) return null;
  return log[log.length - 1] ?? null;
};
