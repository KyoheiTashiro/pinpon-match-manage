import { ScoreProgressChart } from "@/features/tournament/matrix/components/scoreboard/ScoreProgressChart";
import type { MatchResultRow } from "@/features/tournament/ranking/hooks";

// ----- 対戦選択セレクタ（画像対象外、graphモード専用） -----
type GraphMatchSelectorProps = {
  graphMatches: MatchResultRow[];
  selectedMatchId: string | null;
  onSelect: (id: string) => void;
};

export const GraphMatchSelector = ({
  graphMatches,
  selectedMatchId,
  onSelect,
}: GraphMatchSelectorProps) => {
  if (graphMatches.length === 0) return null;
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="graph-match-select" className="text-sm font-bold text-ink shrink-0">
        対戦を選択
      </label>
      <select
        id="graph-match-select"
        value={selectedMatchId ?? ""}
        onChange={(e) => onSelect(e.target.value)}
        className="flex-1 min-h-btn px-3 rounded-xl border-2 border-line text-ink bg-white text-base font-bold appearance-none"
      >
        {graphMatches.map((match) => (
          <option key={match.id} value={match.id}>
            {match.leftName} vs {match.rightName}
          </option>
        ))}
      </select>
    </div>
  );
};

// ----- 1対戦グラフブロック（表示用・off-screen用の共通コンポーネント） -----
type MatchGraphBlockProps = {
  match: MatchResultRow;
};

export const MatchGraphBlock = ({ match }: MatchGraphBlockProps) => {
  const hasLog = match.games.some((game) => game.pointLog && game.pointLog.length > 0);
  return (
    <div className="pt-2">
      <div className="text-base mb-1">
        <span className={match.winner === "L" ? "font-extrabold" : "text-sub"}>
          {match.leftName}
        </span>
        <span className="text-sub"> vs </span>
        <span className={match.winner === "R" ? "font-extrabold" : "text-sub"}>
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
