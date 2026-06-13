import { useState } from "react";
import { useParams } from "react-router-dom";
import { BigButton } from "@/components/ui/BigButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useParticipants } from "@/features/tournament/participants/hooks";

export const ParticipantsTab = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  if (!tournamentId) return null;
  return <ParticipantsView tournamentId={tournamentId} />;
};

const ParticipantsView = ({ tournamentId }: { tournamentId: string }) => {
  const { list, add, rename, remove } = useParticipants(tournamentId);

  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  const submit = () => {
    if (!name.trim()) return;
    add(name);
    setName("");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold">参加者</h2>

      <div className="flex gap-2 flex-wrap">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="名前"
          aria-label="参加者名"
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
          className="flex-1 min-w-[200px] min-h-input border-2 border-line rounded-xl px-3 text-lg"
        />
        <BigButton onClick={submit} disabled={!name.trim()}>
          追加
        </BigButton>
      </div>

      {list.length === 0 ? (
        <p className="text-sub text-base py-6">まだ参加者がいません。</p>
      ) : (
        <ul className="divide-y-2 divide-line border-2 border-line rounded-2xl overflow-hidden">
          {list.map((p, i) => (
            <li key={p.id} className="p-3 flex items-center gap-3 flex-wrap">
              <span className="text-lg font-bold w-8 text-center text-sub">{i + 1}</span>
              {editingId === p.id ? (
                <>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    aria-label="参加者名を編集"
                    className="flex-1 min-w-[160px] min-h-input border-2 border-line rounded-xl px-3 text-lg"
                  />
                  <BigButton
                    variant="primary"
                    onClick={() => {
                      if (editName.trim()) rename(p.id, editName);
                      setEditingId(null);
                    }}
                  >
                    保存
                  </BigButton>
                  <BigButton variant="secondary" onClick={() => setEditingId(null)}>
                    やめる
                  </BigButton>
                </>
              ) : (
                <>
                  <span className="flex-1 text-lg font-bold">{p.name}</span>
                  <BigButton
                    variant="secondary"
                    onClick={() => {
                      setEditingId(p.id);
                      setEditName(p.name);
                    }}
                  >
                    編集
                  </BigButton>
                  <BigButton variant="danger" onClick={() => setRemoveTarget(p.id)}>
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
