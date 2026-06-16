import { DownloadIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { MatchGraphBlock } from "@/features/tournament/result/components/MatchGraphBlock";
import { TableMode } from "@/features/tournament/result/components/TableMode";
import { DISPLAY_MODE, useResult } from "@/features/tournament/result/hooks";
import { useParams } from "react-router-dom";

export const ResultTab = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  if (!tournamentId) return null;
  return <ResultView tournamentId={tournamentId} />;
};

const ResultView = ({ tournamentId }: { tournamentId: string }) => {
  const {
    tournament,
    rows,
    matchResults,
    main,
    allMatches,
    mode,
    setMode,
    graphMatches,
    graphOptions,
    setSelectedMatchId,
    resolvedSelectedId,
    selectedMatch,
    isSaving,
  } = useResult(tournamentId);

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
              aria-selected={mode === DISPLAY_MODE.TABLE}
              onClick={() => setMode(DISPLAY_MODE.TABLE)}
              className={`min-h-btn flex-1 border-b-4 text-lg font-bold transition-colors ${
                mode === DISPLAY_MODE.TABLE
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-transparent bg-white text-ink"
              }`}
            >
              点数表
            </button>
            <button
              role="tab"
              aria-selected={mode === DISPLAY_MODE.GRAPH}
              onClick={() => setMode(DISPLAY_MODE.GRAPH)}
              className={`min-h-btn flex-1 border-b-4 text-lg font-bold transition-colors ${
                mode === DISPLAY_MODE.GRAPH
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-transparent bg-white text-ink"
              }`}
            >
              グラフ
            </button>
          </div>

          {/* グラフモード時のみ表示するセレクタ（画像保存対象外） */}
          {mode === DISPLAY_MODE.GRAPH && graphMatches.length > 0 && (
            <div className="sm:max-w-md">
              <Select
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
              className="inline-block min-w-full space-y-2 bg-white p-3 align-top"
            >
              {/* 大会名・日付ヘッダ（両モード共通） */}
              <div className="border-b-2 border-line pb-2">
                <div className="text-xl font-extrabold">{tournament.name}</div>
                <div className="text-sm text-sub">{tournament.date}</div>
              </div>

              {mode === DISPLAY_MODE.TABLE ? (
                <TableMode rows={rows} matchResults={matchResults} bestOf={tournament.bestOf} />
              ) : graphMatches.length === 0 ? (
                <p className="text-sub">対戦結果がありません。</p>
              ) : selectedMatch ? (
                <MatchGraphBlock match={selectedMatch} />
              ) : null}
            </div>
          </div>

          {/* 保存ボタン（画像対象外） */}
          {mode === DISPLAY_MODE.TABLE ? (
            <div className="space-y-2 sm:max-w-md">
              <div className="text-base font-extrabold">画像で保存</div>
              <Button
                className="w-fit"
                onClick={() => {
                  void main.save();
                }}
                disabled={isSaving}
              >
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
                  onClick={() => {
                    if (selectedMatch) {
                      void main.save();
                    }
                  }}
                  disabled={isSaving || !selectedMatch}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <DownloadIcon />
                    {main.saving ? "保存中…" : "表示中の対戦"}
                  </span>
                </Button>
                <Button
                  className="w-fit"
                  onClick={() => {
                    void allMatches.save();
                  }}
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
          {mode === DISPLAY_MODE.GRAPH && graphMatches.length > 0 && (
            <div
              aria-hidden
              className="pointer-events-none absolute -left-[99999px] top-0 h-0 overflow-hidden"
            >
              <div ref={allMatches.ref} className="space-y-2 bg-white p-3">
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
                      className="mt-6 border-t-2 border-line pt-6 first:mt-0 first:border-t-0 first:pt-0"
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
