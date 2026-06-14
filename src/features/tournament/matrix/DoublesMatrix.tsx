import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { BigButton } from "@/components/ui/BigButton";
import { DownloadIcon } from "@/components/icons";
import { useImageCapture } from "@/lib/useImageCapture";
import { matchSummary, winsNeededForBestOf } from "@/domain/match";
import { MatchModal } from "@/features/tournament/matrix/components/MatchModal";
import { PairSelect } from "@/features/tournament/matrix/components/PairSelect";
import { sideMembers, useMatrix } from "@/features/tournament/matrix/hooks";

export const DoublesMatrix = ({ tournamentId }: { tournamentId: string }) => {
  const { tournament, participants, matchList, players, form, setForm, canAdd, reset } =
    useMatrix(tournamentId);
  const addManualMatch = useAppStore((state) => state.addManualMatch);
  const { ref, saving, save } = useImageCapture("対戦表", tournament?.name);
  const [openMatchId, setOpenMatchId] = useState<string | null>(null);

  if (!tournament) return null;

  const wins = winsNeededForBestOf(tournament.bestOf);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold">対戦表（ダブルス）</h2>

      {players.length < 4 ? (
        <p className="text-sub">参加者を4人以上 登録してください。</p>
      ) : (
        <div className="border-4 border-primary rounded-2xl p-4 space-y-3">
          <h3 className="text-lg font-extrabold">試合を追加</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <span className="font-bold">左ペア</span>
              <PairSelect
                value={form.l1}
                onChange={(value) => setForm((formState) => ({ ...formState, l1: value }))}
                options={players}
                exclude={[form.l2, form.r1, form.r2]}
                label="左1"
              />
              <PairSelect
                value={form.l2}
                onChange={(value) => setForm((formState) => ({ ...formState, l2: value }))}
                options={players}
                exclude={[form.l1, form.r1, form.r2]}
                label="左2"
              />
            </div>
            <div className="space-y-2">
              <span className="font-bold">右ペア</span>
              <PairSelect
                value={form.r1}
                onChange={(value) => setForm((formState) => ({ ...formState, r1: value }))}
                options={players}
                exclude={[form.l1, form.l2, form.r2]}
                label="右1"
              />
              <PairSelect
                value={form.r2}
                onChange={(value) => setForm((formState) => ({ ...formState, r2: value }))}
                options={players}
                exclude={[form.l1, form.l2, form.r1]}
                label="右2"
              />
            </div>
          </div>
          <BigButton
            disabled={!canAdd}
            onClick={() => {
              const id = addManualMatch(
                tournamentId,
                { kind: "pair", memberIds: [form.l1, form.l2] },
                { kind: "pair", memberIds: [form.r1, form.r2] },
              );
              reset();
              setOpenMatchId(id);
            }}
          >
            試合を追加して入力へ
          </BigButton>
        </div>
      )}

      <div ref={ref} className="bg-white p-3 space-y-2">
        <div className="border-b-2 border-line pb-2">
          <div className="text-xl font-extrabold">{tournament.name}</div>
          <div className="text-sm text-sub">{tournament.date}</div>
        </div>
        <ul className="divide-y-2 divide-line border-2 border-line rounded-2xl overflow-hidden">
          {matchList.length === 0 ? (
            <li className="p-4 text-sub text-base">まだ試合がありません。</li>
          ) : (
            matchList.map((match) => {
              const summary = matchSummary(match.games, wins);
              const inProgress = !summary.finished;
              const leftName = sideMembers(match.leftSide)
                .map((id) => participants[id]?.name ?? "?")
                .join(" / ");
              const rightName = sideMembers(match.rightSide)
                .map((id) => participants[id]?.name ?? "?")
                .join(" / ");
              return (
                <li key={match.id} className={inProgress ? "bg-warning/10" : ""}>
                  <button
                    onClick={() => setOpenMatchId(match.id)}
                    className="w-full text-left p-3 min-h-[64px] hover:bg-bg flex items-center justify-between gap-3"
                  >
                    <span className="text-lg font-bold flex-1">
                      {leftName} <span className="text-sub">対</span> {rightName}
                    </span>
                    <span className="text-xl font-extrabold flex flex-col items-end">
                      <span>
                        {summary.leftWins}-{summary.rightWins}
                      </span>
                      {summary.finished ? (
                        <span className="text-sm text-success">
                          {summary.winner === "L" ? leftName : rightName} の勝ち
                        </span>
                      ) : (
                        <span className="text-sm text-warning">途中</span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>

      {players.length >= 4 && matchList.length > 0 && (
        <div className="space-y-2">
          <div className="text-base font-extrabold">画像で保存</div>
          <BigButton onClick={save} disabled={saving}>
            <span className="inline-flex items-center justify-center gap-2">
              <DownloadIcon />
              {saving ? "保存中…" : "対戦表"}
            </span>
          </BigButton>
        </div>
      )}

      {openMatchId && (
        <MatchModal
          matchId={openMatchId}
          participants={participants}
          onClose={() => setOpenMatchId(null)}
        />
      )}
    </div>
  );
};
