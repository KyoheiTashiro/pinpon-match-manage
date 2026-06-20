import { Button, Calendar, ConfirmModal } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { useSettings } from "@/features/tournament/settings/hooks";
import { matchesOf } from "@/store/selectors";
import { FORMAT } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";
import { formatDate } from "@/utils/time";
import { Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

export const SettingsTab = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  if (!tournamentId) return null;
  return <SettingsView tournamentId={tournamentId} />;
};

const SettingsView = ({ tournamentId }: { tournamentId: string }) => {
  const navigate = useNavigate();
  const {
    tournament,
    form,
    editing,
    startEdit,
    cancelEdit,
    saveEdit,
    confirmReset,
    askReset,
    doReset,
    cancelReset,
    confirmDelete,
    askDelete,
    doDelete,
    cancelDelete,
  } = useSettings(tournamentId, () => {
    void navigate(ROUTES.HOME);
  });
  const matches = useAppStore((s) => s.matches);

  if (!tournament) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold">設定</h2>
        {!editing && (
          <Button variant="secondary" onClick={startEdit}>
            編集
          </Button>
        )}
      </div>

      {editing ? (
        <form
          onSubmit={(e) => {
            void saveEdit(e);
          }}
          className="space-y-3"
        >
          <label className="flex flex-col gap-1">
            <span className="font-bold">大会名</span>
            <input
              type="text"
              {...form.register("name")}
              aria-label="大会名"
              className="min-h-input border-line rounded-xl border-2 px-3 text-lg"
            />
            {form.formState.errors.name && (
              <span className="text-danger text-sm">{form.formState.errors.name.message}</span>
            )}
          </label>
          <div className="flex flex-col gap-1">
            <span className="font-bold">開催日</span>
            <Controller
              name="date"
              control={form.control}
              render={({ field }) => (
                <Calendar value={field.value} onChange={field.onChange} ariaLabel="開催日" />
              )}
            />
            {form.formState.errors.date && (
              <span className="text-danger text-sm">{form.formState.errors.date.message}</span>
            )}
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="secondary" onClick={cancelEdit}>
              キャンセル
            </Button>
            <Button type="submit" variant="primary" disabled={!form.formState.isValid}>
              保存
            </Button>
          </div>
        </form>
      ) : (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-base">
          <dt className="font-bold">大会名</dt>
          <dd>{tournament.name}</dd>
          <dt className="font-bold">形式</dt>
          <dd>{tournament.format === FORMAT.SINGLES ? "シングルス" : "ダブルス"}</dd>
          <dt className="font-bold">開催日</dt>
          <dd>{formatDate(tournament.date)}</dd>
          <dt className="font-bold">参加者</dt>
          <dd>{tournament.participantIds.length} 人</dd>
          <dt className="font-bold">試合</dt>
          <dd>{matchesOf(matches, tournament.id).length} 試合</dd>
        </dl>
      )}

      <div className="border-line space-y-3 border-t-2 pt-4">
        <Button variant="danger" onClick={askReset}>
          試合結果を削除
        </Button>
        <p className="text-sub text-sm">大会・参加者は残し、試合の記録だけを削除します。</p>
      </div>

      <div className="border-line space-y-3 border-t-2 pt-4">
        <Button variant="danger" onClick={askDelete}>
          大会を削除
        </Button>
        <p className="text-sub text-sm">大会・参加者・試合を全て削除します。</p>
      </div>

      <ConfirmModal
        open={confirmReset}
        title="試合結果を削除"
        message="この大会の試合記録を全て削除します。参加者は残ります。"
        confirmLabel="削除する"
        cancelLabel="やめる"
        destructive
        onConfirm={doReset}
        onCancel={cancelReset}
      />

      <ConfirmModal
        open={confirmDelete}
        title="大会を削除"
        message="大会・参加者・試合を全て削除します。取り消せません。"
        confirmLabel="削除する"
        cancelLabel="やめる"
        destructive
        onConfirm={doDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};
