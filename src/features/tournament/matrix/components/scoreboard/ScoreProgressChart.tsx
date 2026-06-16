import type { Game, Side } from "@/domain/match";
import { SIDE, gameFirstServer, realGames } from "@/domain/match";
import { gameProgress, type ProgressPoint } from "@/domain/scoreProgress";
import {
  CHART_COL_WIDTH as COL_WIDTH,
  CHART_ROW_HEIGHT as ROW_HEIGHT,
  CHART_CIRCLE_SIZE as CIRCLE_SIZE,
} from "@/features/tournament/matrix/hooks";

const ROW = { TOP: "top", BOT: "bot" } as const;
type Row = (typeof ROW)[keyof typeof ROW];

// 表示マッピング: 左=上段, 右=下段（入れ替えなし）
const displayScorer = (point: ProgressPoint): Row =>
  point.scorer === SIDE.LEFT ? ROW.TOP : ROW.BOT;
const displayServer = (point: ProgressPoint): Row =>
  point.server === SIDE.LEFT ? ROW.TOP : ROW.BOT;
const topScore = (point: { left: number }) => point.left;
const botScore = (point: { right: number }) => point.right;

type Props = {
  games: Game[];
  leftName: string;
  rightName: string;
  matchFirstServer: Side;
};

const SVG_HEIGHT = ROW_HEIGHT * 2; // 上下2行ぶん

const CIRCLE_VARIANT = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  FINAL_WINNER: "finalWinner",
  FINAL_LOSER: "finalLoser",
} as const;
type CircleVariant = (typeof CIRCLE_VARIANT)[keyof typeof CIRCLE_VARIANT];

const circleClassName: Record<CircleVariant, string> = {
  [CIRCLE_VARIANT.ACTIVE]: "bg-blue-500 text-white",
  [CIRCLE_VARIANT.INACTIVE]: "bg-neutral-200 text-neutral-700",
  [CIRCLE_VARIANT.FINAL_WINNER]: "bg-amber-300 text-green-800",
  [CIRCLE_VARIANT.FINAL_LOSER]: "bg-amber-300 text-neutral-700",
};

const ScoreCircle = ({
  value,
  variant,
  serving,
}: {
  value: number;
  variant: CircleVariant;
  serving: boolean;
}) => (
  <div
    className="relative flex items-center justify-center"
    style={{ height: ROW_HEIGHT, width: COL_WIDTH }}
  >
    <div
      className={`flex select-none items-center justify-center rounded-full text-sm font-bold ${circleClassName[variant]}`}
      style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
    >
      {value}
    </div>
    {serving && (
      <div
        className="absolute rounded-full bg-orange-500"
        style={{ width: 20, height: 4, bottom: 6, left: "50%", transform: "translateX(-50%)" }}
      />
    )}
  </div>
);

type ColumnCell = { value: number; variant: CircleVariant; serving: boolean };

const Column = ({ left, top, bottom }: { left: number; top: ColumnCell; bottom: ColumnCell }) => (
  <div
    className="absolute flex flex-col items-center"
    style={{ left, width: COL_WIDTH, height: SVG_HEIGHT }}
  >
    <ScoreCircle value={top.value} variant={top.variant} serving={top.serving} />
    <ScoreCircle value={bottom.value} variant={bottom.variant} serving={bottom.serving} />
  </div>
);

const rallyCell = (point: ProgressPoint, row: Row): ColumnCell => ({
  value: row === ROW.TOP ? topScore(point) : botScore(point),
  variant: displayScorer(point) === row ? CIRCLE_VARIANT.ACTIVE : CIRCLE_VARIANT.INACTIVE,
  serving: displayServer(point) === row,
});

const finalCell = (value: number, opponent: number): ColumnCell => ({
  value,
  variant: value > opponent ? CIRCLE_VARIANT.FINAL_WINNER : CIRCLE_VARIANT.FINAL_LOSER,
  serving: false,
});

const rowCenterY = (row: Row) => (row === ROW.TOP ? ROW_HEIGHT / 2 : ROW_HEIGHT + ROW_HEIGHT / 2);

export const ScoreProgressChart = ({ games, leftName, rightName, matchFirstServer }: Props) => {
  const chartGames = realGames(games)
    .map((game, realIndex) => ({ game, realIndex, gameNumber: realIndex + 1 }))
    .filter(({ game }) => game.pointLog && game.pointLog.length > 0);

  if (chartGames.length === 0) return null;

  return (
    <div className="mt-2 w-full px-2">
      <div className="flex flex-col gap-2">
        {chartGames.map(({ game, realIndex, gameNumber }) => {
          const points = gameProgress(game.pointLog!, gameFirstServer(matchFirstServer, realIndex));
          const columnCount = points.length;
          const svgWidth = (columnCount + 1) * COL_WIDTH; // ラリー列 + 最終スコア列

          const lastPoint = points.at(-1);
          const finalTop = lastPoint ? topScore(lastPoint) : 0;
          const finalBot = lastPoint ? botScore(lastPoint) : 0;

          // 連続するラリーの得点者ドットを結ぶ線分
          const lines = points.slice(1).map((point, index) => ({
            x1: index * COL_WIDTH + COL_WIDTH / 2,
            y1: rowCenterY(displayScorer(points[index])),
            x2: (index + 1) * COL_WIDTH + COL_WIDTH / 2,
            y2: rowCenterY(displayScorer(point)),
          }));

          return (
            <div key={gameNumber}>
              <div className="mb-2 text-left text-base font-bold text-ink">ゲーム {gameNumber}</div>
              <div className="flex items-stretch">
                {/* プレイヤー名の列 */}
                <div
                  className="flex shrink-0 flex-col"
                  style={{ minWidth: 64, height: SVG_HEIGHT }}
                >
                  {[leftName, rightName].map((name, row) => (
                    <div
                      key={row}
                      className="flex items-center justify-end whitespace-nowrap pr-2 text-sm font-bold text-ink"
                      style={{ height: ROW_HEIGHT }}
                    >
                      {name}
                    </div>
                  ))}
                </div>

                {/* チャート本体（画像取得のため overflow-x-auto は付けず全幅描画） */}
                <div className="min-w-0 flex-1">
                  <div className="relative" style={{ width: svgWidth, height: SVG_HEIGHT }}>
                    <svg
                      className="pointer-events-none absolute inset-0"
                      width={svgWidth}
                      height={SVG_HEIGHT}
                      style={{ overflow: "visible" }}
                    >
                      {lines.map((line, index) => (
                        <line
                          key={index}
                          x1={line.x1}
                          y1={line.y1}
                          x2={line.x2}
                          y2={line.y2}
                          stroke="#3b82f6"
                          strokeWidth={3}
                          strokeLinecap="round"
                        />
                      ))}
                    </svg>

                    {points.map((point, index) => (
                      <Column
                        key={index}
                        left={index * COL_WIDTH}
                        top={rallyCell(point, ROW.TOP)}
                        bottom={rallyCell(point, ROW.BOT)}
                      />
                    ))}

                    <Column
                      left={columnCount * COL_WIDTH}
                      top={finalCell(finalTop, finalBot)}
                      bottom={finalCell(finalBot, finalTop)}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
