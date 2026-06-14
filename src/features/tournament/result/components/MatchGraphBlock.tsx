import { ScoreProgressChart } from "@/features/tournament/matrix/components/scoreboard/ScoreProgressChart";
import type { MatchResultRow } from "@/features/tournament/result/hooks";
import { SIDE } from "@/domain/match";

// ----- 1対戦グラフブロック（表示用・off-screen用の共通コンポーネント） -----
type Props = {
  match: MatchResultRow;
};

export const MatchGraphBlock = ({ match }: Props) => {
  const hasLog = match.games.some((game) => game.pointLog && game.pointLog.length > 0);
  return (
    <div className="pt-2">
      <div className="text-base mb-1">
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
