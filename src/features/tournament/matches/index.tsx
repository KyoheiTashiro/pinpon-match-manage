import { SegmentedControl } from "@/components/ui";
import { DoublesList } from "@/features/tournament/matches/doubles";
import {
  MATCHES_VIEW,
  useMatchesView,
  useTournamentFormat,
} from "@/features/tournament/matches/hooks";
import { SinglesList, SinglesMatrix } from "@/features/tournament/matches/singles";
import { FORMAT } from "@/store/types";
import { useParams } from "react-router-dom";

export const MatchesTab = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  if (!tournamentId) return null;
  return <MatchesView tournamentId={tournamentId} />;
};

const MatchesView = ({ tournamentId }: { tournamentId: string }) => {
  const format = useTournamentFormat(tournamentId);
  const { view, setView } = useMatchesView();
  if (!format) return null;
  if (format === FORMAT.DOUBLES) return <DoublesList tournamentId={tournamentId} />;
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold">対戦表</h2>
      <SegmentedControl
        ariaLabel="対戦表の表示形式"
        value={view}
        onChange={setView}
        options={[
          { value: MATCHES_VIEW.MATRIX, label: "マトリクス" },
          { value: MATCHES_VIEW.LIST, label: "リスト" },
        ]}
      />
      {view === MATCHES_VIEW.LIST ? (
        <SinglesList tournamentId={tournamentId} />
      ) : (
        <SinglesMatrix tournamentId={tournamentId} />
      )}
    </div>
  );
};
