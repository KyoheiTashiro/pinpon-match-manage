import { EmptyState } from "@/components/ui";
import { matchSummary, SIDE } from "@/domain/match";
import { sideName } from "@/domain/side";
import { MatchesCard } from "@/features/tournament/matches/components/MatchesCard";
import { MatchModal } from "@/features/tournament/matches/components/MatchModal";
import { useDoubles } from "@/features/tournament/matches/doubles/hooks";
import { PairSelectForm } from "@/features/tournament/matches/doubles/PairSelectForm";

export const DoublesList = ({ tournamentId }: { tournamentId: string }) => {
  const {
    tournament,
    participants,
    matchList,
    players,
    wins,
    openMatchId,
    openMatch,
    closeMatch,
    pairForm,
    submit,
  } = useDoubles(tournamentId);

  if (!tournament) return null;

  return (
    <div className="space-y-4">
      <PairSelectForm
        pairForm={pairForm}
        players={players}
        onSubmit={() => {
          void submit();
        }}
      />

      <MatchesCard tournament={tournament}>
        <ul className="divide-line border-line divide-y-2 overflow-hidden rounded-2xl border-2">
          {matchList.length === 0 ? (
            <EmptyState variant="listItem" message="まだ試合がありません。" />
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
                    className="hover:bg-bg flex min-h-[64px] w-full items-center justify-between gap-3 p-3 text-left"
                  >
                    <span className="flex-1 text-lg font-bold">
                      {leftName} <span className="text-sub">対</span> {rightName}
                    </span>
                    <span className="flex flex-col items-end text-xl font-extrabold">
                      <span>
                        {summary.leftWins}-{summary.rightWins}
                      </span>
                      {summary.finished ? (
                        <span className="text-success text-sm">
                          {summary.winner === SIDE.LEFT ? leftName : rightName} の勝ち
                        </span>
                      ) : (
                        <span className="text-warning text-sm">途中</span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </MatchesCard>

      {openMatchId && (
        <MatchModal matchId={openMatchId} participants={participants} onClose={closeMatch} />
      )}
    </div>
  );
};
