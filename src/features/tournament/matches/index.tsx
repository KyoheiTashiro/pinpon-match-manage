import { DoublesList } from "@/features/tournament/matches/doubles";
import { useTournamentFormat } from "@/features/tournament/matches/hooks";
import { SinglesList } from "@/features/tournament/matches/singles";
import { FORMAT } from "@/store/types";
import { useParams } from "react-router-dom";

export const MatchesTab = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  if (!tournamentId) return null;
  return <MatchesView tournamentId={tournamentId} />;
};

const MatchesView = ({ tournamentId }: { tournamentId: string }) => {
  const format = useTournamentFormat(tournamentId);
  if (!format) return null;
  return format === FORMAT.SINGLES ? (
    <SinglesList tournamentId={tournamentId} />
  ) : (
    <DoublesList tournamentId={tournamentId} />
  );
};
