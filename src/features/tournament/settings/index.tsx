import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppStore } from "@/store/useAppStore";
import { CalendarIcon } from "@/components/icons";
import { BigButton } from "@/components/ui/BigButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDate } from "@/lib/time";
import { Schema, type FormType, defaultValues } from "@/features/tournament/settings/schema";

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
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const form = useForm<FormType>({
    resolver: zodResolver(Schema),
    mode: "onChange",
    defaultValues,
  });

  if (!tournament || !tournamentId) return null;

  const startEdit = () => {
    form.reset({ name: tournament.name, date: tournament.date });
    void form.trigger(); // プリフィル値で isValid を即時確定（保存ボタンの初期 disabled 回避）
    setEditing(true);
  };

  const saveEdit = form.handleSubmit((data) => {
    updateTournament(tournamentId, { name: data.name, date: data.date });
    setEditing(false);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold">設定</h2>
        {!editing && (
          <BigButton variant="secondary" onClick={startEdit}>
            編集
          </BigButton>
        )}
      </div>

      {editing ? (
        <form onSubmit={saveEdit} className="space-y-3">
          <label className="flex flex-col gap-1">
            <span className="font-bold">大会名</span>
            <input
              type="text"
              {...form.register("name")}
              aria-label="大会名"
              className="min-h-input border-2 border-line rounded-xl px-3 text-lg"
            />
            {form.formState.errors.name && (
              <span className="text-sm text-danger">{form.formState.errors.name.message}</span>
            )}
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-bold">開催日</span>
            <div className="relative">
              <input
                type="date"
                {...form.register("date")}
                aria-label="開催日"
                onClick={(e) => e.currentTarget.showPicker?.()}
                className="w-full min-h-input appearance-none bg-white border-2 border-line rounded-xl pl-3 pr-12 text-lg [&::-webkit-calendar-picker-indicator]:opacity-0"
              />
              <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-2xl text-line" />
            </div>
            {form.formState.errors.date && (
              <span className="text-sm text-danger">{form.formState.errors.date.message}</span>
            )}
          </label>
          <div className="flex gap-3 justify-end flex-wrap">
            <BigButton type="button" variant="secondary" onClick={() => setEditing(false)}>
              キャンセル
            </BigButton>
            <BigButton type="submit" variant="primary" disabled={!form.formState.isValid}>
              保存
            </BigButton>
          </div>
        </form>
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
          大会を削除
        </BigButton>
        <p className="text-sm text-sub">大会・参加者・試合を全て削除します。</p>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="試合結果を削除"
        message="この大会の試合記録を全て削除します。参加者は残ります。"
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
        message="大会・参加者・試合を全て削除します。取り消せません。"
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
