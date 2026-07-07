import {
  GAME_POINT,
  WIN_DIFF,
  DEUCE_FROM,
  SERVE_SWITCH_EVERY,
  DEUCE_SERVE_BASE,
} from "@/domain/constants";

export type Game = { leftScore: number; rightScore: number; pointLog?: Side[] };

export const SIDE = { LEFT: "L", RIGHT: "R" } as const;
export type Side = (typeof SIDE)[keyof typeof SIDE];

export const isGameEmpty = (game: Game): boolean => game.leftScore === 0 && game.rightScore === 0;

export const realGames = (games: Game[]): Game[] => games.filter((game) => !isGameEmpty(game));

export const isGameFinished = (game: Game): boolean => {
  const { leftScore, rightScore } = game;
  return (
    Math.max(leftScore, rightScore) >= GAME_POINT && Math.abs(leftScore - rightScore) >= WIN_DIFF
  );
};

export const gameWinner = (game: Game): Side | null => {
  if (!isGameFinished(game)) return null;
  return game.leftScore > game.rightScore ? SIDE.LEFT : SIDE.RIGHT;
};

export const opposite = (side: Side): Side => (side === SIDE.LEFT ? SIDE.RIGHT : SIDE.LEFT);

export const flip = (side: Side | null): Side | null => (side ? opposite(side) : null);

export const gameFirstServer = (matchFirstServer: Side, gameIndex: number): Side =>
  gameIndex % 2 === 0 ? matchFirstServer : opposite(matchFirstServer);

export const currentServer = (game: Game, firstServerOfGame: Side): Side => {
  const total = game.leftScore + game.rightScore;
  const switches =
    total < DEUCE_FROM
      ? Math.floor(total / SERVE_SWITCH_EVERY)
      : DEUCE_SERVE_BASE + (total - DEUCE_FROM);
  return switches % 2 === 0 ? firstServerOfGame : opposite(firstServerOfGame);
};

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
    if (winner === SIDE.LEFT) leftWins++;
    else if (winner === SIDE.RIGHT) rightWins++;
  }
  const finished = leftWins >= winsNeeded || rightWins >= winsNeeded;
  const winner: Side | null =
    leftWins >= winsNeeded ? SIDE.LEFT : rightWins >= winsNeeded ? SIDE.RIGHT : null;
  return { leftWins, rightWins, leftPoints, rightPoints, finished, winner };
};

export const scoresFromLog = (log: Side[]): { leftScore: number; rightScore: number } => ({
  leftScore: log.filter((side) => side === SIDE.LEFT).length,
  rightScore: log.filter((side) => side === SIDE.RIGHT).length,
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
  return log.at(-1) ?? null;
};
