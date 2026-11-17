import type { GameScore, PlayerSide } from "@/components/domain/MatchResultBoard/MatchResultBoard";
import { GAME_POINT, WIN_DIFF } from "@/domain/constants";
import { MATCH_PHASE, SIDE, flip, opposite } from "@/domain/match";
import type { Game, Side } from "@/domain/match";
import {
  currentServer,
  gameFirstServer,
  gameScore,
  gameWinner,
  isGameEmpty,
  isGameFinished,
  matchPhase,
  matchSummary,
} from "@/domain/match";
import { addPoint, canAddPoint, canRemovePoint, removePoint } from "@/domain/matchGames";
import type { ScoreInputProps, SideView } from "@/features/tournament/scoreboard/types";
import { useState, useSyncExternalStore } from "react";

export type ResultBoardProps = {
  left: PlayerSide;
  right: PlayerSide;
  games: GameScore[];
};

/** hook から切り出すことでテスト容易性を保つ純関数。 */
export const toResultBoardProps = (
  source: {
    leftName: string;
    rightName: string;
    leftWins: number;
    rightWins: number;
    matchWinner: Side | null;
    swapped: boolean;
  },
  games: Game[],
): ResultBoardProps => {
  const { leftName, rightName, leftWins, rightWins, matchWinner, swapped } = source;
  const scoreGames = games
    .filter((game) => !isGameEmpty(game))
    .map((game) => {
      const score = gameScore(game);
      const leftScore = swapped ? score.rightScore : score.leftScore;
      const rightScore = swapped ? score.leftScore : score.rightScore;
      const finished = isGameFinished(game);
      return {
        leftScore,
        rightScore,
        leftWon: finished && leftScore > rightScore,
        rightWon: finished && rightScore > leftScore,
      };
    });
  return {
    left: { name: leftName, wins: leftWins, isWinner: matchWinner === SIDE.LEFT },
    right: { name: rightName, wins: rightWins, isWinner: matchWinner === SIDE.RIGHT },
    games: scoreGames,
  };
};

const PORTRAIT_QUERY = "(orientation: portrait) and (max-width: 900px)";

