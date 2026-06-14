import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { SIDE } from "@/domain/match";
import type { Game, Side } from "@/domain/match";
import {
  addPointToGame,
  undoLastPoint,
  lastScorer,
  gameWinner,
  isGameFinished,
  matchSummary,
  gameFirstServer,
  currentServer,
} from "@/domain/match";
import { GAME_POINT, WIN_DIFF } from "@/domain/constants";
import { ScoreboardHeader } from "@/features/tournament/matrix/components/scoreboard/ScoreboardHeader";
import { ScoreInputView } from "@/features/tournament/matrix/components/scoreboard/ScoreInputView";
import { MatchResultView } from "@/features/tournament/matrix/components/scoreboard/MatchResultView";

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

type Props = {
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

export const ScoreboardScreen = ({
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
}: Props) => {
  const [gameIndex, setGameIndex] = useState(initialGameIndex);
  const [swapped, setSwapped] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const isPortrait = useSyncExternalStore(subscribePortrait, getPortraitSnapshot);

  // swapped 表示時は left/right を入れ替えて選ぶ
  const pick = <T,>(left: T, right: T): T => (swapped ? right : left);

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

  return createPortal(
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- フルスクリーンoverlay。stopPropagation必要
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- ネイティブ<dialog>は不使用
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      className="fixed inset-0 z-[60] bg-blue-800 text-white flex flex-col select-none overflow-x-hidden"
      style={{
        touchAction: "none",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <ScoreboardHeader
        games={games}
        gameIndex={gameIndex}
        setGameIndex={setGameIndex}
        lockedFromIndex={lockedFromIndex}
        showResult={showResult}
        showNextGameBtn={showNextGameBtn}
        showResultBtn={showResultBtn}
        showBackBtn={showBackBtn}
        nextGameIndex={nextGameIndex}
        onBack={onBack}
        onShowResult={() => setShowResult(true)}
        onCloseAll={onCloseAll}
      />

      {isPortrait && (
        <div className="bg-amber-500 text-black text-center text-sm font-extrabold py-1 px-2 leading-tight">
          端末を横向きにしてください
          <span className="block text-xs font-bold">
            （画面の回転ロックがオンの場合は、解除してください）
          </span>
        </div>
      )}

      {showResult ? (
        <MatchResultView
          leftName={display.leftName}
          rightName={display.rightName}
          leftWins={display.leftWins}
          rightWins={display.rightWins}
          matchWinner={display.matchWinner}
          games={games}
          swapped={swapped}
        />
      ) : (
        <ScoreInputView
          leftName={display.leftName}
          rightName={display.rightName}
          leftScore={display.leftScore}
          rightScore={display.rightScore}
          leftWins={display.leftWins}
          rightWins={display.rightWins}
          winner={display.winner}
          matchWinner={display.matchWinner}
          leftMatchPoint={display.leftMatchPoint}
          rightMatchPoint={display.rightMatchPoint}
          server={display.server}
          locked={locked}
          swapped={swapped}
          onSwap={() => setSwapped((previous) => !previous)}
          onAddLeft={() => addPoint(SIDE.LEFT)}
          onSubLeft={() => undoPoint(SIDE.LEFT)}
          onAddRight={() => addPoint(SIDE.RIGHT)}
          onSubRight={() => undoPoint(SIDE.RIGHT)}
          canSubLeft={canSubLeft}
          canSubRight={canSubRight}
        />
      )}
    </div>,
    document.body,
  );
};
