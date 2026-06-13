import { useState } from "react";
import { useParams } from "react-router-dom";
import { BigButton } from "@/components/ui/BigButton";
import { useImageCapture } from "@/lib/useImageCapture";
import { ScoreProgressChart } from "@/features/tournament/matrix/components/scoreboard/ScoreProgressChart";
import { useResultRows } from "@/features/tournament/ranking/hooks";
import type { MatchResultRow } from "@/features/tournament/ranking/hooks";

export const ResultTab = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  if (!tournamentId) return null;
  return <RankingView tournamentId={tournamentId} />;
};

type DisplayMode = "table" | "graph";

const RankingView = ({ tournamentId }: { tournamentId: string }) => {
  const { rows, matchResults, tournament } = useResultRows(tournamentId);
  const { ref, saving, save } = useImageCapture("結果", tournament?.name);
  const [mode, setMode] = useState<DisplayMode>("table");

  if (!tournament) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold">結果</h2>

      {rows.length === 0 ? (
        <p className="text-sub">参加者を登録してください。</p>
      ) : (
        <>
          {/* サブタブ（画像保存対象外） */}
          <div className="flex border-b-2 border-line" role="tablist" aria-label="表示モード">
            <button
              role="tab"
              aria-selected={mode === "table"}
              onClick={() => setMode("table")}
              className={`flex-1 min-h-btn text-lg font-bold border-b-4 transition-colors ${
                mode === "table"
                  ? "border-primary text-primary bg-primary/10"
                  : "border-transparent text-ink bg-white"
              }`}
            >
              点数表
            </button>
            <button
              role="tab"
              aria-selected={mode === "graph"}
              onClick={() => setMode("graph")}
              className={`flex-1 min-h-btn text-lg font-bold border-b-4 transition-colors ${
                mode === "graph"
                  ? "border-primary text-primary bg-primary/10"
                  : "border-transparent text-ink bg-white"
              }`}
            >
              グラフ
            </button>
          </div>

          {/* 画像保存対象コンテンツ */}
          <div className="overflow-x-auto">
            <div ref={ref} className="bg-white p-3 space-y-2 inline-block align-top min-w-full">
              {/* 大会名・日付ヘッダ（両モード共通） */}
              <div className="border-b-2 border-line pb-2">
                <div className="text-xl font-extrabold">{tournament.name}</div>
                <div className="text-sm text-sub">{tournament.date}</div>
              </div>

              {mode === "table" ? (
                <TableMode rows={rows} matchResults={matchResults} bestOf={tournament.bestOf} />
              ) : (
                <GraphMode matchResults={matchResults} />
              )}
            </div>
          </div>

          <BigButton onClick={save} disabled={saving}>
            {saving ? "保存中…" : "結果の画像を保存"}
          </BigButton>
        </>
      )}
    </div>
  );
};

// ----- 点数表モード -----
type TableModeProps = {
  rows: ReturnType<typeof useResultRows>["rows"];
  matchResults: MatchResultRow[];
  bestOf: number;
};

const TableMode = ({ rows, matchResults, bestOf }: TableModeProps) => (
  <>
    <div className="text-base font-extrabold">順位</div>
    <table className="w-full border-2 border-line border-collapse">
      <thead>
        <tr className="bg-bg">
          <th className="border-2 border-line p-2 text-base">順位</th>
          <th className="border-2 border-line p-2 text-base text-left">名前</th>
          <th className="border-2 border-line p-2 text-base">試合</th>
          <th className="border-2 border-line p-2 text-base">勝</th>
          <th className="border-2 border-line p-2 text-base">敗</th>
          <th className="border-2 border-line p-2 text-base">ゲーム差</th>
          <th className="border-2 border-line p-2 text-base">点差</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.participantId} className="text-center">
            <td className="border-2 border-line p-2 text-2xl font-extrabold">{row.rank}</td>
            <td className="border-2 border-line p-2 text-lg font-bold text-left">{row.name}</td>
            <td className="border-2 border-line p-2 text-lg">{row.played}</td>
            <td className="border-2 border-line p-2 text-lg text-success font-bold">{row.wins}</td>
            <td className="border-2 border-line p-2 text-lg text-danger font-bold">{row.losses}</td>
            <td className="border-2 border-line p-2 text-lg">
              {signed(row.gameDiff)}
              <span className="text-sub text-base">
                {" "}
                ({row.gamesWon}/{row.gamesLost})
              </span>
            </td>
            <td className="border-2 border-line p-2 text-lg">
              {signed(row.pointDiff)}
              <span className="text-sub text-base">
                {" "}
                ({row.pointsFor}/{row.pointsAgainst})
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {matchResults.length > 0 && (
      <div className="space-y-2 pt-2">
        <div className="text-base font-extrabold">対戦結果</div>
        <table className="w-full border-2 border-line border-collapse">
          <thead>
            <tr className="bg-bg">
              <th className="border-2 border-line p-2 text-base text-left">対戦</th>
              {Array.from({ length: bestOf }, (_, index) => (
                <th key={index} className="border-2 border-line p-2 text-base">
                  G{index + 1}
                </th>
              ))}
              <th className="border-2 border-line p-2 text-base">セット</th>
            </tr>
          </thead>
          <tbody>
            {matchResults.map((match) => (
              <tr key={match.id}>
                <td className="border-2 border-line p-2 text-base">
                  <span className={match.winner === "L" ? "font-extrabold" : "text-sub"}>
                    {match.leftName}
                  </span>
                  <span className="text-sub"> vs </span>
                  <span className={match.winner === "R" ? "font-extrabold" : "text-sub"}>
                    {match.rightName}
                  </span>
                </td>
                {Array.from({ length: bestOf }, (_, gameIndex) => {
                  const game = match.games[gameIndex];
                  if (!game) {
                    return (
                      <td
                        key={gameIndex}
                        className="border-2 border-line p-2 text-base text-center text-sub"
                      >
                        -
                      </td>
                    );
                  }
                  return (
                    <td
                      key={gameIndex}
                      className="border-2 border-line p-2 text-base text-center whitespace-nowrap"
                    >
                      <span className={game.leftScore > game.rightScore ? "font-extrabold" : ""}>
                        {game.leftScore}
                      </span>
                      <span className="text-sub">-</span>
                      <span className={game.rightScore > game.leftScore ? "font-extrabold" : ""}>
                        {game.rightScore}
                      </span>
                    </td>
                  );
                })}
                <td className="border-2 border-line p-2 text-base text-center font-bold whitespace-nowrap">
                  {match.leftWins}-{match.rightWins}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </>
);

// ----- グラフモード -----
type GraphModeProps = {
  matchResults: MatchResultRow[];
};

const GraphMode = ({ matchResults }: GraphModeProps) => {
  if (matchResults.length === 0) {
    return <p className="text-sub">対戦結果がありません。</p>;
  }

  return (
    <div className="space-y-6">
      {matchResults.map((match) => {
        const hasLog = match.games.some((game) => game.pointLog && game.pointLog.length > 0);
        return (
          <div key={match.id} className="pt-2">
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
      })}
    </div>
  );
};

const signed = (value: number) => (value > 0 ? `+${value}` : `${value}`);
