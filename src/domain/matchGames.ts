import type { Game } from "@/domain/match";
import { isGameFinished } from "@/domain/match";

const isEmptyScore = (game: Game): boolean => game.leftScore === 0 && game.rightScore === 0;

export const padGames = (games: Game[], totalCount: number): Game[] => {
  const padded = [...games];
  while (padded.length < totalCount) padded.push({ leftScore: 0, rightScore: 0 });
  return padded.slice(0, totalCount);
};

/** ロック開始位置以降にある末尾の空ゲームを取り除く（永続化用）。 */
export const trimTrailingEmptyGames = (games: Game[], lockedStartIndex: number): Game[] =>
  games.filter((game, index) => index < lockedStartIndex || !isEmptyScore(game));

/** 勝敗確定により入力ロックが始まるゲーム位置。確定していなければ gameCount を返す。 */
export const lockedGameStartIndex = (
  games: Game[],
  winsNeeded: number,
  gameCount: number,
): number => {
  let leftWins = 0;
  let rightWins = 0;
  for (let index = 0; index < games.length; index++) {
    const game = games[index];
    if (isEmptyScore(game) || !isGameFinished(game)) continue;
    if (game.leftScore > game.rightScore) leftWins++;
    else rightWins++;
    if (leftWins === winsNeeded || rightWins === winsNeeded) return index + 1;
  }
  return gameCount;
};

/** スコアボードを開いた時に最初に表示すべきゲーム位置。 */
export const firstPlayableGameIndex = (
  games: Game[],
  lockedStartIndex: number,
  gameCount: number,
): number => {
  for (let index = 0; index < games.length && index < lockedStartIndex; index++) {
    if (!isGameFinished(games[index])) return index;
  }
  return Math.min(gameCount - 1, Math.max(0, lockedStartIndex - 1));
};
