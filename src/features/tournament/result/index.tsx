import { Select } from "@/components/ui/Select";
import { AllMatchesCapture } from "@/features/tournament/result/components/AllMatchesCapture";
import { GraphView } from "@/features/tournament/result/components/GraphView";
import { ResultModeTabs } from "@/features/tournament/result/components/ResultModeTabs";
import { SaveImageButtons } from "@/features/tournament/result/components/SaveImageButtons";
import { TableView } from "@/features/tournament/result/components/TableView";
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
          <ResultModeTabs mode={mode} setMode={setMode} />

          {/* グラフモード時のみ表示するセレクタ（画像保存対象外） */}
          {mode === DISPLAY_MODE.GRAPH && graphMatches.length > 0 && (
            <div className="sm:max-w-md">
              <Select
                label="対戦を選択"
                value={resolvedSelectedId}
                onChange={setSelectedMatchId}
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
                <TableView rows={rows} matchResults={matchResults} bestOf={tournament.bestOf} />
              ) : (
                <GraphView graphMatches={graphMatches} selectedMatch={selectedMatch} />
              )}
            </div>
          </div>

          {/* 保存ボタン（画像対象外） */}
          <SaveImageButtons
            mode={mode}
            main={main}
            allMatches={allMatches}
            isSaving={isSaving}
            selectedMatch={selectedMatch}
            graphMatches={graphMatches}
          />

          {/* off-screen 全対戦版（graphモード時のみ、画像取得用） */}
          {mode === DISPLAY_MODE.GRAPH && graphMatches.length > 0 && (
            <AllMatchesCapture
              captureRef={allMatches.ref}
              name={tournament.name}
              date={tournament.date}
              graphMatches={graphMatches}
            />
          )}
        </>
      )}
    </div>
  );
};
