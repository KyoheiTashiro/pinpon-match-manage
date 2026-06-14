import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { Match } from "@/store/types";
import { BigButton } from "@/components/ui/BigButton";
import { DownloadIcon } from "@/components/icons";
import { useImageCapture } from "@/lib/useImageCapture";
import { matchSummary, winsNeededForBestOf } from "@/domain/match";
import { MatchModal } from "@/features/tournament/matrix/components/MatchModal";
import { involvesSingle, useMatrix } from "@/features/tournament/matrix/hooks";

type Player = { id: string; name: string };

type MatrixCellProps = {
  row: Player;
  column: Player;
  match: Match | undefined;
  winsNeeded: number;
  onCreate: () => void;
  onOpen: (matchId: string) => void;
};

const MatrixCell = ({ row, column, match, winsNeeded, onCreate, onOpen }: MatrixCellProps) => {
  if (row.id === column.id) {
    return (
      <td className="border-2 border-line bg-bg min-h-cell min-w-cell" aria-label="自分">
        <div className="w-full h-16 bg-[repeating-linear-gradient(45deg,#cbd5e1_0_8px,#94a3b8_8px_16px)]" />
      </td>
    );
  }

  const summary = match ? matchSummary(match.games, winsNeeded) : null;
  const rowIsLeft =
    !!match &&
    involvesSingle(match, row.id) &&
    match.leftSide.kind === "single" &&
    match.leftSide.participantId === row.id;
  const rowWins = rowIsLeft ? summary?.leftWins : summary?.rightWins;
  const columnWins = rowIsLeft ? summary?.rightWins : summary?.leftWins;
  const rowWon =
    summary?.finished === true && (rowIsLeft ? summary.winner === "L" : summary.winner === "R");
  const rowLost = summary?.finished === true && !rowWon;
  const hasScore = !!match && (summary?.finished === true || match.games.length > 0);
  const inProgress = hasScore && summary?.finished !== true;

  return (
    <td
      className={`border-2 ${hasScore ? "border-line" : "border-dashed border-line"} text-center min-h-cell min-w-cell p-0 ${
        rowWon ? "bg-winBg" : rowLost ? "bg-loseBg" : inProgress ? "bg-warning/10" : ""
      }`}
    >
      <button
        onClick={() => (match ? onOpen(match.id) : onCreate())}
        className="group relative w-full h-full min-h-cell text-lg font-extrabold p-2 cursor-pointer hover:bg-bg active:scale-95 transition"
        aria-label={
          hasScore
            ? `${row.name} 対 ${column.name} ${rowWins}-${columnWins}${inProgress ? " 途中" : ""} 編集`
            : `${row.name} 対 ${column.name} 対戦追加`
        }
      >
        {hasScore ? (
          <span>
            {rowWins}-{columnWins}
            {summary?.finished ? (
              <span className="block text-sm">{rowWon ? "勝" : "負"}</span>
            ) : (
              <span className="block text-sm text-warning">途中</span>
            )}
          </span>
        ) : (
          <span className="flex flex-col items-center justify-center gap-1">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-xl leading-none transition-colors group-hover:bg-primary group-hover:text-white">
              ＋
            </span>
            <span className="text-xs leading-none text-sub">対戦</span>
          </span>
        )}
      </button>
    </td>
  );
};

export const SinglesMatrix = ({ tournamentId }: { tournamentId: string }) => {
  const { tournament, participants, players, singlesCellMatch } = useMatrix(tournamentId);
  const addManualMatch = useAppStore((state) => state.addManualMatch);

  const { ref, saving, save } = useImageCapture("対戦表", tournament?.name);
  const [openMatchId, setOpenMatchId] = useState<string | null>(null);

  if (!tournament) return null;

  const wins = winsNeededForBestOf(tournament.bestOf);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold">対戦表</h2>

      {players.length < 2 ? (
        <p className="text-sub">参加者を2人以上 登録してください。</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <div ref={ref} className="bg-white p-3 space-y-2 inline-block align-top min-w-full">
              <div className="border-b-2 border-line pb-2">
                <div className="text-xl font-extrabold">{tournament.name}</div>
                <div className="text-sm text-sub">{tournament.date}</div>
              </div>
              <table className="matrix border-collapse w-full">
                <thead>
                  <tr>
                    <th
                      className="sticky left-0 bg-white z-10 border-2 border-line p-2 min-w-cell"
                      aria-label="対戦表の行列ヘッダー"
                    ></th>
                    {players.map((player) => (
                      <th
                        key={player.id}
                        className="border-2 border-line p-2 text-base font-bold min-w-cell"
                      >
                        {player.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {players.map((row) => (
                    <tr key={row.id}>
                      <th
                        scope="row"
                        className="sticky left-0 bg-white z-10 border-2 border-line p-2 text-base font-bold text-left whitespace-nowrap"
                      >
                        {row.name}
                      </th>
                      {players.map((column) => (
                        <MatrixCell
                          key={column.id}
                          row={row}
                          column={column}
                          match={singlesCellMatch.get([row.id, column.id].sort().join("|"))}
                          winsNeeded={wins}
                          onCreate={() => {
                            const id = addManualMatch(
                              tournamentId,
                              { kind: "single", participantId: row.id },
                              { kind: "single", participantId: column.id },
                            );
                            setOpenMatchId(id);
                          }}
                          onOpen={setOpenMatchId}
                        />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-base font-extrabold">画像で保存</div>
            <BigButton onClick={save} disabled={saving}>
              <span className="inline-flex items-center justify-center gap-2">
                <DownloadIcon />
                {saving ? "保存中…" : "対戦表"}
              </span>
            </BigButton>
          </div>
        </>
      )}

      {openMatchId && (
        <MatchModal
          matchId={openMatchId}
          participants={participants}
          onClose={() => setOpenMatchId(null)}
        />
      )}
    </div>
  );
};
