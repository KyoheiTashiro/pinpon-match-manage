import { useParams } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { SinglesMatrix } from "@/features/tournament/matrix/SinglesMatrix";
import { DoublesMatrix } from "@/features/tournament/matrix/DoublesMatrix";

export const MatchMatrixTab = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const tournament = useAppStore((state) =>
    tournamentId ? state.tournaments[tournamentId] : undefined,
  );

  if (!tournament || !tournamentId) return null;

  return tournament.format === "singles" ? (
    <SinglesMatrix tournamentId={tournamentId} />
  ) : (
    <DoublesMatrix tournamentId={tournamentId} />
  );
};
