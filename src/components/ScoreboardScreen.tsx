import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Game } from '../domain/match';
import { gameWinner, isGameFinished, matchSummary } from '../domain/match';
import { ConfirmDialog } from './ConfirmDialog';

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
  const [nextDialogOpen, setNextDialogOpen] = useState(false);
  const dismissedRef = useRef<Set<number>>(new Set());

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
  const currentFinished = current ? isGameFinished(current) : false;
  const nextIdx = idx + 1;
  const canAdvance = !matchWinner && nextIdx < games.length && nextIdx < lockedFromIndex;

  useEffect(() => {
    if (currentFinished && winner && canAdvance && !dismissedRef.current.has(idx)) {
      setNextDialogOpen(true);
    } else {
      setNextDialogOpen(false);
    }
  }, [currentFinished, winner, canAdvance, idx]);

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

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] bg-black text-white flex flex-col select-none"
      style={{ touchAction: 'none' }}
      onClick={(e) => e.stopPropagation()}
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
        <div className="bg-amber-500 text-black text-center text-sm font-extrabold py-1 px-2 leading-tight">
          端末を横向きにしてください
          <span className="block text-xs font-bold">
            （画面の回転ロックがオンの場合は、解除してください）
          </span>
        </div>
      )}

      <div className="flex-1 min-h-0 grid grid-cols-[1fr_auto_1fr] items-stretch">
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

        <div className="flex flex-col items-center justify-center px-1 sm:px-3 border-x border-white/20 min-w-[56px]">
          <div className="text-xs sm:text-base text-white/60 font-bold">ゲーム {idx + 1}</div>
          <div className="text-3xl sm:text-5xl font-extrabold mt-2">
            <span className={matchWinner === 'L' ? 'text-success' : ''}>{sm.leftWins}</span>
            <span className="mx-2 text-white/40">-</span>
            <span className={matchWinner === 'R' ? 'text-success' : ''}>{sm.rightWins}</span>
          </div>
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

      <ConfirmDialog
        open={nextDialogOpen}
        title={`ゲーム${idx + 1} 終了`}
        message={`${winner === 'L' ? leftName : rightName} の勝利！`}
        confirmLabel="次のゲームへ"
        cancelLabel="キャンセル"
        onConfirm={() => {
          dismissedRef.current.add(idx);
          setNextDialogOpen(false);
          setIdx(nextIdx);
        }}
        onCancel={() => {
          dismissedRef.current.add(idx);
          setNextDialogOpen(false);
        }}
      />
    </div>,
    document.body,
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

const ScoreColumn = ({
  name,
  score,
  isGameWinner,
  isMatchWinner,
  disabled,
  onAdd,
  onSub,
}: ColProps) => {
  const highlight = isGameWinner || isMatchWinner;

  return (
    <div
      className={`flex flex-col items-stretch min-h-0 p-1 sm:p-2 ${
        isMatchWinner ? 'bg-success/20' : ''
      }`}
    >
      <div
        className={`shrink-0 text-center text-base sm:text-2xl font-extrabold truncate ${
          highlight ? 'text-success' : ''
        }`}
        title={name}
      >
        {name}
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center py-1">
        <div
          className={`relative h-full aspect-square max-w-full rounded-2xl overflow-hidden border-2 ${
            isMatchWinner ? 'bg-success/20 border-success' : 'bg-neutral-900 border-white/30'
          }`}
        >
          <button
            type="button"
            aria-label={`${name} を1増やす`}
            onClick={onAdd}
            disabled={disabled || score >= 30}
            className="absolute inset-x-0 top-0 h-1/2 w-full hover:bg-white/5 active:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent transition"
          />
          <button
            type="button"
            aria-label={`${name} を1減らす`}
            onClick={onSub}
            disabled={disabled || score <= 0}
            className="absolute inset-x-0 bottom-0 h-1/2 w-full hover:bg-white/5 active:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent transition"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span
              className={`text-[clamp(6rem,44vh,28rem)] leading-none font-extrabold tabular-nums ${
                highlight ? 'text-success' : 'text-white'
              }`}
            >
              {score}
            </span>
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-black z-10" />
        </div>
      </div>

      {disabled && (
        <div className="shrink-0 text-center text-xs sm:text-sm text-white/50">入力不可</div>
      )}
    </div>
  );
};
