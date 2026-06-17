import { GAME_POINT, WIN_DIFF } from "@/domain/constants";
import { SIDE } from "@/domain/match";
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
import { useState, useSyncExternalStore } from "react";

const PORTRAIT_QUERY = "(orientation: portrait) and (max-width: 900px)";

const subscribePortrait = (onChange: () => void) => {
  const mediaQuery = window.matchMedia(PORTRAIT_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
};

const getPortraitSnapshot = () => window.matchMedia(PORTRAIT_QUERY).matches;

const opposite = (side: Side): Side => (side === SIDE.LEFT ? SIDE.RIGHT : SIDE.LEFT);

const flip = (side: Side | null): Side | null => (side ? opposite(side) : null);

const isGamePoint = (score: number, opponent: number) => {
  const nextScore = score + 1;
  return nextScore >= GAME_POINT && nextScore - opponent >= WIN_DIFF;
};

type UseScoreboardProps = {
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

  const display = {
    current,
    rawWinner,
    rawMatchWinner,
    winner: pick(rawWinner, flip(rawWinner)),
    matchWinner: pick(rawMatchWinner, flip(rawMatchWinner)),
    leftName: pick(leftName, rightName),
    rightName: pick(rightName, leftName),
    leftScore: pick(current?.leftScore ?? 0, current?.rightScore ?? 0),
    rightScore: pick(current?.rightScore ?? 0, current?.leftScore ?? 0),
    leftWins: pick(summary.leftWins, summary.rightWins),
    rightWins: pick(summary.rightWins, summary.leftWins),
    server: pick(rawServer, flip(rawServer)),
    leftMatchPoint: pick(leftMatchPoint, rightMatchPoint),
    rightMatchPoint: pick(rightMatchPoint, leftMatchPoint),
    currentFinished: current ? isGameFinished(current) : false,
  };

  const locked = gameIndex >= lockedFromIndex;
  const nextGameIndex = gameIndex + 1;
  const canAdvance =
    !display.rawMatchWinner && nextGameIndex < games.length && nextGameIndex < lockedFromIndex;
  const showNextGameBtn =
    display.currentFinished && !!display.rawWinner && canAdvance && !showResult;
  const showResultBtn = !!display.rawMatchWinner && !showResult;
  const showBackBtn = !!display.rawMatchWinner && showResult;

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

  return {
    gameIndex,
    setGameIndex,
    swapped,
    isPortrait,
    display,
    locked,
    nextGameIndex,
    showNextGameBtn,
    showResultBtn,
    showBackBtn,
    showResult,
    canSubLeft,
    canSubRight,
    onSwap: () => setSwapped((previous) => !previous),
    onShowResult: () => setShowResult(true),
    onAddLeft: () => addPoint(SIDE.LEFT),
    onSubLeft: () => undoPoint(SIDE.LEFT),
    onAddRight: () => addPoint(SIDE.RIGHT),
    onSubRight: () => undoPoint(SIDE.RIGHT),
    onBack,
    onCloseAll,
  };
};
