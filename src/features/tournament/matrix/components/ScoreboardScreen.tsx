import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Game, Side } from '../../../../domain/match';
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

  const setScore = (displaySide: Side, next: number) => {
    if (locked) return;
    const actualSide = swapped ? (displaySide === 'L' ? 'R' : 'L') : displaySide;
    const clamped = Math.max(0, Math.min(30, next));
    setGames(
      games.map((g, i) =>
        i === idx
          ? actualSide === 'L'
            ? { ...g, leftScore: clamped }
            : { ...g, rightScore: clamped }
          : g,
      ),
    );
  };

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
          onAddLeft={() => setScore('L', d.leftScore + 1)}
          onSubLeft={() => setScore('L', d.leftScore - 1)}
          onAddRight={() => setScore('R', d.rightScore + 1)}
          onSubRight={() => setScore('R', d.rightScore - 1)}
        />
      )}
    </div>,
    document.body,
  );
};
