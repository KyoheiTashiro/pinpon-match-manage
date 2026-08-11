import { SegmentedControl } from "@/components/ui";
import { MIN_PLAYERS } from "@/features/tournament/matches/constants";
import { DoublesList } from "@/features/tournament/matches/doubles";
import {
  useMatches,
  useMatchesView,
  useTournamentFormat,
} from "@/features/tournament/matches/hooks";
import { SinglesList, SinglesMatrix } from "@/features/tournament/matches/singles";
import { FORMAT, MATCHES_VIEW } from "@/store/types";
import { useParams } from "react-router-dom";

export const MatchesTab = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  if (!tournamentId) return null;
  return <MatchesView tournamentId={tournamentId} />;
};

const MatchesView = ({ tournamentId }: { tournamentId: string }) => {
  const format = useTournamentFormat(tournamentId);
  const { players } = useMatches(tournamentId);
  const { view, setView } = useMatchesView();
  if (!format) return null;

  // 参加者不足の案内は形式・表示形式によらず1箇所から出す
  const minPlayers = MIN_PLAYERS[format];
  const shortage =
    players.length < minPlayers ? (
      <p className="text-sub">参加者を{minPlayers}人以上 登録してください。</p>
    ) : null;

  if (format === FORMAT.DOUBLES) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold">対戦表（ダブルス）</h2>
        {shortage ?? <DoublesList tournamentId={tournamentId} />}
      </div>
    );
  }

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
      {shortage ??
        (view === MATCHES_VIEW.LIST ? (
          <SinglesList tournamentId={tournamentId} />
        ) : (
          <SinglesMatrix tournamentId={tournamentId} />
        ))}
    </div>
  );
};
