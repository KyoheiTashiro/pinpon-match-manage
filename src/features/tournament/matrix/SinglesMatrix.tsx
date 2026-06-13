import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { Match } from "@/store/types";
import { BigButton } from "@/components/ui/BigButton";
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

  if (!match) {
    return (
      <td className="border-2 border-dashed border-line text-center text-sub min-h-cell min-w-cell p-1">
        <button
          className="w-full h-full min-h-cell text-base flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:bg-bg active:scale-95 transition"
          aria-label={`${row.name} 対 ${column.name} 対戦追加`}
          onClick={onCreate}
        >
          <span className="text-2xl leading-none">＋</span>
          <span className="text-xs leading-none">対戦</span>
        </button>
      </td>
    );
  }

  const summary = matchSummary(match.games, winsNeeded);
  const rowIsLeft =
    involvesSingle(match, row.id) &&
    match.leftSide.kind === "single" &&
    match.leftSide.participantId === row.id;
  const rowWins = rowIsLeft ? summary.leftWins : summary.rightWins;
  const columnWins = rowIsLeft ? summary.rightWins : summary.leftWins;
  const rowWon = summary.finished && (rowIsLeft ? summary.winner === "L" : summary.winner === "R");
  const rowLost = summary.finished && !rowWon;
  const hasScore = summary.finished || match.games.length > 0;

  return (
    <td
      className={`border-2 ${hasScore ? "border-line" : "border-dashed border-line"} text-center min-h-cell min-w-cell p-0 ${
        rowWon ? "bg-winBg" : rowLost ? "bg-loseBg" : ""
      }`}
    >
      <button
        onClick={() => onOpen(match.id)}
        className="relative w-full h-full min-h-cell text-lg font-extrabold p-2 cursor-pointer hover:bg-bg active:scale-95 transition"
        aria-label={`${row.name} 対 ${column.name} ${rowWins}-${columnWins} 編集`}
      >
        {hasScore ? (
          <span>
            {rowWins}-{columnWins}
            {summary.finished && <span className="block text-sm">{rowWon ? "勝" : "負"}</span>}
          </span>
        ) : (
          <span className="flex flex-col items-center justify-center gap-0.5 text-sub">
            <span className="text-2xl leading-none">＋</span>
            <span className="text-xs leading-none">点数入力</span>
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
          <div className="text-sub text-base bg-bg border-2 border-line rounded-xl px-3 py-2">
            <h3 className="font-bold mb-1">使い方</h3>
            <ul className="list-disc list-inside space-y-0.5">
              <li>マスをタップ → 点数入力</li>
            </ul>
          </div>
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
          <BigButton onClick={save} disabled={saving}>
            {saving ? "保存中…" : "対戦表の画像を保存"}
          </BigButton>
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
