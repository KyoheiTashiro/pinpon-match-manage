import { ChevronDownIcon, GearIcon } from "@/components/icons";
import { Button } from "@/components/ui";
import { tournamentPath } from "@/constants/routes";
import { CreateTournament } from "@/features/home/components/CreateTournament";
import { InstallAppButton } from "@/features/home/components/InstallAppButton";
import { SettingsModal } from "@/features/home/components/SettingsModal";
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
    settingsOpen,
    openSettings,
    closeSettings,
  } = useHome((id) => {
    void navigate(tournamentPath(id));
  });

  return (
    <div className="text-ink min-h-screen bg-white">
      <header className="bg-primary flex flex-wrap items-center justify-between gap-3 p-4 text-white">
        <h1 className="text-2xl font-extrabold">卓ログ</h1>
        <button
          type="button"
          aria-label="設定"
          onClick={openSettings}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-2xl transition-colors hover:bg-white/10"
        >
          <GearIcon />
        </button>
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
            <p className="text-sub py-8 text-center text-base">
              まだ大会がありません。上のボタンから作成してください。
            </p>
          ) : (
            <ul className="divide-line border-line divide-y-2 overflow-hidden rounded-2xl border-2">
              {list.map((tournament) => (
                <li key={tournament.id}>
                  <button
                    onClick={() => {
                      void navigate(tournamentPath(tournament.id));
                    }}
                    className="hover:bg-bg flex min-h-[72px] w-full items-center justify-between gap-3 p-4 text-left"
                  >
                    <div>
                      <div className="text-xl font-extrabold">{tournament.name}</div>
                      <div className="text-sub text-base">{formatDate(tournament.date)}</div>
                    </div>
                    <ChevronDownIcon className="-rotate-90 text-2xl" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="border-line flex flex-col items-start gap-3 border-t-2 pt-6 sm:flex-row">
          <InstallAppButton />
        </div>
      </main>

      <SettingsModal
        open={settingsOpen}
        onClose={closeSettings}
        confirmReset={confirmReset}
        askReset={askReset}
        doReset={doReset}
        cancelReset={cancelReset}
      />
    </div>
  );
};
