import { useEffect, useRef, useState } from 'react';
import type { Game } from '../domain/match';
import { gameWinner, isGameFinished, matchSummary } from '../domain/match';

type Props = {
  leftName: string;
  rightName: string;
  games: Game[];
  setGames: (games: Game[]) => void;
  lockedFromIndex: number;
  initialGameIndex: number;
  onBack: () => void;
};

export const ScoreboardScreen = ({
  leftName,
  rightName,
  games,
  setGames,
  lockedFromIndex,
  initialGameIndex,
  onBack,
}: Props) => {
  const [idx, setIdx] = useState(initialGameIndex);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait) and (max-width: 900px)');
    const update = () => setIsPortrait(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const current = games[idx];
  const locked = idx >= lockedFromIndex;
  const sm = matchSummary(games);
  const winner = current ? gameWinner(current) : null;
  const matchWinner = sm.winner;

  const setScore = (side: 'L' | 'R', next: number) => {
    if (locked) return;
    const clamped = Math.max(0, Math.min(30, next));
    setGames(
      games.map((g, i) =>
        i === idx
          ? side === 'L'
            ? { ...g, leftScore: clamped }
            : { ...g, rightScore: clamped }
          : g,
      ),
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black text-white flex flex-col select-none"
      style={{ touchAction: 'none' }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/20 shrink-0">
        <button
          type="button"
          onClick={onBack}
          aria-label="もどる"
          className="px-4 py-2 text-base font-extrabold rounded-lg border-2 border-white/60 hover:bg-white/10 active:scale-95 transition"
        >
          ← もどる
        </button>
        <div className="flex gap-1 flex-wrap justify-center">
          {games.map((g, i) => {
            const empty = g.leftScore === 0 && g.rightScore === 0;
            const done = isGameFinished(g);
            const isLocked = i >= lockedFromIndex;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                disabled={isLocked && empty}
                className={`min-w-[44px] px-2 py-1 text-sm font-extrabold rounded border-2 ${
                  i === idx
                    ? 'bg-white text-black border-white'
                    : done
                      ? 'border-success text-success'
                      : isLocked && empty
                        ? 'border-white/20 text-white/30'
                        : 'border-white/60 text-white'
                }`}
              >
                G{i + 1}
              </button>
            );
          })}
        </div>
        <div className="w-[110px]" />
      </div>

      {isPortrait && (
        <div className="bg-amber-500 text-black text-center text-sm font-extrabold py-1">
          端末を横向きにしてください
        </div>
      )}

      <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-stretch">
        <ScoreColumn
          name={leftName}
          score={current?.leftScore ?? 0}
          gameWins={sm.leftWins}
          isGameWinner={winner === 'L'}
          isMatchWinner={matchWinner === 'L'}
          disabled={locked}
          onAdd={() => setScore('L', (current?.leftScore ?? 0) + 1)}
          onSub={() => setScore('L', (current?.leftScore ?? 0) - 1)}
        />

        <div className="flex flex-col items-center justify-center px-2 sm:px-6 border-x border-white/20 min-w-[72px]">
          <div className="text-xs sm:text-base text-white/60 font-bold">ゲーム {idx + 1}</div>
          <div className="text-3xl sm:text-5xl font-extrabold mt-2">
            <span className={matchWinner === 'L' ? 'text-success' : ''}>{sm.leftWins}</span>
            <span className="mx-2 text-white/40">-</span>
            <span className={matchWinner === 'R' ? 'text-success' : ''}>{sm.rightWins}</span>
          </div>
          <div className="text-xs sm:text-sm text-white/60 mt-1">取得ゲーム数</div>
          {locked && (
            <div className="mt-3 text-xs sm:text-sm font-extrabold text-amber-300">
              入力不可
            </div>
          )}
        </div>

        <ScoreColumn
          name={rightName}
          score={current?.rightScore ?? 0}
          gameWins={sm.rightWins}
          isGameWinner={winner === 'R'}
          isMatchWinner={matchWinner === 'R'}
          disabled={locked}
          onAdd={() => setScore('R', (current?.rightScore ?? 0) + 1)}
          onSub={() => setScore('R', (current?.rightScore ?? 0) - 1)}
        />
      </div>
    </div>
  );
};

type ColProps = {
  name: string;
  score: number;
  gameWins: number;
  isGameWinner: boolean;
  isMatchWinner: boolean;
  disabled: boolean;
  onAdd: () => void;
  onSub: () => void;
};

const SWIPE_THRESHOLD = 40;

const ScoreColumn = ({
  name,
  score,
  isGameWinner,
  isMatchWinner,
  disabled,
  onAdd,
  onSub,
}: ColProps) => {
  const startY = useRef<number | null>(null);
  const accum = useRef(0);

  const onTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    startY.current = e.touches[0].clientY;
    accum.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (disabled || startY.current == null) return;
    const dy = startY.current - e.touches[0].clientY;
    const delta = dy - accum.current;
    if (Math.abs(delta) >= SWIPE_THRESHOLD) {
      if (delta > 0) onAdd();
      else onSub();
      accum.current = dy;
    }
  };
  const onTouchEnd = () => {
    startY.current = null;
    accum.current = 0;
  };

  const highlight = isGameWinner || isMatchWinner;

  return (
    <div
      className={`flex flex-col items-stretch justify-between p-3 sm:p-6 ${
        isMatchWinner ? 'bg-success/20' : ''
      }`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className={`text-center text-base sm:text-2xl font-extrabold truncate ${
          highlight ? 'text-success' : ''
        }`}
        title={name}
      >
        {name}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        <button
          type="button"
          aria-label={`${name} を1増やす`}
          onClick={onAdd}
          disabled={disabled || score >= 30}
          className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border-4 border-white/60 text-3xl sm:text-5xl font-extrabold leading-none disabled:opacity-30 hover:bg-white/10 active:scale-95 transition"
        >
          ＋
        </button>

        <div
          className={`text-[20vh] sm:text-[28vh] leading-none font-extrabold tabular-nums ${
            highlight ? 'text-success' : ''
          }`}
        >
          {score}
        </div>

        <button
          type="button"
          aria-label={`${name} を1減らす`}
          onClick={onSub}
          disabled={disabled || score <= 0}
          className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border-4 border-white/60 text-3xl sm:text-5xl font-extrabold leading-none disabled:opacity-30 hover:bg-white/10 active:scale-95 transition"
        >
          −
        </button>
      </div>

      <div className="text-center text-xs sm:text-sm text-white/50">
        {disabled ? '入力不可' : '上下スワイプでも加減できます'}
      </div>
    </div>
  );
};
