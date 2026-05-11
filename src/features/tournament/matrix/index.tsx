import { useParams } from 'react-router-dom';
import { useAppStore } from '../../../store/useAppStore';
import { SinglesMatrix } from './SinglesMatrix';
import { DoublesMatrix } from './DoublesMatrix';

export const MatchMatrixTab = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const tournament = useAppStore((s) =>
    tournamentId ? s.tournaments[tournamentId] : undefined,
  );

  if (!tournament || !tournamentId) return null;

  return tournament.format === 'singles' ? (
    <SinglesMatrix tournamentId={tournamentId} />
  ) : (
    <DoublesMatrix tournamentId={tournamentId} />
  );
};
