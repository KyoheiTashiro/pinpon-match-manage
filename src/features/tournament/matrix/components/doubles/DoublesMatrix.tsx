import { DownloadIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { matchSummary, winsNeededForBestOf, SIDE } from "@/domain/match";
import { DoublesMatchForm } from "@/features/tournament/matrix/components/doubles/DoublesMatchForm";
import { MatchModal } from "@/features/tournament/matrix/components/MatchModal";
import { sideMembers, useMatrix, MIN_PLAYERS_DOUBLES } from "@/features/tournament/matrix/hooks";
import { useImageCapture } from "@/utils/useImageCapture";
import { useState } from "react";

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

      <div ref={ref} className="space-y-2 bg-white p-3">
        <div className="border-b-2 border-line pb-2">
          <div className="text-xl font-extrabold">{tournament.name}</div>
          <div className="text-sm text-sub">{tournament.date}</div>
        </div>
        <ul className="divide-y-2 divide-line overflow-hidden rounded-2xl border-2 border-line">
          {matchList.length === 0 ? (
            <li className="p-4 text-base text-sub">まだ試合がありません。</li>
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
                    className="flex min-h-[64px] w-full items-center justify-between gap-3 p-3 text-left hover:bg-bg"
                  >
                    <span className="flex-1 text-lg font-bold">
                      {leftName} <span className="text-sub">対</span> {rightName}
                    </span>
                    <span className="flex flex-col items-end text-xl font-extrabold">
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
          <Button
            onClick={() => {
              void save();
            }}
            disabled={saving}
          >
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
