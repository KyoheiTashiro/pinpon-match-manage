import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { DownloadIcon } from "@/components/icons";
import { useImageCapture } from "@/lib/useImageCapture";
import { matchSummary, winsNeededForBestOf, SIDE } from "@/domain/match";
import { MatchModal } from "@/features/tournament/matrix/components/MatchModal";
import { DoublesMatchForm } from "@/features/tournament/matrix/components/doubles/DoublesMatchForm";
import { sideMembers, useMatrix, MIN_PLAYERS_DOUBLES } from "@/features/tournament/matrix/hooks";

export const DoublesMatrix = ({ tournamentId }: { tournamentId: string }) => {
  const { tournament, participants, matchList, players } = useMatrix(tournamentId);
  const { ref, saving, save } = useImageCapture("対戦表", tournament?.name);
  const [openMatchId, setOpenMatchId] = useState<string | null>(null);

  if (!tournament) return null;

  const wins = winsNeededForBestOf(tournament.bestOf);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold">対戦表（ダブルス）</h2>

      {players.length < MIN_PLAYERS_DOUBLES ? (
        <p className="text-sub">参加者を4人以上 登録してください。</p>
      ) : (
        <DoublesMatchForm tournamentId={tournamentId} players={players} onAdded={setOpenMatchId} />
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
                          {summary.winner === SIDE.LEFT ? leftName : rightName} の勝ち
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

      {players.length >= MIN_PLAYERS_DOUBLES && matchList.length > 0 && (
        <div className="space-y-2">
          <div className="text-base font-extrabold">画像で保存</div>
          <Button onClick={save} disabled={saving}>
            <span className="inline-flex items-center justify-center gap-2">
              <DownloadIcon />
              {saving ? "保存中…" : "対戦表"}
            </span>
          </Button>
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
