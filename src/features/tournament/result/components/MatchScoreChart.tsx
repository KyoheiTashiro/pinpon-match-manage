import { SIDE } from "@/domain/match";
import { ScoreProgressChart } from "@/features/tournament/result/components/ScoreProgressChart";
import type { MatchResultRow } from "@/features/tournament/result/hooks";

// ----- 1対戦グラフブロック（表示用・off-screen用の共通コンポーネント） -----
type Props = {
  match: MatchResultRow;
};

export const MatchScoreChart = ({ match }: Props) => {
  const hasLog = match.games.some((game) => game.pointLog && game.pointLog.length > 0);
  return (
    <div className="pt-2">
      <div className="mb-1 text-base">
        <span className={`text-xl ${match.winner === SIDE.LEFT ? "font-extrabold" : "text-sub"}`}>
          {match.leftName}
        </span>
        <span className="text-sub"> vs </span>
        <span className={`text-xl ${match.winner === SIDE.RIGHT ? "font-extrabold" : "text-sub"}`}>
          {match.rightName}
        </span>
      </div>
      {hasLog ? (
        <ScoreProgressChart
          games={match.games}
          leftName={match.leftName}
          rightName={match.rightName}
          matchFirstServer={match.firstServer}
        />
      ) : (
        <p className="text-sub">得点記録なし</p>
      )}
    </div>
  );
};
