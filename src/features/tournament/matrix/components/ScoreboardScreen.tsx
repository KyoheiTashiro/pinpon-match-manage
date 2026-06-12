import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Game, Side } from '../../../../domain/match';
import { addPointToGame, undoLastPoint, lastScorer } from '../../../../domain/match';
import { usePortrait } from './scoreboard/useOrientation';
import { useDisplayMapping } from './scoreboard/useDisplayMapping';
import { ScoreboardHeader } from './scoreboard/ScoreboardHeader';
import { ScoreInputView } from './scoreboard/ScoreInputView';
import { MatchResultView } from './scoreboard/MatchResultView';

type Props = {
  leftName: string;
  rightName: string;
  games: Game[];
  setGames: (games: Game[]) => void;
  lockedFromIndex: number;
  initialGameIndex: number;
  winsNeeded: number;
  matchFirstServer?: Side;
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
  const [idx, setIdx] = useState(initialGameIndex);
  const [swapped, setSwapped] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const isPortrait = usePortrait();

  const d = useDisplayMapping({
    leftName,
    rightName,
    games,
    idx,
    swapped,
    winsNeeded,
    matchFirstServer,
  });

  const locked = idx >= lockedFromIndex;
  const nextIdx = idx + 1;
  const canAdvance = !d.rawMatchWinner && nextIdx < games.length && nextIdx < lockedFromIndex;
  const showNextGameBtn = d.currentFinished && !!d.rawWinner && canAdvance && !showResult;
  const showResultBtn = !!d.rawMatchWinner && !showResult;
  const showBackBtn = !!d.rawMatchWinner && showResult;

  const addPoint = (displaySide: Side) => {
    if (locked) return;
    const actualSide: Side = swapped ? (displaySide === 'L' ? 'R' : 'L') : displaySide;
    setGames(games.map((g, i) => (i === idx ? addPointToGame(g, actualSide) : g)));
  };

  const undoPoint = (displaySide: Side) => {
    if (locked) return;
    const actualSide: Side = swapped ? (displaySide === 'L' ? 'R' : 'L') : displaySide;
    const current = games[idx];
    if (!current) return;
    if (lastScorer(current) !== actualSide) return;
    setGames(games.map((g, i) => (i === idx ? undoLastPoint(g) : g)));
  };

  const currentGame = games[idx];
  const rawLastScorer = lastScorer(currentGame ?? { leftScore: 0, rightScore: 0 });
  const actualLeft: Side = swapped ? 'R' : 'L';
  const actualRight: Side = swapped ? 'L' : 'R';
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
        touchAction: 'none',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <ScoreboardHeader
        games={games}
        idx={idx}
        setIdx={setIdx}
        lockedFromIndex={lockedFromIndex}
        showResult={showResult}
        showNextGameBtn={showNextGameBtn}
        showResultBtn={showResultBtn}
        showBackBtn={showBackBtn}
        nextIdx={nextIdx}
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
          leftName={d.leftName}
          rightName={d.rightName}
          leftWins={d.leftWins}
          rightWins={d.rightWins}
          matchWinner={d.matchWinner}
          games={games}
          swapped={swapped}
        />
      ) : (
        <ScoreInputView
          leftName={d.leftName}
          rightName={d.rightName}
          leftScore={d.leftScore}
          rightScore={d.rightScore}
          leftWins={d.leftWins}
          rightWins={d.rightWins}
          winner={d.winner}
          matchWinner={d.matchWinner}
          leftMatchPoint={d.leftMatchPoint}
          rightMatchPoint={d.rightMatchPoint}
          server={d.server}
          locked={locked}
          swapped={swapped}
          onSwap={() => setSwapped((s) => !s)}
          onAddLeft={() => addPoint('L')}
          onSubLeft={() => undoPoint('L')}
          onAddRight={() => addPoint('R')}
          onSubRight={() => undoPoint('R')}
          canSubLeft={canSubLeft}
          canSubRight={canSubRight}
        />
      )}
    </div>,
    document.body,
  );
};
