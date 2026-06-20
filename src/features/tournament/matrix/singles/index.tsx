import { matchSummary, winsNeededForBestOf, SIDE } from "@/domain/match";
import { MatchModal } from "@/features/tournament/matrix/components/MatchModal";
import { SaveImageButton } from "@/features/tournament/matrix/components/SaveImageButton";
import {
  involvesSingle,
  useSinglesMatrix,
  MIN_PLAYERS_SINGLES,
} from "@/features/tournament/matrix/singles/hooks";
import type { Match } from "@/store/types";
import { SIDE_KIND } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";
import { useImageCapture } from "@/utils/imageCapture/useImageCapture";

type Player = { id: string; name: string };

type Props = {
  row: Player;
  column: Player;
  match: Match | undefined;
  winsNeeded: number;
  isLastRow: boolean;
  isLastColumn: boolean;
  onCreate: () => void;
  onOpen: (matchId: string) => void;
};

const MatrixCell = ({
  row,
  column,
  match,
  winsNeeded,
  isLastRow,
  isLastColumn,
  onCreate,
  onOpen,
}: Props) => {
  const cellBorder = `${isLastColumn ? "" : "border-r-2"} ${isLastRow ? "" : "border-b-2"}`;

  if (row.id === column.id) {
    const corner = isLastRow && isLastColumn ? "overflow-hidden rounded-br-2xl" : "";
    return (
      <td
        className={`min-h-cell min-w-cell border-line bg-bg ${cellBorder} ${corner}`}
        aria-label="自分"
      >
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
      className={`min-h-cell min-w-cell border-line p-0 text-center ${cellBorder} ${
        rowWon ? "bg-winBg" : rowLost ? "bg-loseBg" : inProgress ? "bg-warning/10" : ""
      }`}
    >
      <button
        onClick={() => (match ? onOpen(match.id) : onCreate())}
        className="group min-h-cell hover:bg-bg relative h-full w-full cursor-pointer p-2 text-lg font-extrabold transition active:scale-95"
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
              <span className="text-warning block text-sm">途中</span>
            )}
          </span>
        ) : (
          <span className="flex flex-col items-center justify-center gap-1">
            <span className="bg-primary/10 text-primary group-hover:bg-primary flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none transition-colors group-hover:text-white">
              ＋
            </span>
            <span className="text-sub text-xs leading-none whitespace-nowrap">対戦</span>
          </span>
        )}
      </button>
    </td>
  );
};

export const SinglesMatrix = ({ tournamentId }: { tournamentId: string }) => {
  const {
    tournament,
    participants,
    players,
    singlesCellMatch,
    openMatchId,
    openMatch,
    closeMatch,
  } = useSinglesMatrix(tournamentId);
  const addManualMatch = useAppStore((state) => state.addManualMatch);

  const { ref, saving, save } = useImageCapture();

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
              <div className="border-line border-b-2 pb-2">
                <div className="text-xl font-extrabold">{tournament.name}</div>
                <div className="text-sub text-sm">{tournament.date}</div>
              </div>
              <table className="matrix border-line w-full border-separate border-spacing-0 rounded-2xl border-2">
                <thead>
                  <tr>
                    <th
                      className="min-w-cell border-line sticky left-0 z-10 rounded-tl-2xl border-r-2 border-b-2 bg-white p-2"
                      aria-label="対戦表の行列ヘッダー"
                    ></th>
                    {players.map((player, colIndex) => {
                      const isLast = colIndex === players.length - 1;
                      return (
                        <th
                          key={player.id}
                          className={`min-w-cell border-line border-b-2 p-2 text-base font-bold whitespace-nowrap ${
                            isLast ? "rounded-tr-2xl" : "border-r-2"
                          }`}
                        >
                          {player.name}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {players.map((row, rowIndex) => {
                    const isLastRow = rowIndex === players.length - 1;
                    return (
                      <tr key={row.id}>
                        <th
                          scope="row"
                          className={`border-line sticky left-0 z-10 border-r-2 bg-white p-2 text-left text-base font-bold whitespace-nowrap ${
                            isLastRow ? "rounded-bl-2xl" : "border-b-2"
                          }`}
                        >
                          {row.name}
                        </th>
                        {players.map((column, colIndex) => (
                          <MatrixCell
                            key={column.id}
                            row={row}
                            column={column}
                            match={singlesCellMatch.get([row.id, column.id].toSorted().join("|"))}
                            winsNeeded={wins}
                            isLastRow={isLastRow}
                            isLastColumn={colIndex === players.length - 1}
                            onCreate={() => {
                              const id = addManualMatch(
                                tournamentId,
                                {
                                  kind: SIDE_KIND.SINGLE,
                                  participantId: row.id,
                                },
                                {
                                  kind: SIDE_KIND.SINGLE,
                                  participantId: column.id,
                                },
                              );
                              openMatch(id);
                            }}
                            onOpen={openMatch}
                          />
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <SaveImageButton
            saving={saving}
            onSave={() => {
              void save();
            }}
          />
        </>
      )}

      {openMatchId && (
        <MatchModal matchId={openMatchId} participants={participants} onClose={closeMatch} />
      )}
    </div>
  );
};
