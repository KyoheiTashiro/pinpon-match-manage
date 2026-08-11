import { WinnerBadge } from "@/components/domain";
import { Badge } from "@/components/ui";
import { pairKey } from "@/domain/side";
import {
  MATCH_STATE,
  STATE_BADGE,
  type MatchState,
} from "@/features/tournament/matches/matchState";

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

type CellView = {
  state: MatchState;
  scoreLabel: string | null;
  ariaLabel: string;
};

const buildCellView = (
  rowPlayer: MatrixPlayer,
  columnPlayer: MatrixPlayer,
  result: MatrixResult | undefined,
): CellView => {
  if (!result) {
    return {
      state: MATCH_STATE.UNPLAYED,
      scoreLabel: null,
      ariaLabel: `${rowPlayer.name} 対 ${columnPlayer.name} 対戦追加`,
    };
  }

  const rowIsPlayerA = result.playerAId === rowPlayer.id;
  const winsRow = rowIsPlayerA ? result.winsA : result.winsB;
  const winsOpponent = rowIsPlayerA ? result.winsB : result.winsA;
  const scoreLabel = `${winsRow}-${winsOpponent}`;

  if (!result.finished) {
    return {
      state: MATCH_STATE.IN_PROGRESS,
      scoreLabel,
      ariaLabel: `${rowPlayer.name} 対 ${columnPlayer.name} ${scoreLabel} 途中 編集`,
    };
  }

  return {
    state: winsRow > winsOpponent ? MATCH_STATE.WON : MATCH_STATE.LOST,
    scoreLabel,
    ariaLabel: `${rowPlayer.name} 対 ${columnPlayer.name} ${scoreLabel} 終了 編集`,
  };
};

export const MatchMatrix = ({ players, results, onSelectCell }: Props) => {
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
                const badge = STATE_BADGE[cellView.state];
                const cellContent = (
                  <span className="flex flex-col items-center justify-center gap-0.5">
                    {cellView.scoreLabel && (
                      <span className="flex items-center gap-1">
                        {cellView.state === MATCH_STATE.WON && <WinnerBadge size="sm" />}
                        <span className="text-2xl font-extrabold whitespace-nowrap">
                          {cellView.scoreLabel}
                        </span>
                      </span>
                    )}
                    <Badge tone={badge.tone} appearance="solid" size="md">
                      {badge.label}
                    </Badge>
                  </span>
                );

                return (
                  <td
                    key={columnPlayer.id}
                    className={`h-cell p-0 text-center ${cellBorderClassName} ${badge.backgroundClassName}`}
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
