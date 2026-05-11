import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Match, Participant } from '../../../../store/types';
import type { Game } from '../../../../domain/match';
import { matchSummary, isGameFinished, gameWinner } from '../../../../domain/match';
import { useAppStore } from '../../../../store/useAppStore';
import { BigButton } from '../../../../components/ui/BigButton';
import { ConfirmDialog } from '../../../../components/ui/ConfirmDialog';
import { ScoreboardScreen } from './ScoreboardScreen';

type Props = {
  matchId: string;
  participants: Record<string, Participant>;
  onClose: () => void;
};

const sideLabel = (side: Match['leftSide'], participants: Record<string, Participant>) => {
  if (side.kind === 'single') return participants[side.participantId]?.name ?? '?';
  return side.memberIds.map((id) => participants[id]?.name ?? '?').join(' / ');
};

export const MatchModal = ({ matchId, participants, onClose }: Props) => {
  const match = useAppStore((s) => s.matches[matchId]);
  const updateMatch = useAppStore((s) => s.updateMatch);
  const deleteMatch = useAppStore((s) => s.deleteMatch);
  const [games, setGames] = useState<Game[]>(() =>
    padGames(match?.games ?? []),
  );
  const [note, setNote] = useState(match?.note ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [scoreboardOpen, setScoreboardOpen] = useState(false);

  useEffect(() => {
    if (!match) onClose();
  }, [match, onClose]);

  if (!match) return null;

  const summary = matchSummary(games.filter((g) => g.leftScore !== 0 || g.rightScore !== 0));

  const computeLockedFromIndex = (src: Game[]): number => {
    let lw = 0;
    let rw = 0;
    for (let i = 0; i < src.length; i++) {
      const g = src[i];
      if (g.leftScore === 0 && g.rightScore === 0) continue;
      if (!isGameFinished(g)) continue;
      if (g.leftScore > g.rightScore) lw++;
      else rw++;
      if (lw === 3 || rw === 3) return i + 1;
    }
    return 5;
  };

  const lockedFromIndex = computeLockedFromIndex(games);

  const trimGames = (src: Game[], lockIdx: number): Game[] => {
    const out: Game[] = [];
    for (let i = 0; i < src.length; i++) {
      const g = src[i];
      const empty = g.leftScore === 0 && g.rightScore === 0;
      if (empty && i >= lockIdx) continue;
      if (i < lockIdx || !empty) out.push(g);
    }
    return out;
  };

  const persistGames = (next: Game[]) => {
    setGames(next);
    const lockIdx = computeLockedFromIndex(next);
    updateMatch(match.id, { games: trimGames(next, lockIdx) });
  };

  const save = () => {
    updateMatch(match.id, {
      games: trimGames(games, lockedFromIndex),
      note: note || undefined,
    });
    onClose();
  };

  const winnerLabel =
    summary.winner === 'L'
      ? `${sideLabel(match.leftSide, participants)} の勝ち`
      : summary.winner === 'R'
        ? `${sideLabel(match.rightSide, participants)} の勝ち`
        : '';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-title"
      className="fixed inset-0 z-40 flex items-start justify-center bg-black/50 p-2 sm:p-4 pb-28 sm:pb-28 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-2xl border-4 border-line my-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <h2 id="match-title" className="text-xl font-extrabold">試合の入力</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="w-10 h-10 rounded-lg bg-white border-2 border-line text-2xl font-extrabold leading-none flex items-center justify-center hover:bg-bg active:scale-95 transition"
          >
            ×
          </button>
        </div>

        <div className="text-2xl font-extrabold text-center mb-4">
          {sideLabel(match.leftSide, participants)}
          <span className="mx-3 text-line">対</span>
          {sideLabel(match.rightSide, participants)}
        </div>

        <div className="mb-4">
          <BigButton
            variant="primary"
            className="w-full"
            onClick={() => setScoreboardOpen(true)}
          >
            ▶ スコアボードを開く
          </BigButton>
          <p className="text-sub text-sm mt-2">
            ゲームごとの点数加減はスコアボード画面で行います。
          </p>
        </div>

        <ul className="space-y-2 mb-4 border-2 border-line rounded-xl divide-y-2 divide-line overflow-hidden">
          {games.map((g, i) => {
            const locked = i >= lockedFromIndex;
            const empty = g.leftScore === 0 && g.rightScore === 0;
            const w = gameWinner(g);
            return (
              <li
                key={i}
                className={`flex items-center justify-between px-3 py-2 ${
                  locked ? 'bg-bg opacity-60' : 'bg-white'
                }`}
              >
                <span className="font-extrabold text-base bg-blue-500 text-white px-3 py-1 rounded">
                  ゲーム{i + 1}
                </span>
                <span className="text-xl font-extrabold tabular-nums">
                  {locked && empty ? (
                    <span className="text-sub text-base font-bold">入力不可</span>
                  ) : empty ? (
                    <span className="text-sub text-base font-bold">未入力</span>
                  ) : (
                    <>
                      <span className={w === 'L' ? 'text-success' : ''}>{g.leftScore}</span>
                      <span className="mx-2 text-sub">-</span>
                      <span className={w === 'R' ? 'text-success' : ''}>{g.rightScore}</span>
                      {!w && !empty && !isGameFinished(g) && (
                        <span className="ml-2 text-sm font-bold text-sub">(進行中)</span>
                      )}
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </ul>

        {winnerLabel && (
          <div className="text-2xl font-extrabold text-success text-center mb-4">
            {winnerLabel}（{summary.leftWins} - {summary.rightWins}）
          </div>
        )}

        <label className="flex flex-col gap-1 mb-4">
          <span className="font-bold">メモ</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="border-2 border-line rounded-xl p-3 text-base bg-white min-h-[80px]"
          />
        </label>

        <div className="flex flex-wrap gap-3 justify-end">
          <BigButton variant="danger" onClick={() => setConfirmDelete(true)}>削除</BigButton>
          <BigButton variant="primary" onClick={save}>保存</BigButton>
        </div>
      </div>

      {scoreboardOpen && (
        <ScoreboardScreen
          leftName={sideLabel(match.leftSide, participants)}
          rightName={sideLabel(match.rightSide, participants)}
          games={games}
          setGames={persistGames}
          lockedFromIndex={lockedFromIndex}
          initialGameIndex={Math.max(
            0,
            Math.min(
              4,
              (() => {
                for (let i = 0; i < games.length; i++) {
                  if (i >= lockedFromIndex) break;
                  const g = games[i];
                  if (!isGameFinished(g)) return i;
                }
                return Math.max(0, lockedFromIndex - 1);
              })(),
            ),
          )}
          onBack={() => setScoreboardOpen(false)}
        />
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="試合を削除"
        message="この試合の記録を削除します。取り消せません。"
        confirmLabel="削除する"
        cancelLabel="やめる"
        destructive
        onConfirm={() => {
          deleteMatch(match.id);
          setConfirmDelete(false);
          onClose();
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>,
    document.body,
  );
};

const padGames = (games: Game[]): Game[] => {
  const out: Game[] = [...games];
  while (out.length < 5) out.push({ leftScore: 0, rightScore: 0 });
  return out.slice(0, 5);
};
