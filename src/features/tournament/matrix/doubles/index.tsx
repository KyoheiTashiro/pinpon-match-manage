import { matchSummary, winsNeededForBestOf, SIDE } from "@/domain/match";
import { DoublesMatchForm } from "@/features/tournament/matrix/doubles/DoublesMatchForm";
import { sideName } from "@/features/tournament/matrix/hooks";
import { MatchModal } from "@/features/tournament/matrix/shared/MatchModal";
import { SaveImageButton } from "@/features/tournament/matrix/shared/SaveImageButton";
import { useImageCapture } from "@/utils/imageCapture/useImageCapture";

import { useDoublesMatrix, MIN_PLAYERS_DOUBLES } from "./hooks";

export const DoublesMatrix = ({ tournamentId }: { tournamentId: string }) => {
  const { tournament, participants, matchList, players, openMatchId, openMatch, closeMatch } =
    useDoublesMatrix(tournamentId);
  const { ref, saving, save } = useImageCapture();

  if (!tournament) return null;

  const wins = winsNeededForBestOf(tournament.bestOf);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold">対戦表（ダブルス）</h2>

      {players.length < MIN_PLAYERS_DOUBLES ? (
        <p className="text-sub">参加者を4人以上 登録してください。</p>
      ) : (
        <DoublesMatchForm tournamentId={tournamentId} players={players} onAdded={openMatch} />
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
              const leftName = sideName(match.leftSide, participants);
              const rightName = sideName(match.rightSide, participants);
              return (
                <li key={match.id} className={inProgress ? "bg-warning/10" : ""}>
                  <button
                    onClick={() => openMatch(match.id)}
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
        <SaveImageButton
          saving={saving}
          onSave={() => {
            void save();
          }}
        />
      )}

      {openMatchId && (
        <MatchModal matchId={openMatchId} participants={participants} onClose={closeMatch} />
      )}
    </div>
  );
};
