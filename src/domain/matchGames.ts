import type { Game, Side } from "@/domain/match";
import {
  MATCH_PHASE,
  addPointToGame,
  emptyGame,
  isGameEmpty,
  matchPhase,
  removePointFromGame,
} from "@/domain/match";

export const padGames = (games: Game[], totalCount: number): Game[] => {
  const padded = [...games];
  while (padded.length < totalCount) padded.push(emptyGame());
  return padded.slice(0, totalCount);
};

/** 最後に得点が入ったゲームの位置。全ゲーム空なら -1。 */
export const lastScoredGameIndex = (games: Game[]): number =>
  games.findLastIndex((game) => !isGameEmpty(game));

/** 末尾に並ぶ空ゲームを取り除く（永続化用）。途中の空ゲームは位置がずれるため残す。 */
export const trimTrailingEmptyGames = (games: Game[]): Game[] =>
  games.slice(0, lastScoredGameIndex(games) + 1);

/** 加点できるのは進行中ゲームだけ。勝敗確定後はどのゲームにも加点できない。 */
export const canAddPoint = (games: Game[], winsNeeded: number, gameIndex: number): boolean => {
  const phase = matchPhase(games, winsNeeded);
  return phase.kind === MATCH_PHASE.PLAYING && phase.gameIndex === gameIndex;
};

/** 取り消せるのは最後に得点が入ったゲームだけ。前のゲームを直すには後続を先に取り消す。 */
export const canRemovePoint = (games: Game[], gameIndex: number): boolean =>
  gameIndex >= 0 && gameIndex === lastScoredGameIndex(games);

/** 許可されない加点は元の配列をそのまま返す。 */
export const addPoint = (
  games: Game[],
  winsNeeded: number,
  gameIndex: number,
  side: Side,
): Game[] => {
  if (!canAddPoint(games, winsNeeded, gameIndex)) return games;
  const next = [...games];
  next[gameIndex] = addPointToGame(games[gameIndex] ?? emptyGame(), side);
  return next;
};

/** 許可されない取り消しは元の配列をそのまま返す。 */
export const removePoint = (games: Game[], gameIndex: number, side: Side): Game[] => {
  if (!canRemovePoint(games, gameIndex)) return games;
  return games.map((game, index) => (index === gameIndex ? removePointFromGame(game, side) : game));
};
