import { WinnerBadge } from "@/components/domain";
import type { Side } from "@/domain/match";
import { SIDE, gameFirstServer } from "@/domain/match";
import { gameProgress, type ProgressPoint } from "@/domain/scoreProgress";
import type { MatchResultRow } from "@/features/tournament/result/hooks";

// スコア推移チャートのレイアウト寸法(px)
const COL_WIDTH = 44;
const ROW_HEIGHT = 56;
const CIRCLE_SIZE = 36;
const SVG_HEIGHT = ROW_HEIGHT * 2; // 上下2行ぶん

const ROW = { TOP: "top", BOT: "bot" } as const;
type Row = (typeof ROW)[keyof typeof ROW];

const rowCenterY = (row: Row) => (row === ROW.TOP ? ROW_HEIGHT / 2 : ROW_HEIGHT + ROW_HEIGHT / 2);

type Cell = { value: number; className: string; serving: boolean };

// 表示マッピング: 選択参加者(selfSide)を上段、相手を下段に正規化する。
const sideRow = (side: Side, selfSide: Side): Row => (side === selfSide ? ROW.TOP : ROW.BOT);

const sideScore = (point: ProgressPoint, side: Side): number =>
  side === SIDE.LEFT ? point.left : point.right;

const rallyCell = (point: ProgressPoint, row: Row, selfSide: Side, isLast: boolean): Cell => {
  const rowSide = row === ROW.TOP ? selfSide : selfSide === SIDE.LEFT ? SIDE.RIGHT : SIDE.LEFT;
  const isScorer = sideRow(point.scorer, selfSide) === row;
  return {
    value: sideScore(point, rowSide),
    className: isScorer
      ? isLast
        ? "bg-amber-300 text-green-800"
        : "bg-blue-500 text-white"
      : "bg-neutral-200 text-neutral-700",
    serving: sideRow(point.server, selfSide) === row,
  };
};

const ScoreCircle = ({ value, className, serving }: Cell) => (
  <div
    className="relative flex items-center justify-center"
    style={{ height: ROW_HEIGHT, width: COL_WIDTH }}
  >
    <div
      className={`flex items-center justify-center rounded-full text-sm font-bold select-none ${className}`}
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

const Column = ({ left, top, bottom }: { left: number; top: Cell; bottom: Cell }) => (
  <div
    className="absolute flex flex-col items-center"
    style={{ left, width: COL_WIDTH, height: SVG_HEIGHT }}
  >
    <ScoreCircle {...top} />
    <ScoreCircle {...bottom} />
  </div>
);

// ----- 1対戦グラフブロック（表示用・off-screen用の共通コンポーネント） -----
type Props = {
  match: MatchResultRow;
  selfSide: Side;
};

export const MatchScoreChart = ({ match, selfSide }: Props) => {
  const oppSide = selfSide === SIDE.LEFT ? SIDE.RIGHT : SIDE.LEFT;
  const selfName = selfSide === SIDE.LEFT ? match.leftName : match.rightName;
  const oppName = selfSide === SIDE.LEFT ? match.rightName : match.leftName;

  // hooks 側で既に realGames() 適用済みの leftWins/rightWins を再利用
  const selfWins = selfSide === SIDE.LEFT ? match.leftWins : match.rightWins;
  const opponentWins = selfSide === SIDE.LEFT ? match.rightWins : match.leftWins;

  // hooks 側で既に realGames() 適用済みの match.games から pointLog あるゲームだけ抽出
  const chartGames = match.games
    .map((game, realIndex) => ({ game, realIndex }))
    .filter(({ game }) => game.pointLog?.length);

  return (
    <div className="border-line border-t-2 pt-4 font-bold first:border-t-0 first:pt-2">
      <div className="mb-1 flex items-center gap-1 text-base">
        {match.winner === selfSide && <WinnerBadge size="sm" />}
        <span className={`text-xl ${match.winner === selfSide ? "" : "text-sub"}`}>{selfName}</span>
        <span className="text-sub"> vs </span>
        {match.winner === oppSide && <WinnerBadge size="sm" />}
        <span className={`text-xl ${match.winner === oppSide ? "" : "text-sub"}`}>{oppName}</span>
        <span className="text-xl tabular-nums">
          {" "}
          ({selfWins}-{opponentWins})
        </span>
      </div>

      {chartGames.length === 0 ? (
        <p className="text-sub">得点記録なし</p>
      ) : (
        <div className="mt-2 flex w-full flex-col gap-2 px-2">
          {chartGames.map(({ game, realIndex }) => {
            const points = gameProgress(
              game.pointLog!,
              gameFirstServer(match.firstServer, realIndex),
            );
            const svgWidth = points.length * COL_WIDTH; // ラリー列
            const final = points.at(-1);
            const finalTop = selfSide === SIDE.LEFT ? (final?.left ?? 0) : (final?.right ?? 0);
            const finalBot = selfSide === SIDE.LEFT ? (final?.right ?? 0) : (final?.left ?? 0);

            // 連続するラリーの得点者ドットを結ぶ線分
            const lines = points.slice(1).map((point, index) => ({
              x1: index * COL_WIDTH + COL_WIDTH / 2,
              y1: rowCenterY(sideRow(points[index].scorer, selfSide)),
              x2: (index + 1) * COL_WIDTH + COL_WIDTH / 2,
              y2: rowCenterY(sideRow(point.scorer, selfSide)),
            }));

            return (
              <div key={realIndex} className="border-line rounded-lg border-2 p-3">
                <div className="flex items-stretch">
                  {/* ゲーム番号 */}
                  <div
                    className="text-ink flex shrink-0 items-center pr-2 text-base font-bold"
                    style={{ height: SVG_HEIGHT }}
                  >
                    G{realIndex + 1}
                  </div>

                  {/* プレイヤー名の列 */}
                  <div
                    className="flex shrink-0 flex-col"
                    style={{ minWidth: 64, height: SVG_HEIGHT }}
                  >
                    {[selfName, oppName].map((name, row) => {
                      const won = row === 0 ? finalTop > finalBot : finalBot > finalTop;
                      return (
                        <div
                          key={row === 0 ? "self" : "opponent"}
                          className="text-ink flex items-center justify-end gap-1 pr-2 text-sm font-bold whitespace-nowrap"
                          style={{ height: ROW_HEIGHT }}
                        >
                          {won && <WinnerBadge size="sm-xs" />}
                          {name}
                        </div>
                      );
                    })}
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
                        {lines.map((line) => (
                          <line
                            key={line.x1}
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
                          key={point.index}
                          left={index * COL_WIDTH}
                          top={rallyCell(point, ROW.TOP, selfSide, index === points.length - 1)}
                          bottom={rallyCell(point, ROW.BOT, selfSide, index === points.length - 1)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
