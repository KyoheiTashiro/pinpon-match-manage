import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { BigButton } from "@/components/ui/BigButton";
import { ChevronDownIcon } from "@/components/icons";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FontSizeToggle } from "@/components/ui/FontSizeToggle";
import { InstallAppButton } from "@/features/home/InstallAppButton";
import { formatDate } from "@/lib/time";
import { useHome } from "@/features/home/hooks";
import { CreateTournamentForm } from "@/features/home/CreateTournamentForm";

export const Home = () => {
  const navigate = useNavigate();
  const resetAll = useAppStore((state) => state.resetAll);

  const { list, creating, setCreating, closeForm, form, submit } = useHome((id) =>
    navigate(`/t/${id}/participants`),
  );

  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="min-h-screen bg-white text-ink">
      <header className="bg-primary text-white p-4 flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-extrabold">卓ログ</h1>
        <FontSizeToggle />
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-6">
        {creating ? (
          <CreateTournamentForm form={form} submit={submit} onCancel={closeForm} />
        ) : (
          <BigButton variant="primary" onClick={() => setCreating(true)}>
            ＋ 新しい大会を作る
          </BigButton>
        )}

        <section aria-label="大会一覧">
          {list.length === 0 ? (
            <p className="text-base text-sub text-center py-8">
              まだ大会がありません。上のボタンから作成してください。
            </p>
          ) : (
            <ul className="divide-y-2 divide-line border-2 border-line rounded-2xl overflow-hidden">
              {list.map((tournament) => (
                <li key={tournament.id}>
                  <button
                    onClick={() => navigate(`/t/${tournament.id}/participants`)}
                    className="w-full text-left p-4 min-h-[72px] hover:bg-bg flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xl font-extrabold">{tournament.name}</div>
                      <div className="text-base text-sub">{formatDate(tournament.date)}</div>
                    </div>
                    <ChevronDownIcon className="-rotate-90 text-2xl" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="pt-6 border-t-2 border-line flex flex-col items-start gap-3 sm:flex-row">
          <InstallAppButton />
          <BigButton variant="danger" onClick={() => setConfirmReset(true)}>
            全てのデータを消す
          </BigButton>
        </div>
      </main>

      <ConfirmDialog
        open={confirmReset}
        title="全データ削除"
        message="全ての大会・参加者・対戦結果を削除します。取り消せません。本当に削除しますか?"
        confirmLabel="全て消す"
        cancelLabel="やめる"
        destructive
        onConfirm={() => {
          resetAll();
          setConfirmReset(false);
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
};
