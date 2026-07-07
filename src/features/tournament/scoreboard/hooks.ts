import type { GameScore, PlayerSide } from "@/components/domain/MatchResultBoard/MatchResultBoard";
import { GAME_POINT, WIN_DIFF } from "@/domain/constants";
import { SIDE, flip, opposite } from "@/domain/match";
import type { Game, Side } from "@/domain/match";
import {
  addPointToGame,
  currentServer,
  gameFirstServer,
  gameWinner,
  isGameFinished,
  lastScorer,
  matchSummary,
  undoLastPoint,
} from "@/domain/match";
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
    .filter((game) => isGameFinished(game) || game.leftScore > 0 || game.rightScore > 0)
    .map((game) => {
      const leftScore = swapped ? game.rightScore : game.leftScore;
      const rightScore = swapped ? game.leftScore : game.rightScore;
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

export type UseScoreboardProps = {
  leftName: string;
  rightName: string;
  games: Game[];
  setGames: (games: Game[]) => void;
  lockedFromIndex: number;
  initialGameIndex: number;
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
  lockedFromIndex,
  initialGameIndex,
  winsNeeded,
  matchFirstServer,
  onBack,
  onCloseAll,
}: UseScoreboardProps) => {
  const [gameIndex, setGameIndex] = useState(initialGameIndex);
  const [swapped, setSwapped] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const isPortrait = useSyncExternalStore(subscribePortrait, getPortraitSnapshot);

  const pick = <T>(left: T, right: T): T => (swapped ? right : left);

  const current = games[gameIndex];
  const summary = matchSummary(games, winsNeeded);
  const rawWinner = current ? gameWinner(current) : null;
  const rawMatchWinner = summary.winner;

  const rawServer: Side | null = current
    ? currentServer(current, gameFirstServer(matchFirstServer, gameIndex))
    : null;

  const gameOpen = current ? !isGameFinished(current) && !rawMatchWinner : false;
  const leftMatchPoint =
    gameOpen && current ? isGamePoint(current.leftScore, current.rightScore) : false;
  const rightMatchPoint =
    gameOpen && current ? isGamePoint(current.rightScore, current.leftScore) : false;

  const currentFinished = current ? isGameFinished(current) : false;

  const locked = gameIndex >= lockedFromIndex;
  const nextGameIndex = gameIndex + 1;
  const canAdvance =
    !rawMatchWinner && nextGameIndex < games.length && nextGameIndex < lockedFromIndex;
  const showNextGameBtn = currentFinished && !!rawWinner && canAdvance && !showResult;
  const showResultBtn = !!rawMatchWinner && !showResult;
  const showBackBtn = !!rawMatchWinner && showResult;

  const toActual = (displaySide: Side): Side => (swapped ? opposite(displaySide) : displaySide);

  const updateCurrent = (update: (game: Game) => Game) =>
    setGames(games.map((game, index) => (index === gameIndex ? update(game) : game)));

  const addPoint = (displaySide: Side) => {
    if (locked) return;
    updateCurrent((game) => addPointToGame(game, toActual(displaySide)));
  };

  const undoPoint = (displaySide: Side) => {
    if (locked || !current || lastScorer(current) !== toActual(displaySide)) return;
    updateCurrent(undoLastPoint);
  };

  const rawLastScorer = lastScorer(current ?? { leftScore: 0, rightScore: 0 });
  const canSubLeft = rawLastScorer === toActual(SIDE.LEFT);
  const canSubRight = rawLastScorer === toActual(SIDE.RIGHT);

  const matchWinner = pick(rawMatchWinner, flip(rawMatchWinner));
  const winner = pick(rawWinner, flip(rawWinner));
  const server = pick(rawServer, flip(rawServer));
  const displayLeftName = pick(leftName, rightName);
  const displayRightName = pick(rightName, leftName);
  const displayLeftWins = pick(summary.leftWins, summary.rightWins);
  const displayRightWins = pick(summary.rightWins, summary.leftWins);
  const displayLeftScore = pick(current?.leftScore ?? 0, current?.rightScore ?? 0);
  const displayRightScore = pick(current?.rightScore ?? 0, current?.leftScore ?? 0);
  const displayLeftMatchPoint = pick(leftMatchPoint, rightMatchPoint);
  const displayRightMatchPoint = pick(rightMatchPoint, leftMatchPoint);

  const sideView = (
    side: Side,
    name: string,
    score: number,
    isMatchPoint: boolean,
    canSub: boolean,
  ): SideView => ({
    name,
    score,
    isGameWinner: winner === side,
    isMatchWinner: matchWinner === side,
    isMatchPoint,
    isServing: server === side,
    disabled: locked,
    disableAdd: winner === side,
    canSub,
    onAdd: () => addPoint(side),
    onSub: () => undoPoint(side),
  });

  const scoreInputProps: ScoreInputProps = {
    left: sideView(SIDE.LEFT, displayLeftName, displayLeftScore, displayLeftMatchPoint, canSubLeft),
    right: sideView(
      SIDE.RIGHT,
      displayRightName,
      displayRightScore,
      displayRightMatchPoint,
      canSubRight,
    ),
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
    showResult,
    showNextGameBtn,
    showResultBtn,
    showBackBtn,
    nextGameIndex,
    isPortrait,
    scoreInputProps,
    resultBoardProps,
    onBack,
    onShowResult: () => setShowResult(true),
    onCloseAll,
  };
};
