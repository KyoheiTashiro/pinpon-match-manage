import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "react-router-dom";
import { BigButton } from "@/components/ui/BigButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useParticipants } from "@/features/tournament/participants/hooks";
import { Schema, type FormType, defaultValues } from "@/features/tournament/participants/schema";

export const ParticipantsTab = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  if (!tournamentId) return null;
  return <ParticipantsView tournamentId={tournamentId} />;
};

const ParticipantsView = ({ tournamentId }: { tournamentId: string }) => {
  const { list, add, rename, remove } = useParticipants(tournamentId);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  const addForm = useForm<FormType>({
    resolver: zodResolver(Schema),
    mode: "onChange",
    defaultValues,
  });

  const editForm = useForm<FormType>({
    resolver: zodResolver(Schema),
    mode: "onChange",
    defaultValues,
  });

  const addSubmit = addForm.handleSubmit((data) => {
    add(data.name);
    addForm.reset();
  });

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    editForm.reset({ name: currentName });
    void editForm.trigger();
  };

  const submitEdit = editForm.handleSubmit((data) => {
    if (editingId) rename(editingId, data.name);
    setEditingId(null);
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold">参加者{list.length > 0 && `（${list.length}人）`}</h2>

      <form onSubmit={addSubmit} className="flex gap-2 flex-wrap">
        <input
          {...addForm.register("name")}
          placeholder="名前"
          aria-label="参加者名"
          className="flex-1 min-w-[200px] min-h-input border-2 border-line rounded-xl px-3 text-lg"
        />
        <BigButton type="submit" disabled={!addForm.formState.isValid}>
          追加
        </BigButton>
        {addForm.formState.errors.name && (
          <span className="basis-full text-sm text-danger">
            {addForm.formState.errors.name.message}
          </span>
        )}
      </form>

      {list.length === 0 ? (
        <p className="text-sub text-base py-6">まだ参加者がいません。</p>
      ) : (
        <ul className="divide-y-2 divide-line border-2 border-line rounded-2xl overflow-hidden">
          {list.map((participant) => (
            <li key={participant.id} className="p-3 flex items-center gap-2">
              {editingId === participant.id ? (
                <form
                  onSubmit={submitEdit}
                  className="flex-1 min-w-0 flex flex-wrap items-center gap-2"
                >
                  <input
                    {...editForm.register("name")}
                    aria-label="参加者名を編集"
                    className="basis-full sm:basis-0 sm:flex-1 min-w-0 min-h-input border-2 border-line rounded-xl px-3 text-lg"
                  />
                  <BigButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!editForm.formState.isValid}
                  >
                    保存
                  </BigButton>
                  <BigButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditingId(null)}
                  >
                    やめる
                  </BigButton>
                  {editForm.formState.errors.name && (
                    <span className="basis-full text-sm text-danger">
                      {editForm.formState.errors.name.message}
                    </span>
                  )}
                </form>
              ) : (
                <>
                  <span className="flex-1 min-w-0 text-lg font-bold truncate">
                    {participant.name}
                  </span>
                  <BigButton
                    variant="secondary"
                    size="sm"
                    onClick={() => startEdit(participant.id, participant.name)}
                  >
                    編集
                  </BigButton>
                  <BigButton
                    variant="danger"
                    size="sm"
                    onClick={() => setRemoveTarget(participant.id)}
                  >
                    削除
                  </BigButton>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!removeTarget}
        title="参加者を削除"
        message="この参加者と関連する試合を削除します。よろしいですか?"
        confirmLabel="削除する"
        cancelLabel="やめる"
        destructive
        onConfirm={() => {
          if (removeTarget) remove(removeTarget);
          setRemoveTarget(null);
        }}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
};
