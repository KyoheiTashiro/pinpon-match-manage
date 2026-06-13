import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Match, Participant } from '../../../../store/types';
import type { Game, Side } from '../../../../domain/match';
import {
  isGameFinished,
  gameWinner,
  winsNeededForBestOf,
} from '../../../../domain/match';
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

export const MatchModal = ({ matchId, participants, onClose }: Props) => {
  const match = useAppStore((s) => s.matches[matchId]);
  const updateMatch = useAppStore((s) => s.updateMatch);
  const deleteMatch = useAppStore((s) => s.deleteMatch);
  const bestOf = useAppStore((s) =>
    match ? (s.tournaments[match.tournamentId]?.bestOf ?? 5) : 5,
  );
  const wins = winsNeededForBestOf(bestOf);
  const [games, setGames] = useState<Game[]>(() =>
    padGames(match?.games ?? [], bestOf),
  );
  const firstServer: Side | undefined = match?.firstServer;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [scoreboardOpen, setScoreboardOpen] = useState(false);

  useEffect(() => {
    if (!match) onClose();
  }, [match, onClose]);

  if (!match) return null;

  const computeLockedFromIndex = (src: Game[]): number => {
    let lw = 0;
    let rw = 0;
    for (let i = 0; i < src.length; i++) {
      const g = src[i];
      if (g.leftScore === 0 && g.rightScore === 0) continue;
      if (!isGameFinished(g)) continue;
      if (g.leftScore > g.rightScore) lw++;
      else rw++;
      if (lw === wins || rw === wins) return i + 1;
    }
    return bestOf;
  };

  const lockedFromIndex = computeLockedFromIndex(games);

  const persistGames = (next: Game[]) => {
    setGames(next);
    const lockIdx = computeLockedFromIndex(next);
    updateMatch(match.id, { games: trimGames(next, lockIdx) });
  };

  const setFirstServer = (side: Side) => {
    updateMatch(match.id, { firstServer: side });
  };

  return createPortal(
    <div
      role="button"
      tabIndex={-1}
      aria-label="閉じる"
      className="fixed inset-0 z-40 flex items-start justify-center bg-black/50 p-2 sm:p-4 pb-28 sm:pb-28 overflow-y-auto"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === 'Escape') onClose();
      }}
    >
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- role="dialog" はランドマークだがstopPropagationが必要 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-title"
        tabIndex={-1}
        className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-2xl border-4 border-line my-4"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
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

        <fieldset className="mb-4 border-2 border-line rounded-xl p-3">
          <legend className="px-2 font-bold">最初のサーブ</legend>
          <div className="flex flex-col sm:flex-row gap-2">
            <label
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer flex-1 ${
                firstServer === 'L' ? 'border-orange-500 bg-orange-50' : 'border-line bg-white'
              }`}
            >
              <input
                type="radio"
                name="first-server"
                value="L"
                checked={firstServer === 'L'}
                onChange={() => setFirstServer('L')}
                aria-label={`最初のサーブ: ${sideLabel(match.leftSide, participants)}`}
                className="w-5 h-5 accent-orange-500"
              />
              <span className="font-bold">{sideLabel(match.leftSide, participants)}</span>
            </label>
            <label
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer flex-1 ${
                firstServer === 'R' ? 'border-orange-500 bg-orange-50' : 'border-line bg-white'
              }`}
            >
              <input
                type="radio"
                name="first-server"
                value="R"
                checked={firstServer === 'R'}
                onChange={() => setFirstServer('R')}
                aria-label={`最初のサーブ: ${sideLabel(match.rightSide, participants)}`}
                className="w-5 h-5 accent-orange-500"
              />
              <span className="font-bold">{sideLabel(match.rightSide, participants)}</span>
            </label>
          </div>
        </fieldset>

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
                <span className="font-extrabold text-base px-3 py-1">
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

        <div className="flex flex-wrap gap-3 justify-end">
          <BigButton variant="danger" onClick={() => setConfirmDelete(true)}>試合結果を削除</BigButton>
        </div>
      </div>

      {scoreboardOpen && (
        <ScoreboardScreen
          leftName={sideLabel(match.leftSide, participants)}
          rightName={sideLabel(match.rightSide, participants)}
          games={games}
          setGames={persistGames}
          lockedFromIndex={lockedFromIndex}
          winsNeeded={wins}
          matchFirstServer={firstServer}
          initialGameIndex={Math.max(
            0,
            Math.min(
              bestOf - 1,
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
          onCloseAll={onClose}
        />
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="試合結果を削除"
        message="この試合結果を削除します。取り消せません。"
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

const padGames = (games: Game[], totalGames: number): Game[] => {
  const out: Game[] = [...games];
  while (out.length < totalGames) out.push({ leftScore: 0, rightScore: 0 });
  return out.slice(0, totalGames);
};
