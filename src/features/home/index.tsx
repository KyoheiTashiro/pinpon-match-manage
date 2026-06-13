import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { BigButton } from "@/components/ui/BigButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FontSizeToggle } from "@/components/ui/FontSizeToggle";
import { InstallAppButton } from "@/components/ui/InstallAppButton";
import { RadioCardGroup } from "@/components/ui/RadioCardGroup";
import { formatDate } from "@/lib/time";
import { useHome } from "@/features/home/hooks";

export const Home = () => {
  const navigate = useNavigate();
  const resetAll = useAppStore((state) => state.resetAll);

  const { list, form } = useHome((id) => navigate(`/t/${id}/participants`));

  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="min-h-screen bg-white text-ink">
      <header className="bg-primary text-white p-4 flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-extrabold">卓ログ</h1>
        <FontSizeToggle />
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-6">
        {form.creating ? (
          <div className="border-4 border-primary rounded-2xl p-4 space-y-4">
            <h2 className="text-xl font-extrabold">新しい大会</h2>
            <label className="flex flex-col gap-1">
              <span className="font-bold">大会名</span>
              <input
                value={form.name}
                onChange={(event) => form.setName(event.target.value)}
                placeholder="例: 春の大会"
                aria-label="大会名"
                className="min-h-input border-2 border-line rounded-xl px-3 text-lg"
              />
            </label>
            <RadioCardGroup
              legend="形式"
              name="format"
              value={form.format}
              options={[
                { value: "singles", label: "シングルス" },
                { value: "doubles", label: "ダブルス" },
              ]}
              onChange={form.setFormat}
            />
            <RadioCardGroup
              legend="ゲーム数"
              name="bestOf"
              value={form.bestOf}
              options={[
                { value: 3, label: "3ゲーム制" },
                { value: 5, label: "5ゲーム制" },
                { value: 7, label: "7ゲーム制" },
              ]}
              onChange={form.setBestOf}
            />
            <label className="flex flex-col gap-1">
              <span className="font-bold">開催日</span>
              <input
                type="date"
                value={form.date}
                onChange={(event) => form.setDate(event.target.value)}
                aria-label="開催日"
                className="min-h-input border-2 border-line rounded-xl px-3 text-lg"
              />
            </label>
            <div className="flex gap-3 justify-end flex-wrap">
              <BigButton variant="secondary" onClick={() => form.setCreating(false)}>
                キャンセル
              </BigButton>
              <BigButton variant="primary" onClick={form.submit} disabled={!form.name.trim()}>
                つくる
              </BigButton>
            </div>
          </div>
        ) : (
          <BigButton
            variant="primary"
            className="w-full !min-h-[72px] text-xl"
            onClick={() => form.setCreating(true)}
          >
            ＋ あたらしい大会をつくる
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
                      <div className="text-base text-sub">
                        {formatDate(tournament.date)} ・{" "}
                        {tournament.format === "singles" ? "シングルス" : "ダブルス"} ・{" "}
                        {tournament.participantIds.length}人
                      </div>
                    </div>
                    <span className="text-2xl" aria-hidden>
                      ▶
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="pt-6 border-t-2 border-line space-y-3">
          <InstallAppButton />
        </div>

        <div className="pt-6 border-t-2 border-line">
          <BigButton variant="danger" onClick={() => setConfirmReset(true)}>
            すべてのデータを消す
          </BigButton>
        </div>
      </main>

      <ConfirmDialog
        open={confirmReset}
        title="全データ削除"
        message="すべての大会・参加者・対戦結果を削除します。取り消せません。本当に削除しますか?"
        confirmLabel="すべて消す"
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
