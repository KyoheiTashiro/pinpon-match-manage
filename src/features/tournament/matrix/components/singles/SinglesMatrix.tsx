import { DownloadIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { matchSummary, winsNeededForBestOf, SIDE } from "@/domain/match";
import { MatchModal } from "@/features/tournament/matrix/components/MatchModal";
import { involvesSingle, useMatrix, MIN_PLAYERS_SINGLES } from "@/features/tournament/matrix/hooks";
import type { Match } from "@/store/types";
import { SIDE_KIND } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";
import { useImageCapture } from "@/utils/imageCapture/useImageCapture";
import { useState } from "react";

type Player = { id: string; name: string };

type Props = {
  row: Player;
  column: Player;
  match: Match | undefined;
  winsNeeded: number;
  onCreate: () => void;
  onOpen: (matchId: string) => void;
};

const MatrixCell = ({ row, column, match, winsNeeded, onCreate, onOpen }: Props) => {
  if (row.id === column.id) {
    return (
      <td className="min-h-cell min-w-cell border-2 border-line bg-bg" aria-label="自分">
        <div className="h-16 w-full bg-[repeating-linear-gradient(45deg,#cbd5e1_0_8px,#94a3b8_8px_16px)]" />
      </td>
    );
  }

  const summary = match ? matchSummary(match.games, winsNeeded) : null;
  const rowIsLeft =
    !!match &&
    involvesSingle(match, row.id) &&
    match.leftSide.kind === SIDE_KIND.SINGLE &&
    match.leftSide.participantId === row.id;
  const rowWins = rowIsLeft ? summary?.leftWins : summary?.rightWins;
  const columnWins = rowIsLeft ? summary?.rightWins : summary?.leftWins;
  const rowWon =
    summary?.finished === true &&
    (rowIsLeft ? summary.winner === SIDE.LEFT : summary.winner === SIDE.RIGHT);
  const rowLost = summary?.finished === true && !rowWon;
  const hasScore = !!match && (summary?.finished === true || match.games.length > 0);
  const inProgress = hasScore && summary?.finished !== true;

  return (
    <td
      className={`min-h-cell min-w-cell border-2 border-line p-0 text-center ${
        rowWon ? "bg-winBg" : rowLost ? "bg-loseBg" : inProgress ? "bg-warning/10" : ""
      }`}
    >
      <button
        onClick={() => (match ? onOpen(match.id) : onCreate())}
        className="group relative h-full min-h-cell w-full cursor-pointer p-2 text-lg font-extrabold transition hover:bg-bg active:scale-95"
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
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xl leading-none text-primary transition-colors group-hover:bg-primary group-hover:text-white">
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

  const { ref, saving, save } = useImageCapture();
  const [openMatchId, setOpenMatchId] = useState<string | null>(null);

  if (!tournament) return null;

  const wins = winsNeededForBestOf(tournament.bestOf);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold">対戦表</h2>

      {players.length < MIN_PLAYERS_SINGLES ? (
        <p className="text-sub">参加者を2人以上 登録してください。</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <div ref={ref} className="inline-block min-w-full space-y-2 bg-white p-3 align-top">
              <div className="border-b-2 border-line pb-2">
                <div className="text-xl font-extrabold">{tournament.name}</div>
                <div className="text-sm text-sub">{tournament.date}</div>
              </div>
              <table className="matrix w-full border-collapse">
                <thead>
                  <tr>
                    <th
                      className="sticky left-0 z-10 min-w-cell border-2 border-line bg-white p-2"
                      aria-label="対戦表の行列ヘッダー"
                    ></th>
                    {players.map((player) => (
                      <th
                        key={player.id}
                        className="min-w-cell whitespace-nowrap border-2 border-line p-2 text-base font-bold"
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
                        className="sticky left-0 z-10 whitespace-nowrap border-2 border-line bg-white p-2 text-left text-base font-bold"
                      >
                        {row.name}
                      </th>
                      {players.map((column) => (
                        <MatrixCell
                          key={column.id}
                          row={row}
                          column={column}
                          match={singlesCellMatch.get([row.id, column.id].toSorted().join("|"))}
                          winsNeeded={wins}
                          onCreate={() => {
                            const id = addManualMatch(
                              tournamentId,
                              { kind: SIDE_KIND.SINGLE, participantId: row.id },
                              { kind: SIDE_KIND.SINGLE, participantId: column.id },
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
            <Button
              onClick={() => {
                void save();
              }}
              disabled={saving}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <DownloadIcon />
                {saving ? "保存中…" : "対戦表"}
              </span>
            </Button>
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
