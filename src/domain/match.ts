import {
  GAME_POINT,
  WIN_DIFF,
  DEUCE_FROM,
  SERVE_SWITCH_EVERY,
  DEUCE_SERVE_BASE,
} from "@/domain/constants";

export const SIDE = { LEFT: "L", RIGHT: "R" } as const;
export type Side = (typeof SIDE)[keyof typeof SIDE];

export const GAME_KIND = { LOGGED: "logged", MANUAL: "manual" } as const;

export type Score = { leftScore: number; rightScore: number };

/**
 * logged は得点履歴が真実源でスコアを持たない（履歴と食い違うスコアを表現不能にする）。
 * manual は履歴のない直接入力・旧データ用。
 */
export type Game =
  | { kind: typeof GAME_KIND.LOGGED; pointLog: Side[] }
  | { kind: typeof GAME_KIND.MANUAL; leftScore: number; rightScore: number };

export const emptyGame = (): Game => ({ kind: GAME_KIND.LOGGED, pointLog: [] });

export const scoresFromLog = (log: Side[]): Score => ({
  leftScore: log.filter((side) => side === SIDE.LEFT).length,
  rightScore: log.filter((side) => side === SIDE.RIGHT).length,
});

export const gameScore = (game: Game): Score =>
  game.kind === GAME_KIND.LOGGED
    ? scoresFromLog(game.pointLog)
    : { leftScore: game.leftScore, rightScore: game.rightScore };

export const isGameEmpty = (game: Game): boolean => {
  const { leftScore, rightScore } = gameScore(game);
  return leftScore === 0 && rightScore === 0;
};

export const realGames = (games: Game[]): Game[] => games.filter((game) => !isGameEmpty(game));

export const isGameFinished = (game: Game): boolean => {
  const { leftScore, rightScore } = gameScore(game);
  return (
    Math.max(leftScore, rightScore) >= GAME_POINT && Math.abs(leftScore - rightScore) >= WIN_DIFF
  );
};

export const gameWinner = (game: Game): Side | null => {
  if (!isGameFinished(game)) return null;
  const { leftScore, rightScore } = gameScore(game);
  return leftScore > rightScore ? SIDE.LEFT : SIDE.RIGHT;
};

export const opposite = (side: Side): Side => (side === SIDE.LEFT ? SIDE.RIGHT : SIDE.LEFT);

export const flip = (side: Side | null): Side | null => (side ? opposite(side) : null);

export const gameFirstServer = (matchFirstServer: Side, gameIndex: number): Side =>
  gameIndex % 2 === 0 ? matchFirstServer : opposite(matchFirstServer);

export const currentServer = (game: Game, firstServerOfGame: Side): Side => {
  const { leftScore, rightScore } = gameScore(game);
  const total = leftScore + rightScore;
  const switches =
    total < DEUCE_FROM
      ? Math.floor(total / SERVE_SWITCH_EVERY)
      : DEUCE_SERVE_BASE + (total - DEUCE_FROM);
  return switches % 2 === 0 ? firstServerOfGame : opposite(firstServerOfGame);
};

export const winsNeededForBestOf = (bestOf: number): number => Math.floor(bestOf / 2) + 1;

/** 先頭から順に数え、勝敗が確定したゲームで止める。確定後のゲームは集計しない。 */
const tally = (games: Game[], winsNeeded: number) => {
  let leftWins = 0;
  let rightWins = 0;
  let leftPoints = 0;
  let rightPoints = 0;
  for (let index = 0; index < games.length; index++) {
    const { leftScore, rightScore } = gameScore(games[index]);
    leftPoints += leftScore;
    rightPoints += rightScore;
    const winner = gameWinner(games[index]);
    if (winner === SIDE.LEFT) leftWins++;
    else if (winner === SIDE.RIGHT) rightWins++;
    if (leftWins >= winsNeeded || rightWins >= winsNeeded) {
      const matchWinner: Side = leftWins >= winsNeeded ? SIDE.LEFT : SIDE.RIGHT;
      return {
        leftWins,
        rightWins,
        leftPoints,
        rightPoints,
        winner: matchWinner,
        decidedIndex: index,
      };
    }
  }
  return { leftWins, rightWins, leftPoints, rightPoints, winner: null, decidedIndex: null };
};

export const matchSummary = (games: Game[], winsNeeded = 3) => {
  const { leftWins, rightWins, leftPoints, rightPoints, winner } = tally(games, winsNeeded);
  return { leftWins, rightWins, leftPoints, rightPoints, finished: winner !== null, winner };
};

export const MATCH_PHASE = { PLAYING: "playing", DECIDED: "decided" } as const;

/**
 * 試合の進行位置。playing の gameIndex は次に加点できるゲーム（最初の未終了ゲーム）、
 * decided の gameIndex は決着ゲーム。
 */
export type MatchPhase =
  | { kind: typeof MATCH_PHASE.PLAYING; gameIndex: number }
  | { kind: typeof MATCH_PHASE.DECIDED; gameIndex: number; winner: Side };

export const matchPhase = (games: Game[], winsNeeded: number): MatchPhase => {
  const { winner, decidedIndex } = tally(games, winsNeeded);
  if (winner !== null) return { kind: MATCH_PHASE.DECIDED, gameIndex: decidedIndex, winner };
  const firstOpenIndex = games.findIndex((game) => !isGameFinished(game));
  return {
    kind: MATCH_PHASE.PLAYING,
    gameIndex: firstOpenIndex === -1 ? games.length : firstOpenIndex,
  };
};

export const MATCH_STATUS = {
  UNPLAYED: "unplayed",
  IN_PROGRESS: "inProgress",
  FINISHED: "finished",
} as const;
export type MatchStatus = (typeof MATCH_STATUS)[keyof typeof MATCH_STATUS];

/** 未対戦・途中・終了の唯一の判定。全画面がこれを使う。 */
export const matchStatus = (games: Game[], winsNeeded: number): MatchStatus => {
  if (tally(games, winsNeeded).winner !== null) return MATCH_STATUS.FINISHED;
  return games.every((game) => isGameEmpty(game))
    ? MATCH_STATUS.UNPLAYED
    : MATCH_STATUS.IN_PROGRESS;
};

const scoreKey = (side: Side) => (side === SIDE.LEFT ? "leftScore" : "rightScore");

export const addPointToGame = (game: Game, side: Side): Game =>
  game.kind === GAME_KIND.LOGGED
    ? { kind: GAME_KIND.LOGGED, pointLog: [...game.pointLog, side] }
    : { ...game, [scoreKey(side)]: game[scoreKey(side)] + 1 };

export const removePointFromGame = (game: Game, side: Side): Game => {
  if (game.kind === GAME_KIND.LOGGED) {
    const lastIndex = game.pointLog.lastIndexOf(side);
    if (lastIndex === -1) return game;
    return { kind: GAME_KIND.LOGGED, pointLog: game.pointLog.toSpliced(lastIndex, 1) };
  }
  if (game[scoreKey(side)] <= 0) return game;
  return { ...game, [scoreKey(side)]: game[scoreKey(side)] - 1 };
};
