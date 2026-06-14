import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { SelectMenu } from "@/components/ui/SelectMenu";
import { DownloadIcon } from "@/components/icons";
import { useImageCapture } from "@/lib/useImageCapture";
import { useResultRows } from "@/features/tournament/result/hooks";
import { MatchGraphBlock } from "@/features/tournament/result/components/MatchGraphBlock";
import { TableMode } from "@/features/tournament/result/components/TableMode";

export const ResultTab = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  if (!tournamentId) return null;
  return <ResultView tournamentId={tournamentId} />;
};

type DisplayMode = "table" | "graph";

const ResultView = ({ tournamentId }: { tournamentId: string }) => {
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

  const graphOptions = useMemo(
    () => graphMatches.map((m) => ({ value: m.id, label: `${m.leftName} vs ${m.rightName}` })),
    [graphMatches],
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
          {mode === "graph" && graphMatches.length > 0 && (
            <div className="sm:max-w-md">
              <SelectMenu
                label="対戦を選択"
                value={resolvedSelectedId}
                onChange={(id) => setSelectedMatchId(id)}
                options={graphOptions}
              />
            </div>
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
            <div className="space-y-2 sm:max-w-md">
              <div className="text-base font-extrabold">画像で保存</div>
              <Button className="w-fit" onClick={() => main.save()} disabled={isSaving}>
                <span className="inline-flex items-center justify-center gap-2">
                  <DownloadIcon />
                  {main.saving ? "保存中…" : "点数表"}
                </span>
              </Button>
            </div>
          ) : (
            <div className="space-y-2 sm:max-w-md">
              <div className="text-base font-extrabold">画像で保存</div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  className="w-fit"
                  onClick={() =>
                    selectedMatch &&
                    main.save(`${selectedMatch.leftName} vs ${selectedMatch.rightName}`)
                  }
                  disabled={isSaving || !selectedMatch}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <DownloadIcon />
                    {main.saving ? "保存中…" : "表示中の対戦"}
                  </span>
                </Button>
                <Button
                  className="w-fit"
                  onClick={() => allMatches.save("全対戦")}
                  disabled={isSaving || graphMatches.length === 0}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <DownloadIcon />
                    {allMatches.saving ? "保存中…" : "全ての対戦"}
                  </span>
                </Button>
              </div>
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
                {/* 全対戦を縦積み（対戦ごとに区切り線） */}
                <div>
                  {graphMatches.map((match) => (
                    <div
                      key={match.id}
                      className="pt-6 mt-6 border-t-2 border-line first:pt-0 first:mt-0 first:border-t-0"
                    >
                      <MatchGraphBlock match={match} />
                    </div>
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
