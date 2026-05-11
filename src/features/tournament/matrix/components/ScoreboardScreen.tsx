import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Game, Side } from '../../../../domain/match';
import {
  gameWinner,
  isGameFinished,
  matchSummary,
  gameFirstServer,
  currentServer,
} from '../../../../domain/match';
import { ConfirmDialog } from '../../../../components/ui/ConfirmDialog';

type Props = {
  leftName: string;
  rightName: string;
  games: Game[];
  setGames: (games: Game[]) => void;
  lockedFromIndex: number;
  initialGameIndex: number;
  matchFirstServer?: Side;
  onBack: () => void;
};

export const ScoreboardScreen = ({
  leftName,
  rightName,
  games,
  setGames,
  lockedFromIndex,
  initialGameIndex,
  matchFirstServer,
  onBack,
}: Props) => {
  const [idx, setIdx] = useState(initialGameIndex);
  const [isPortrait, setIsPortrait] = useState(false);
  const [nextDialogOpen, setNextDialogOpen] = useState(false);
  const [swapped, setSwapped] = useState(false);
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
  const rawWinner = current ? gameWinner(current) : null;
  const rawMatchWinner = sm.winner;
  const flip = (s: 'L' | 'R' | null) => (s === 'L' ? 'R' : s === 'R' ? 'L' : null);
  const winner = swapped ? flip(rawWinner) : rawWinner;
  const matchWinner = swapped ? flip(rawMatchWinner) : rawMatchWinner;
  const displayLeftName = swapped ? rightName : leftName;
  const displayRightName = swapped ? leftName : rightName;
  const displayLeftScore = swapped ? (current?.rightScore ?? 0) : (current?.leftScore ?? 0);
  const displayRightScore = swapped ? (current?.leftScore ?? 0) : (current?.rightScore ?? 0);
  const displayLeftWins = swapped ? sm.rightWins : sm.leftWins;
  const displayRightWins = swapped ? sm.leftWins : sm.rightWins;
  const rawServer: Side | null =
    matchFirstServer && current
      ? currentServer(current, gameFirstServer(matchFirstServer, idx))
      : null;
  const displayServer = swapped ? flip(rawServer) : rawServer;
  const isGamePoint = (s: number, o: number) => {
    const ns = s + 1;
    return ns >= 11 && ns - o >= 2;
  };
  const gameOpen = current ? !isGameFinished(current) && !rawMatchWinner : false;
  const leftMatchPoint =
    gameOpen && current ? isGamePoint(current.leftScore, current.rightScore) : false;
  const rightMatchPoint =
    gameOpen && current ? isGamePoint(current.rightScore, current.leftScore) : false;
  const displayLeftMatchPoint = swapped ? rightMatchPoint : leftMatchPoint;
  const displayRightMatchPoint = swapped ? leftMatchPoint : rightMatchPoint;
  const currentFinished = current ? isGameFinished(current) : false;
  const nextIdx = idx + 1;
  const canAdvance = !rawMatchWinner && nextIdx < games.length && nextIdx < lockedFromIndex;

  useEffect(() => {
    if (currentFinished && rawWinner && canAdvance && !dismissedRef.current.has(idx)) {
      setNextDialogOpen(true);
    } else {
      setNextDialogOpen(false);
    }
  }, [currentFinished, rawWinner, canAdvance, idx]);

  const setScore = (displaySide: 'L' | 'R', next: number) => {
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
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] bg-blue-800 text-white flex flex-col select-none"
      style={{
        touchAction: 'none',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
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
          name={displayLeftName}
          score={displayLeftScore}
          gameWins={displayLeftWins}
          isGameWinner={winner === 'L'}
          isMatchWinner={matchWinner === 'L'}
          isMatchPoint={displayLeftMatchPoint}
          isServing={displayServer === 'L'}
          disabled={locked}
          onAdd={() => setScore('L', displayLeftScore + 1)}
          onSub={() => setScore('L', displayLeftScore - 1)}
        />

        <div className="flex flex-col items-center justify-center px-1 sm:px-3 border-x border-white/20 min-w-[56px]">
          <div className="text-xs sm:text-base text-white/60 font-bold">ゲーム {idx + 1}</div>
          <div className="text-3xl sm:text-5xl font-extrabold mt-2">
            <span className={matchWinner === 'L' ? 'text-success' : ''}>{displayLeftWins}</span>
            <span className="mx-2 text-white/40">-</span>
            <span className={matchWinner === 'R' ? 'text-success' : ''}>{displayRightWins}</span>
          </div>
          {locked && (
            <div className="mt-3 text-xs sm:text-sm font-extrabold text-amber-300">
              入力不可
            </div>
          )}
          <button
            type="button"
            onClick={() => setSwapped((s) => !s)}
            aria-label="左右を入れ替える"
            aria-pressed={swapped}
            className="mt-3 px-2 py-1 text-xs sm:text-sm font-extrabold rounded-lg border-2 border-white/60 hover:bg-white/10 active:scale-95 transition"
          >
            ⇄ 入替
          </button>
        </div>

        <ScoreColumn
          name={displayRightName}
          score={displayRightScore}
          gameWins={displayRightWins}
          isGameWinner={winner === 'R'}
          isMatchWinner={matchWinner === 'R'}
          isMatchPoint={displayRightMatchPoint}
          isServing={displayServer === 'R'}
          disabled={locked}
          onAdd={() => setScore('R', displayRightScore + 1)}
          onSub={() => setScore('R', displayRightScore - 1)}
        />
      </div>

      <ConfirmDialog
        open={nextDialogOpen}
        title={`ゲーム${idx + 1} 終了`}
        message={`${winner === 'L' ? displayLeftName : displayRightName} の勝利！`}
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
  isMatchPoint: boolean;
  isServing: boolean;
  disabled: boolean;
  onAdd: () => void;
  onSub: () => void;
};

const ScoreColumn = ({
  name,
  score,
  isGameWinner,
  isMatchWinner,
  isMatchPoint,
  isServing,
  disabled,
  onAdd,
  onSub,
}: ColProps) => {
  const highlight = isGameWinner || isMatchWinner;
  const scoreColor = highlight
    ? 'text-success'
    : isMatchPoint
      ? 'text-yellow-400'
      : 'text-white';

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
          className={`relative h-full aspect-[5/4] max-w-full rounded-2xl overflow-hidden border-2 ${
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
              className={`text-[clamp(6rem,44vh,28rem)] leading-none font-extrabold tabular-nums ${scoreColor}`}
            >
              {score}
            </span>
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-black z-10" />
        </div>
      </div>

      <div
        className={`shrink-0 h-2 sm:h-3 rounded-full mx-2 sm:mx-4 mt-1 transition-colors ${
          isServing ? 'bg-orange-500' : 'bg-transparent'
        }`}
        aria-label={isServing ? 'サーブ権あり' : undefined}
      />

      {disabled && (
        <div className="shrink-0 text-center text-xs sm:text-sm text-white/50">入力不可</div>
      )}
    </div>
  );
};
