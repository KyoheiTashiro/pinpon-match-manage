import { DownloadIcon } from "@/components/icons";
import { Button, Select, Tabs } from "@/components/ui";
import { MatchResultsTable } from "@/features/tournament/result/components/MatchResultsTable";
import { MatchScoreChart } from "@/features/tournament/result/components/MatchScoreChart";
import { PersonalMatchResults } from "@/features/tournament/result/components/PersonalMatchResults";
import { RankingTable } from "@/features/tournament/result/components/RankingTable";
import { DISPLAY_MODE, useResult } from "@/features/tournament/result/hooks";
import { FORMAT } from "@/store/types";
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
    mode,
    setMode,
    chartMatches,
    participantOptions,
    setSelectedParticipantId,
    resolvedParticipantId,
    personalMatches,
    isSaving,
  } = useResult(tournamentId);

  if (!tournament) return null;

  const renderContent = () => {
    if (mode === DISPLAY_MODE.OVERALL) {
      return (
        <>
          <RankingTable rows={rows} />
          <MatchResultsTable matchResults={matchResults} bestOf={tournament.bestOf} />
        </>
      );
    }
    // INDIVIDUAL・GRAPH 両モードとも参加者が必須
    if (participantOptions.length === 0) {
      return <p className="text-sub">参加者がいません。</p>;
    }
    if (mode === DISPLAY_MODE.INDIVIDUAL) {
      return <PersonalMatchResults matches={personalMatches} />;
    }
    if (chartMatches.length === 0) {
      return <p className="text-sub">対戦結果がありません。</p>;
    }
    return (
      <div className="space-y-6">
        {chartMatches.map(({ match, selfSide }) => (
          <MatchScoreChart key={match.id} match={match} selfSide={selfSide} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold">結果</h2>

      {rows.length === 0 ? (
        <p className="text-sub">参加者を登録してください。</p>
      ) : (
        <>
          {/* サブタブ（画像保存対象外） */}
          <Tabs
            ariaLabel="表示モード"
            value={mode}
            onChange={setMode}
            options={[
              { value: DISPLAY_MODE.OVERALL, label: "全体" },
              {
                value: DISPLAY_MODE.INDIVIDUAL,
                label: tournament.format === FORMAT.SINGLES ? "個人" : "ペア",
              },
              { value: DISPLAY_MODE.GRAPH, label: "グラフ" },
            ]}
          />

          {/* 個人・グラフモードで表示する参加者セレクタ（画像保存対象外） */}
          {(mode === DISPLAY_MODE.INDIVIDUAL || mode === DISPLAY_MODE.GRAPH) &&
            participantOptions.length > 0 && (
              <div className="sm:max-w-md">
                <Select
                  label="参加者を選択"
                  value={resolvedParticipantId}
                  onChange={setSelectedParticipantId}
                  options={participantOptions}
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
              <div className="border-line border-b-2 pb-2">
                <div className="text-xl font-extrabold">{tournament.name}</div>
                <div className="text-sub text-sm">{tournament.date}</div>
              </div>
              {renderContent()}
            </div>
          </div>

          {/* 保存ボタン（画像対象外） */}
          <Button className="w-fit" onClick={() => void main.save()} disabled={isSaving}>
            <span className="inline-flex items-center justify-center gap-2">
              <DownloadIcon />
              {main.saving ? "保存中…" : "画像で保存"}
            </span>
          </Button>
        </>
      )}
    </div>
  );
};