const subscribePortrait = (onChange: () => void) => {
  const mediaQuery = window.matchMedia(PORTRAIT_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
};

const getPortraitSnapshot = () => window.matchMedia(PORTRAIT_QUERY).matches;

const isGamePoint = (score: number, opponent: number) => {
  const nextScore = score + 1;
  return nextScore >= GAME_POINT && nextScore - opponent >= WIN_DIFF;
};

export const SCOREBOARD_ACTION = {
  NEXT: "next",
  SHOW_RESULT: "showResult",
  CLOSE: "close",
} as const;
export type ScoreboardAction = (typeof SCOREBOARD_ACTION)[keyof typeof SCOREBOARD_ACTION];

export type UseScoreboardProps = {
  leftName: string;
  rightName: string;
  /** bestOf 個に埋めたゲーム列 */
  games: Game[];
  setGames: (games: Game[]) => void;
  winsNeeded: number;
  matchFirstServer: Side;
  onBack: () => void;
  onCloseAll?: () => void;
};

export const useScoreboard = ({
  leftName,
  rightName,
  games,
  setGames,
  winsNeeded,
  matchFirstServer,
  onBack,
  onCloseAll,
}: UseScoreboardProps) => {
  const phase = matchPhase(games, winsNeeded);
  const lastGameIndex = Math.max(0, games.length - 1);
  const [selectedGameIndex, setSelectedGameIndex] = useState(phase.gameIndex);
  const [swapped, setSwapped] = useState(false);
  const [resultRequested, setResultRequested] = useState(false);
  const isPortrait = useSyncExternalStore(subscribePortrait, getPortraitSnapshot);

  const gameIndex = Math.min(selectedGameIndex, lastGameIndex);

  const pick = <T>(left: T, right: T): T => (swapped ? right : left);

  const current = games[gameIndex];
  const currentScore = current ? gameScore(current) : { leftScore: 0, rightScore: 0 };
  const summary = matchSummary(games, winsNeeded);
  const rawWinner = current ? gameWinner(current) : null;
  const rawMatchWinner = summary.winner;

  const rawServer: Side | null = current
    ? currentServer(current, gameFirstServer(matchFirstServer, gameIndex))
    : null;

  const canAdd = canAddPoint(games, winsNeeded, gameIndex);
  const canSub = canRemovePoint(games, gameIndex);
  const locked = !canAdd && !canSub;
  const leftMatchPoint = canAdd && isGamePoint(currentScore.leftScore, currentScore.rightScore);
  const rightMatchPoint = canAdd && isGamePoint(currentScore.rightScore, currentScore.leftScore);

  // 結果表示は勝者がいる間だけ成立する（勝敗未定の結果画面を作らない）
  const showResult = resultRequested && rawMatchWinner !== null;
  const nextGameIndex = gameIndex + 1;
  const action: ScoreboardAction | null = showResult
    ? SCOREBOARD_ACTION.CLOSE
    : rawMatchWinner === null
      ? rawWinner !== null && nextGameIndex < games.length
        ? SCOREBOARD_ACTION.NEXT
        : null
      : SCOREBOARD_ACTION.SHOW_RESULT;

  /** まだ始められないゲーム（進行位置より先の空ゲーム）には切り替えない。 */
  const isGameSelectable = (index: number) =>
    index >= 0 &&
    index < games.length &&
    ((phase.kind === MATCH_PHASE.PLAYING && index <= phase.gameIndex) ||
      !isGameEmpty(games[index]));

  const setGameIndex = (index: number) => {
    if (isGameSelectable(index)) setSelectedGameIndex(index);
  };

  const toActual = (displaySide: Side): Side => (swapped ? opposite(displaySide) : displaySide);

  const matchWinner = pick(rawMatchWinner, flip(rawMatchWinner));
  const winner = pick(rawWinner, flip(rawWinner));
  const server = pick(rawServer, flip(rawServer));
  const displayLeftName = pick(leftName, rightName);
  const displayRightName = pick(rightName, leftName);
  const displayLeftWins = pick(summary.leftWins, summary.rightWins);
  const displayRightWins = pick(summary.rightWins, summary.leftWins);
  const displayLeftScore = pick(currentScore.leftScore, currentScore.rightScore);
  const displayRightScore = pick(currentScore.rightScore, currentScore.leftScore);
  const displayLeftMatchPoint = pick(leftMatchPoint, rightMatchPoint);
  const displayRightMatchPoint = pick(rightMatchPoint, leftMatchPoint);

  const sideView = (side: Side, name: string, score: number, isMatchPoint: boolean): SideView => ({
    name,
    score,
    isGameWinner: winner === side,
    isMatchWinner: matchWinner === side,
    isMatchPoint,
    isServing: server === side,
    disabled: locked,
    disableAdd: !canAdd,
    disableSub: !canSub,
    onAdd: () => setGames(addPoint(games, winsNeeded, gameIndex, toActual(side))),
    onSub: () => setGames(removePoint(games, gameIndex, toActual(side))),
  });

  const scoreInputProps: ScoreInputProps = {
    left: sideView(SIDE.LEFT, displayLeftName, displayLeftScore, displayLeftMatchPoint),
    right: sideView(SIDE.RIGHT, displayRightName, displayRightScore, displayRightMatchPoint),
    leftWins: displayLeftWins,
    rightWins: displayRightWins,
    matchWinner,
    locked,
    swapped,
    onSwap: () => setSwapped((previous) => !previous),
  };

  const resultBoardProps = toResultBoardProps(
    {
      leftName: displayLeftName,
      rightName: displayRightName,
      leftWins: displayLeftWins,
      rightWins: displayRightWins,
      matchWinner,
      swapped,
    },
    games,
  );

  return {
    gameIndex,
    setGameIndex,
    isGameSelectable,
    showResult,
    action,
    nextGameIndex,
    isPortrait,
    scoreInputProps,
    resultBoardProps,
    onBack,
    onShowResult: () => setResultRequested(true),
    onCloseAll,
  };
};
