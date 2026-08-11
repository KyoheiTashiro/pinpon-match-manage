import { WinnerBadge } from "@/components/domain";
import { Badge } from "@/components/ui";
import { pairKey } from "@/domain/side";

export type MatrixPlayer = {
  id: string;
  name: string;
};

export type MatrixResult = {
  playerAId: string;
  playerBId: string;
  /** playerA 側の獲得ゲーム数 */
  winsA: number;
  /** playerB 側の獲得ゲーム数 */
  winsB: number;
  finished: boolean;
};

type Props = {
  players: MatrixPlayer[];
  results: MatrixResult[];
  /** セル押下。未対戦セルも押せる（対戦追加導線）。省略時セルは非ボタン表示 */
  onSelectCell?: (rowPlayerId: string, columnPlayerId: string) => void;
};

const MIN_PLAYERS = 2;

const CELL_STATE = {
  UNPLAYED: "unplayed",
  IN_PROGRESS: "inProgress",
  WON: "won",
  LOST: "lost",
} as const;
type CellState = (typeof CELL_STATE)[keyof typeof CELL_STATE];

const CELL_BADGE: Record<CellState, { tone: "primary" | "warning" | "neutral"; label: string }> = {
  [CELL_STATE.UNPLAYED]: { tone: "primary", label: "対戦" },
  [CELL_STATE.IN_PROGRESS]: { tone: "warning", label: "途中" },
  [CELL_STATE.WON]: { tone: "neutral", label: "終了" },
  [CELL_STATE.LOST]: { tone: "neutral", label: "終了" },
};

type CellView = {
  state: CellState;
  scoreLabel: string | null;
  backgroundClassName: string;
  ariaLabel: string;
};

const buildCellView = (
  rowPlayer: MatrixPlayer,
  columnPlayer: MatrixPlayer,
  result: MatrixResult | undefined,
): CellView => {
  if (!result) {
    return {
      state: CELL_STATE.UNPLAYED,
      scoreLabel: null,
      backgroundClassName: "bg-white",
      ariaLabel: `${rowPlayer.name} 対 ${columnPlayer.name} 対戦追加`,
    };
  }

  const rowIsPlayerA = result.playerAId === rowPlayer.id;
  const winsRow = rowIsPlayerA ? result.winsA : result.winsB;
  const winsOpponent = rowIsPlayerA ? result.winsB : result.winsA;
  const scoreLabel = `${winsRow}-${winsOpponent}`;

  if (!result.finished) {
    return {
      state: CELL_STATE.IN_PROGRESS,
      scoreLabel,
      backgroundClassName: "bg-warning/10",
      ariaLabel: `${rowPlayer.name} 対 ${columnPlayer.name} ${scoreLabel} 途中 編集`,
    };
  }

  const rowWon = winsRow > winsOpponent;
  return {
    state: rowWon ? CELL_STATE.WON : CELL_STATE.LOST,
    scoreLabel,
    backgroundClassName: rowWon ? "bg-winBg" : "bg-loseBg",
    ariaLabel: `${rowPlayer.name} 対 ${columnPlayer.name} ${scoreLabel} 終了 編集`,
  };
};

export const MatchMatrix = ({ players, results, onSelectCell }: Props) => {
  if (players.length < MIN_PLAYERS) {
    return <p className="text-sub">参加者を2人以上 登録してください。</p>;
  }

  const resultByPairKey = new Map<string, MatrixResult>();
  for (const result of results) {
    resultByPairKey.set(pairKey(result.playerAId, result.playerBId), result);
  }

  return (
    <div className="border-line w-fit max-w-full overflow-x-auto rounded-2xl border-2 bg-white">
      <table className="w-max table-fixed border-separate border-spacing-0">
        <thead>
          <tr>
            <th
              aria-hidden="true"
              className="border-ink w-cell sticky left-0 z-10 border-r-2 bg-white"
            />
            {players.map((columnPlayer, columnIndex) => (
              <th
                key={columnPlayer.id}
                scope="col"
                className={`border-ink w-cell truncate p-2 text-base font-bold ${columnIndex > 0 ? "border-l-2" : ""}`}
              >
                {columnPlayer.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((rowPlayer) => (
            <tr key={rowPlayer.id}>
              <th
                scope="row"
                className="border-ink w-cell sticky left-0 z-10 truncate border-t-2 border-r-2 bg-white p-2 text-base font-bold"
              >
                {rowPlayer.name}
              </th>
              {players.map((columnPlayer, columnIndex) => {
                const cellBorderClassName = `border-ink border-t-2 ${columnIndex > 0 ? "border-l-2" : ""}`;
                if (columnPlayer.id === rowPlayer.id) {
                  return (
                    <td
                      key={columnPlayer.id}
                      aria-hidden="true"
                      className={`h-cell bg-diagonal-stripes ${cellBorderClassName}`}
                    />
                  );
                }

                const cellView = buildCellView(
                  rowPlayer,
                  columnPlayer,
                  resultByPairKey.get(pairKey(rowPlayer.id, columnPlayer.id)),
                );
                const cellContent = (
                  <span className="flex flex-col items-center justify-center gap-0.5">
                    {cellView.scoreLabel && (
                      <span className="flex items-center gap-1">
                        {cellView.state === CELL_STATE.WON && <WinnerBadge size="sm" />}
                        <span className="text-2xl font-extrabold whitespace-nowrap">
                          {cellView.scoreLabel}
                        </span>
                      </span>
                    )}
                    <Badge tone={CELL_BADGE[cellView.state].tone} appearance="solid" size="md">
                      {CELL_BADGE[cellView.state].label}
                    </Badge>
                  </span>
                );

                return (
                  <td
                    key={columnPlayer.id}
                    className={`h-cell p-0 text-center ${cellBorderClassName} ${cellView.backgroundClassName}`}
                  >
                    {onSelectCell ? (
                      <button
                        type="button"
                        onClick={() => onSelectCell(rowPlayer.id, columnPlayer.id)}
                        aria-label={cellView.ariaLabel}
                        className="hover:bg-bg flex h-full w-full items-center justify-center p-2"
                      >
                        {cellContent}
                      </button>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center p-2">
                        {cellContent}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
