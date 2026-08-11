import { MatchesCard } from "@/features/tournament/matches/components/MatchesCard";
import { MatchMatrix } from "@/features/tournament/matches/components/MatchMatrix";
import { MatchModal } from "@/features/tournament/matches/components/MatchModal";
import { useSinglesMatrix } from "@/features/tournament/matches/singles/hooks";

export const SinglesMatrix = ({ tournamentId }: { tournamentId: string }) => {
  const { tournament, participants, players, results, openOrCreate, openMatchId, closeMatch } =
    useSinglesMatrix(tournamentId);
  if (!tournament) return null;
  return (
    <div className="space-y-4">
      <MatchesCard tournament={tournament}>
        <MatchMatrix players={players} results={results} onSelectCell={openOrCreate} />
      </MatchesCard>
      {openMatchId && (
        <MatchModal matchId={openMatchId} participants={participants} onClose={closeMatch} />
      )}
    </div>
  );
};
