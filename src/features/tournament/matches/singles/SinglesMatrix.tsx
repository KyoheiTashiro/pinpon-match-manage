import { MatchesHeader } from "@/features/tournament/matches/components/MatchesHeader";
import { MatchMatrix } from "@/features/tournament/matches/components/MatchMatrix";
import { MatchModal } from "@/features/tournament/matches/components/MatchModal";
import { useSinglesMatrix } from "@/features/tournament/matches/singles/hooks";

export const SinglesMatrix = ({ tournamentId }: { tournamentId: string }) => {
  const { tournament, participants, players, results, openOrCreate, openMatchId, closeMatch } =
    useSinglesMatrix(tournamentId);
  if (!tournament) return null;
  return (
    <div className="space-y-4">
      <div className="space-y-2 bg-white p-3">
        <MatchesHeader tournament={tournament} />
        <MatchMatrix players={players} results={results} onSelectCell={openOrCreate} />
      </div>
      {openMatchId && (
        <MatchModal matchId={openMatchId} participants={participants} onClose={closeMatch} />
      )}
    </div>
  );
};
