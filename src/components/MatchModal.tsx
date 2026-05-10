import { useEffect, useState } from 'react';
import type { Match, Participant } from '../store/types';
import type { Game } from '../domain/match';
import { matchSummary, isGameFinished } from '../domain/match';
import { useAppStore } from '../store/useAppStore';
import { BigButton } from './BigButton';
import { ScoreInput } from './ScoreInput';
import { ConfirmDialog } from './ConfirmDialog';
import { fromLocalInputValue, toLocalInputValue, nowJstHHMM } from '../lib/time';
import { TimePickerModal } from './TimePickerModal';

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
  const tournament = useAppStore((s) =>
    match ? s.tournaments[match.tournamentId] : undefined,
  );

  const [games, setGames] = useState<Game[]>(() =>
    padGames(match?.games ?? []),
  );
  const [refereeId, setRefereeId] = useState(match?.refereeId ?? '');
  const [scorerId, setScorerId] = useState(match?.scorerId ?? '');
  const [startAt, setStartAt] = useState(toLocalInputValue(match?.startAt));
  const [endAt, setEndAt] = useState(toLocalInputValue(match?.endAt));
  const [note, setNote] = useState(match?.note ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pickerOpen, setPickerOpen] = useState<null | 'start' | 'end'>(null);

  useEffect(() => {
    if (!match) onClose();
  }, [match, onClose]);

  if (!match) return null;

  const summary = matchSummary(games.filter((g) => g.leftScore !== 0 || g.rightScore !== 0));
  const candidates =
    tournament?.participantIds.map((id) => participants[id]).filter(Boolean) ?? [];

  const lockedFromIndex = (() => {
    let lw = 0;
    let rw = 0;
    for (let i = 0; i < games.length; i++) {
      const g = games[i];
      if (g.leftScore === 0 && g.rightScore === 0) continue;
      if (!isGameFinished(g)) continue;
      if (g.leftScore > g.rightScore) lw++;
      else rw++;
      if (lw === 3 || rw === 3) return i + 1;
    }
    return 5;
  })();

  const setGame = (i: number, patch: Partial<Game>) => {
    setGames((prev) => prev.map((g, idx) => (idx === i ? { ...g, ...patch } : g)));
  };

  const save = () => {
    const trimmed: Game[] = [];
    for (let i = 0; i < games.length; i++) {
      const g = games[i];
      const empty = g.leftScore === 0 && g.rightScore === 0;
      if (empty && i >= lockedFromIndex) continue;
      if (i < lockedFromIndex || !empty) trimmed.push(g);
    }
    updateMatch(match.id, {
      games: trimmed,
      refereeId: refereeId || undefined,
      scorerId: scorerId || undefined,
      startAt: fromLocalInputValue(startAt),
      endAt: fromLocalInputValue(endAt),
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-title"
      className="fixed inset-0 z-40 flex items-start sm:items-center justify-center bg-black/50 p-2 sm:p-4 overflow-y-auto"
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
            onClick={save}
            aria-label="閉じる（保存）"
            className="min-h-btn min-w-btn rounded-xl border-2 border-line bg-white text-ink text-2xl font-extrabold leading-none hover:bg-bg active:scale-95 transition"
          >
            ✕
          </button>
        </div>

        <div className="text-2xl font-extrabold text-center mb-4">
          {sideLabel(match.leftSide, participants)}
          <span className="mx-3 text-line">対</span>
          {sideLabel(match.rightSide, participants)}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <label className="flex flex-col gap-1">
            <span className="font-bold">審判</span>
            <select
              value={refereeId}
              onChange={(e) => setRefereeId(e.target.value)}
              className="min-h-input border-2 border-line rounded-xl px-3 text-lg bg-white"
            >
              <option value="">— なし —</option>
              {candidates.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-bold">記録</span>
            <select
              value={scorerId}
              onChange={(e) => setScorerId(e.target.value)}
              className="min-h-input border-2 border-line rounded-xl px-3 text-lg bg-white"
            >
              <option value="">— なし —</option>
              {candidates.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <div className="flex flex-col gap-1">
            <span className="font-bold">開始時刻</span>
            <button
              type="button"
              onClick={() => {
                if (!startAt) setStartAt(nowJstHHMM());
                setPickerOpen('start');
              }}
              className="min-h-input border-2 border-line rounded-xl px-4 py-2 text-3xl font-extrabold bg-white text-left hover:bg-bg active:scale-[0.98] transition"
            >
              {startAt || <span className="text-sub">--:--</span>}
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold">終了時刻</span>
            <button
              type="button"
              onClick={() => {
                if (!endAt) setEndAt(nowJstHHMM());
                setPickerOpen('end');
              }}
              className="min-h-input border-2 border-line rounded-xl px-4 py-2 text-3xl font-extrabold bg-white text-left hover:bg-bg active:scale-[0.98] transition"
            >
              {endAt || <span className="text-sub">--:--</span>}
            </button>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {games.map((g, i) => {
            const locked = i >= lockedFromIndex;
            const winner = isGameFinished(g) ? (g.leftScore > g.rightScore ? 'L' : 'R') : null;
            return (
              <div
                key={i}
                className={`rounded-xl border-2 p-3 ${
                  locked ? 'bg-bg border-line opacity-60' : 'bg-white border-line'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-lg text-center bg-blue-500 text-white px-3 py-1 rounded">ゲーム{i + 1}</span>
                  {locked && <span className="text-base font-bold text-danger">入力不可</span>}
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-around gap-3 sm:flex-wrap">
                  <ScoreInput
                    label={sideLabel(match.leftSide, participants)}
                    value={g.leftScore}
                    onChange={(n) => setGame(i, { leftScore: n })}
                    disabled={locked}
                  />
                  <span className="text-xl sm:text-2xl font-extrabold text-sub">対</span>
                  <ScoreInput
                    label={sideLabel(match.rightSide, participants)}
                    value={g.rightScore}
                    onChange={(n) => setGame(i, { rightScore: n })}
                    disabled={locked}
                  />
                </div>
                {winner && (
                  <div className="mt-2 text-base font-bold text-center text-success">
                    {(winner === 'L'
                      ? sideLabel(match.leftSide, participants)
                      : sideLabel(match.rightSide, participants))}
                    {' の勝ち'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

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
          <BigButton variant="secondary" onClick={onClose}>キャンセル</BigButton>
          <BigButton variant="danger" onClick={() => setConfirmDelete(true)}>削除</BigButton>
          <BigButton variant="primary" onClick={save}>保存</BigButton>
        </div>
      </div>

      <TimePickerModal
        open={pickerOpen !== null}
        value={pickerOpen === 'start' ? startAt : pickerOpen === 'end' ? endAt : ''}
        title={pickerOpen === 'start' ? '開始時刻' : '終了時刻'}
        onChange={(v) => {
          if (pickerOpen === 'start') setStartAt(v);
          else if (pickerOpen === 'end') setEndAt(v);
        }}
        onClose={() => setPickerOpen(null)}
      />

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
    </div>
  );
};

const padGames = (games: Game[]): Game[] => {
  const out: Game[] = [...games];
  while (out.length < 5) out.push({ leftScore: 0, rightScore: 0 });
  return out.slice(0, 5);
};
