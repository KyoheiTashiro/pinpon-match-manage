import { useState } from "react";
import { createPortal } from "react-dom";
import type { Game, Side } from "@/domain/match";
import { addPointToGame, undoLastPoint, lastScorer } from "@/domain/match";
import { usePortrait } from "@/features/tournament/matrix/components/scoreboard/useOrientation";
import { useDisplayMapping } from "@/features/tournament/matrix/components/scoreboard/useDisplayMapping";
import { ScoreboardHeader } from "@/features/tournament/matrix/components/scoreboard/ScoreboardHeader";
import { ScoreInputView } from "@/features/tournament/matrix/components/scoreboard/ScoreInputView";
import { MatchResultView } from "@/features/tournament/matrix/components/scoreboard/MatchResultView";

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
  const isPortrait = usePortrait();

  const display = useDisplayMapping({
    leftName,
    rightName,
    games,
    gameIndex,
    swapped,
    winsNeeded,
    matchFirstServer,
  });

  const locked = gameIndex >= lockedFromIndex;
  const nextGameIndex = gameIndex + 1;
  const canAdvance =
    !display.rawMatchWinner && nextGameIndex < games.length && nextGameIndex < lockedFromIndex;
  const showNextGameBtn =
    display.currentFinished && !!display.rawWinner && canAdvance && !showResult;
  const showResultBtn = !!display.rawMatchWinner && !showResult;
  const showBackBtn = !!display.rawMatchWinner && showResult;

  const addPoint = (displaySide: Side) => {
    if (locked) return;
    const actualSide: Side = swapped ? (displaySide === "L" ? "R" : "L") : displaySide;
    setGames(
      games.map((game, index) => (index === gameIndex ? addPointToGame(game, actualSide) : game)),
    );
  };

  const undoPoint = (displaySide: Side) => {
    if (locked) return;
    const actualSide: Side = swapped ? (displaySide === "L" ? "R" : "L") : displaySide;
    const current = games[gameIndex];
    if (!current) return;
    if (lastScorer(current) !== actualSide) return;
    setGames(games.map((game, index) => (index === gameIndex ? undoLastPoint(game) : game)));
  };

  const currentGame = games[gameIndex];
  const rawLastScorer = lastScorer(currentGame ?? { leftScore: 0, rightScore: 0 });
  const actualLeft: Side = swapped ? "R" : "L";
  const actualRight: Side = swapped ? "L" : "R";
  const canSubLeft = rawLastScorer === actualLeft;
  const canSubRight = rawLastScorer === actualRight;

  return createPortal(
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- role="dialog" はランドマークだがstopPropagationが必要
    <div
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
          onAddLeft={() => addPoint("L")}
          onSubLeft={() => undoPoint("L")}
          onAddRight={() => addPoint("R")}
          onSubRight={() => undoPoint("R")}
          canSubLeft={canSubLeft}
          canSubRight={canSubRight}
        />
      )}
    </div>,
    document.body,
  );
};
