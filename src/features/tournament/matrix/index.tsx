import { DoublesMatrix } from "@/features/tournament/matrix/doubles";
import { useTournamentFormat } from "@/features/tournament/matrix/hooks";
import { SinglesMatrix } from "@/features/tournament/matrix/singles";
import { FORMAT } from "@/store/types";
import { useParams } from "react-router-dom";

export const MatchMatrixTab = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  if (!tournamentId) return null;
  return <MatchMatrixView tournamentId={tournamentId} />;
};

const MatchMatrixView = ({ tournamentId }: { tournamentId: string }) => {
  const format = useTournamentFormat(tournamentId);
  if (!format) return null;
  return format === FORMAT.SINGLES ? (
    <SinglesMatrix tournamentId={tournamentId} />
  ) : (
    <DoublesMatrix tournamentId={tournamentId} />
  );
};
