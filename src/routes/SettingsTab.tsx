import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { BigButton } from '../components/BigButton';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatDate } from '../lib/time';

export const SettingsTab = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();
  const tournament = useAppStore((s) =>
    tournamentId ? s.tournaments[tournamentId] : undefined,
  );
  const resetTournament = useAppStore((s) => s.resetTournament);
  const deleteTournament = useAppStore((s) => s.deleteTournament);

  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!tournament || !tournamentId) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold">設定</h2>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-base">
        <dt className="font-bold">大会名</dt>
        <dd>{tournament.name}</dd>
        <dt className="font-bold">形式</dt>
        <dd>{tournament.format === 'singles' ? 'シングルス' : 'ダブルス'}</dd>
        <dt className="font-bold">開催日</dt>
        <dd>{formatDate(tournament.date)}</dd>
        <dt className="font-bold">参加者</dt>
        <dd>{tournament.participantIds.length} 人</dd>
        <dt className="font-bold">試合</dt>
        <dd>{tournament.matchIds.length} 試合</dd>
      </dl>

      <div className="border-t-2 border-line pt-4 space-y-3">
        <BigButton variant="danger" onClick={() => setConfirmReset(true)}>
          試合結果をリセット
        </BigButton>
        <p className="text-sm text-sub">
          参加者は残し、試合の記録だけを削除します。
        </p>
      </div>

      <div className="border-t-2 border-line pt-4 space-y-3">
        <BigButton variant="danger" onClick={() => setConfirmDelete(true)}>
          この大会を削除
        </BigButton>
        <p className="text-sm text-sub">
          大会・参加者・試合をすべて削除します。
        </p>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="試合結果をリセット"
        message="この大会の試合記録をすべて削除します。参加者は残ります。"
        confirmLabel="リセットする"
        cancelLabel="やめる"
        destructive
        onConfirm={() => {
          resetTournament(tournamentId);
          setConfirmReset(false);
        }}
        onCancel={() => setConfirmReset(false)}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="大会を削除"
        message="大会・参加者・試合をすべて削除します。取り消せません。"
        confirmLabel="削除する"
        cancelLabel="やめる"
        destructive
        onConfirm={() => {
          deleteTournament(tournamentId);
          setConfirmDelete(false);
          navigate('/');
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};
