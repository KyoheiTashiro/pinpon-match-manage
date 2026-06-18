import { ChevronDownIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { tournamentPath } from "@/constants/routes";
import { CreateTournament } from "@/features/home/components/CreateTournament";
import { FontSizeToggle } from "@/features/home/components/FontSizeToggle";
import { InstallAppButton } from "@/features/home/components/InstallAppButton";
import { useHome } from "@/features/home/hooks";
import { formatDate } from "@/utils/time";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const navigate = useNavigate();

  const {
    list,
    creating,
    setCreating,
    closeForm,
    form,
    submit,
    confirmReset,
    askReset,
    doReset,
    cancelReset,
  } = useHome((id) => navigate(tournamentPath(id)));

  return (
    <div className="min-h-screen bg-white text-ink">
      <header className="flex flex-wrap items-center justify-between gap-3 bg-primary p-4 text-white">
        <h1 className="text-2xl font-extrabold">卓ログ</h1>
        <FontSizeToggle />
      </header>

      <main className="mx-auto max-w-3xl space-y-6 p-4">
        {creating ? (
          <CreateTournament
            form={form}
            submit={(e) => {
              void submit(e);
            }}
            onCancel={closeForm}
          />
        ) : (
          <Button variant="primary" onClick={() => setCreating(true)}>
            ＋ 新しい大会
          </Button>
        )}

        <section aria-label="大会一覧">
          {list.length === 0 ? (
            <p className="py-8 text-center text-base text-sub">
              まだ大会がありません。上のボタンから作成してください。
            </p>
          ) : (
            <ul className="divide-y-2 divide-line overflow-hidden rounded-2xl border-2 border-line">
              {list.map((tournament) => (
                <li key={tournament.id}>
                  <button
                    onClick={() => navigate(tournamentPath(tournament.id))}
                    className="flex min-h-[72px] w-full items-center justify-between gap-3 p-4 text-left hover:bg-bg"
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

        <div className="flex flex-col items-start gap-3 border-t-2 border-line pt-6 sm:flex-row">
          <InstallAppButton />
          <Button variant="danger" onClick={askReset}>
            データ初期化
          </Button>
        </div>
      </main>

      <ConfirmModal
        open={confirmReset}
        title="データ初期化"
        message="全ての大会・参加者・対戦結果を削除します。取り消せません。本当に削除しますか?"
        confirmLabel="全て消す"
        cancelLabel="やめる"
        destructive
        onConfirm={doReset}
        onCancel={cancelReset}
      />
    </div>
  );
};
