import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { BigButton } from "@/components/ui/BigButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDate } from "@/lib/time";

export const SettingsTab = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();
  const tournament = useAppStore((state) =>
    tournamentId ? state.tournaments[tournamentId] : undefined,
  );
  const updateTournament = useAppStore((state) => state.updateTournament);
  const resetTournament = useAppStore((state) => state.resetTournament);
  const deleteTournament = useAppStore((state) => state.deleteTournament);

  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [dateDraft, setDateDraft] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!tournament || !tournamentId) return null;

  const startEdit = () => {
    setNameDraft(tournament.name);
    setDateDraft(tournament.date);
    setEditing(true);
  };

  const saveEdit = () => {
    updateTournament(tournamentId, { name: nameDraft.trim(), date: dateDraft });
    setEditing(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold">設定</h2>
        {!editing && (
          <BigButton variant="primary" onClick={startEdit}>
            編集
          </BigButton>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <label className="flex flex-col gap-1">
            <span className="font-bold">大会名</span>
            <input
              type="text"
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              aria-label="大会名"
              className="min-h-input border-2 border-line rounded-xl px-3 text-lg"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-bold">開催日</span>
            <input
              type="date"
              value={dateDraft}
              onChange={(event) => setDateDraft(event.target.value)}
              aria-label="開催日"
              className="min-h-input border-2 border-line rounded-xl px-3 text-lg"
            />
          </label>
          <div className="flex gap-3 justify-end flex-wrap">
            <BigButton variant="secondary" onClick={() => setEditing(false)}>
              キャンセル
            </BigButton>
            <BigButton variant="primary" onClick={saveEdit} disabled={!nameDraft.trim()}>
              保存
            </BigButton>
          </div>
        </div>
      ) : (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-base">
          <dt className="font-bold">大会名</dt>
          <dd>{tournament.name}</dd>
          <dt className="font-bold">形式</dt>
          <dd>{tournament.format === "singles" ? "シングルス" : "ダブルス"}</dd>
          <dt className="font-bold">開催日</dt>
          <dd>{formatDate(tournament.date)}</dd>
          <dt className="font-bold">参加者</dt>
          <dd>{tournament.participantIds.length} 人</dd>
          <dt className="font-bold">試合</dt>
          <dd>{tournament.matchIds.length} 試合</dd>
        </dl>
      )}

      <div className="border-t-2 border-line pt-4 space-y-3">
        <BigButton variant="danger" onClick={() => setConfirmReset(true)}>
          試合結果を削除
        </BigButton>
        <p className="text-sm text-sub">大会・参加者は残し、試合の記録だけを削除します。</p>
      </div>

      <div className="border-t-2 border-line pt-4 space-y-3">
        <BigButton variant="danger" onClick={() => setConfirmDelete(true)}>
          この大会を削除
        </BigButton>
        <p className="text-sm text-sub">大会・参加者・試合をすべて削除します。</p>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="試合結果を削除"
        message="この大会の試合記録をすべて削除します。参加者は残ります。"
        confirmLabel="削除する"
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
          navigate("/");
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};
