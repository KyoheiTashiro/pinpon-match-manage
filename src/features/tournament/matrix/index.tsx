import { useParams } from "react-router-dom";
import { SinglesMatrix } from "@/features/tournament/matrix/components/singles/SinglesMatrix";
import { DoublesMatrix } from "@/features/tournament/matrix/components/doubles/DoublesMatrix";
import { FORMAT } from "@/store/types";
import { useTournamentFormat } from "@/features/tournament/matrix/hooks";

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
