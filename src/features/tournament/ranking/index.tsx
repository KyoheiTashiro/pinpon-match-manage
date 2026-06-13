import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { BigButton } from "@/components/ui/BigButton";
import { useImageCapture } from "@/lib/useImageCapture";
import { useResultRows } from "@/features/tournament/ranking/hooks";
import { GraphMatchSelector, MatchGraphBlock } from "@/features/tournament/ranking/components";
import type { MatchResultRow } from "@/features/tournament/ranking/hooks";

export const ResultTab = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  if (!tournamentId) return null;
  return <RankingView tournamentId={tournamentId} />;
};

type DisplayMode = "table" | "graph";

const RankingView = ({ tournamentId }: { tournamentId: string }) => {
  const { rows, matchResults, tournament } = useResultRows(tournamentId);
  // 表示中コンテナ（table全体 or 選択中1対戦）用
  const main = useImageCapture("結果", tournament?.name);
  // off-screen 全対戦版用
  const allMatches = useImageCapture("結果", tournament?.name);
  const [mode, setMode] = useState<DisplayMode>("table");

  // ログのある対戦のみ選択肢に出す
  const graphMatches = useMemo(
    () =>
      matchResults.filter((match) =>
        match.games.some((game) => game.pointLog && game.pointLog.length > 0),
      ),
    [matchResults],
  );

  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  // 初期選択: graphMatches が変わったときに未選択 or 消えた id をリセット
  const resolvedSelectedId =
    selectedMatchId !== null && graphMatches.some((m) => m.id === selectedMatchId)
      ? selectedMatchId
      : (graphMatches[0]?.id ?? null);

  const selectedMatch = graphMatches.find((m) => m.id === resolvedSelectedId) ?? null;

  if (!tournament) return null;

  const isSaving = main.saving || allMatches.saving;

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

          {/* グラフモード時のみ表示するセレクタ（画像保存対象外） */}
          {mode === "graph" && (
            <GraphMatchSelector
              graphMatches={graphMatches}
              selectedMatchId={resolvedSelectedId}
              onSelect={(id) => setSelectedMatchId(id)}
            />
          )}

          {/* 画像保存対象コンテンツ */}
          <div className="overflow-x-auto">
            <div
              ref={main.ref}
              className="bg-white p-3 space-y-2 inline-block align-top min-w-full"
            >
              {/* 大会名・日付ヘッダ（両モード共通） */}
              <div className="border-b-2 border-line pb-2">
                <div className="text-xl font-extrabold">{tournament.name}</div>
                <div className="text-sm text-sub">{tournament.date}</div>
              </div>

              {mode === "table" ? (
                <TableMode rows={rows} matchResults={matchResults} bestOf={tournament.bestOf} />
              ) : graphMatches.length === 0 ? (
                <p className="text-sub">対戦結果がありません。</p>
              ) : selectedMatch ? (
                <MatchGraphBlock match={selectedMatch} />
              ) : null}
            </div>
          </div>

          {/* 保存ボタン（画像対象外） */}
          {mode === "table" ? (
            <BigButton onClick={() => main.save()} disabled={isSaving}>
              {main.saving ? "保存中…" : "結果の画像を保存"}
            </BigButton>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <BigButton
                onClick={() =>
                  selectedMatch &&
                  main.save(`${selectedMatch.leftName} vs ${selectedMatch.rightName}`)
                }
                disabled={isSaving || !selectedMatch}
              >
                {main.saving ? "保存中…" : "この対戦を保存"}
              </BigButton>
              <BigButton
                onClick={() => allMatches.save("全対戦")}
                disabled={isSaving || graphMatches.length === 0}
              >
                {allMatches.saving ? "保存中…" : "全対戦を保存"}
              </BigButton>
            </div>
          )}

          {/* off-screen 全対戦版（graphモード時のみ、画像取得用） */}
          {mode === "graph" && graphMatches.length > 0 && (
            <div
              aria-hidden
              className="absolute -left-[99999px] top-0 h-0 overflow-hidden pointer-events-none"
            >
              <div ref={allMatches.ref} className="bg-white p-3 space-y-2">
                {/* 大会名・日付ヘッダ */}
                <div className="border-b-2 border-line pb-2">
                  <div className="text-xl font-extrabold">{tournament.name}</div>
                  <div className="text-sm text-sub">{tournament.date}</div>
                </div>
                {/* 全対戦を縦積み */}
                <div className="space-y-6">
                  {graphMatches.map((match) => (
                    <MatchGraphBlock key={match.id} match={match} />
                  ))}
                </div>
              </div>
            </div>
          )}
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

const signed = (value: number) => (value > 0 ? `+${value}` : `${value}`);
