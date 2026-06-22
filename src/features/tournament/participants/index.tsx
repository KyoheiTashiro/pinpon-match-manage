import { Button, ConfirmModal } from "@/components/ui";
import { useParticipants } from "@/features/tournament/participants/hooks";
import { PastParticipantModal } from "@/features/tournament/participants/PastParticipantModal";
import { useParams } from "react-router-dom";

export const ParticipantsTab = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  if (!tournamentId) return null;
  return <ParticipantsView tournamentId={tournamentId} />;
};

const ParticipantsView = ({ tournamentId }: { tournamentId: string }) => {
  const {
    list,
    addForm,
    addSubmit,
    editingId,
    startEdit,
    cancelEdit,
    editForm,
    submitEdit,
    removeTarget,
    askRemove,
    doRemove,
    cancelRemove,
    pastCandidates,
    pastPickerOpen,
    pastSelected,
    openPastPicker,
    closePastPicker,
    togglePast,
    confirmAddPast,
  } = useParticipants(tournamentId);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold">参加者{list.length > 0 && `（${list.length}人）`}</h2>

      <form
        onSubmit={(event) => {
          void addSubmit(event);
        }}
        className="flex flex-wrap gap-2"
      >
        <input
          {...addForm.register("name")}
          placeholder="名前"
          aria-label="参加者名"
          className="min-h-input border-line min-w-[280px] flex-1 rounded-xl border-2 px-3 text-lg"
        />
        {addForm.formState.errors.name && (
          <span className="text-danger basis-full text-sm">
            {addForm.formState.errors.name.message}
          </span>
        )}
        <Button type="submit" disabled={!addForm.formState.isValid}>
          追加
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={openPastPicker}
          disabled={pastCandidates.length === 0}
        >
          履歴
        </Button>
      </form>

      {list.length === 0 ? (
        <p className="text-sub py-6 text-base">まだ参加者がいません。</p>
      ) : (
        <ul className="divide-line border-line divide-y-2 overflow-hidden rounded-2xl border-2">
          {list.map((participant) => (
            <li key={participant.id} className="flex items-center gap-2 p-3">
              {editingId === participant.id ? (
                <form
                  onSubmit={(event) => {
                    void submitEdit(event);
                  }}
                  className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
                >
                  <input
                    {...editForm.register("name")}
                    aria-label="参加者名を編集"
                    className="min-h-input border-line min-w-0 basis-full rounded-xl border-2 px-3 text-lg sm:flex-1 sm:basis-0"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!editForm.formState.isValid}
                  >
                    保存
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={cancelEdit}>
                    やめる
                  </Button>
                  {editForm.formState.errors.name && (
                    <span className="text-danger basis-full text-sm">
                      {editForm.formState.errors.name.message}
                    </span>
                  )}
                </form>
              ) : (
                <>
                  <span className="min-w-0 flex-1 truncate text-lg font-bold">
                    {participant.name}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => startEdit(participant.id, participant.name)}
                  >
                    編集
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => askRemove(participant.id)}>
                    削除
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        open={!!removeTarget}
        title="参加者を削除"
        message="この参加者と関連する試合を削除します。よろしいですか?"
        confirmLabel="削除する"
        cancelLabel="やめる"
        destructive
        onConfirm={doRemove}
        onCancel={cancelRemove}
      />

      <PastParticipantModal
        open={pastPickerOpen}
        candidates={pastCandidates}
        selected={pastSelected}
        onToggle={togglePast}
        onConfirm={confirmAddPast}
        onCancel={closePastPicker}
      />
    </div>
  );
};
