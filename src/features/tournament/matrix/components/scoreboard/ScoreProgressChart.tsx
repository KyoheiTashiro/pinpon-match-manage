import type { Game, Side } from "../../../../../domain/match";
import { gameFirstServer, realGames } from "../../../../../domain/match";
import { gameProgress } from "../../../../../domain/scoreProgress";

// Display mapping: left=top, right=bottom (no swap)
const displayScorer = (p: { scorer: Side }): "top" | "bot" => (p.scorer === "L" ? "top" : "bot");

const displayServer = (p: { server: Side }): "top" | "bot" => (p.server === "L" ? "top" : "bot");

const topScore = (p: { left: number; right: number }) => p.left;
const botScore = (p: { left: number; right: number }) => p.right;

type Props = {
  games: Game[];
  leftName: string;
  rightName: string;
  matchFirstServer?: Side;
};

const COL_WIDTH = 44; // px per rally column
const ROW_HEIGHT = 56; // px per player row (circle + padding)
const CIRCLE_SIZE = 36; // diameter px
// Center Y of top row and bottom row within a 2-row block
const TOP_CY = ROW_HEIGHT / 2; // 28
const BOT_CY = ROW_HEIGHT + ROW_HEIGHT / 2; // 84
const SVG_HEIGHT = ROW_HEIGHT * 2; // 112

export const ScoreProgressChart = ({ games, leftName, rightName, matchFirstServer }: Props) => {
  // Filter to games with pointLog
  const allReal = realGames(games);
  // Map to {gameNumber (1-based within realGames), originalIndex, game}
  const chartGames = allReal
    .map((g, realIdx) => ({
      g,
      realIdx, // index within realGames (used for gameFirstServer)
      gameNumber: realIdx + 1,
    }))
    .filter(({ g }) => g.pointLog && g.pointLog.length > 0);

  if (chartGames.length === 0) return null;

  // Result tab: left = top, right = bottom (no swap)
  const topName = leftName;
  const botName = rightName;

  return (
    <div className="w-full mt-6 px-2">
      <h3 className="text-center text-lg font-bold mb-4 text-ink">点数進行</h3>
      <div className="flex flex-col gap-8">
        {chartGames.map(({ g, realIdx, gameNumber }) => {
          const log = g.pointLog!;
          // Determine firstServer for this game
          const firstServer: Side | undefined = matchFirstServer
            ? gameFirstServer(matchFirstServer, realIdx)
            : undefined;

          const points = firstServer ? gameProgress(log, firstServer) : gameProgress(log, "L"); // fallback; server display skipped if matchFirstServer absent

          const colCount = points.length;
          // SVG width covers all rally columns + 1 final score column
          const totalCols = colCount + 1;
          const svgWidth = totalCols * COL_WIDTH;

          // Final scores
          const lastPoint = points[points.length - 1];
          const finalTop = lastPoint ? topScore(lastPoint) : 0;
          const finalBot = lastPoint ? botScore(lastPoint) : 0;

          // Build SVG lines: connect consecutive rally dots
          const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
          for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1]!;
            const curr = points[i]!;
            const prevCY = displayScorer(prev) === "top" ? TOP_CY : BOT_CY;
            const currCY = displayScorer(curr) === "top" ? TOP_CY : BOT_CY;
            const prevCX = (i - 1) * COL_WIDTH + COL_WIDTH / 2;
            const currCX = i * COL_WIDTH + COL_WIDTH / 2;
            lines.push({ x1: prevCX, y1: prevCY, x2: currCX, y2: currCY });
          }

          return (
            <div key={gameNumber}>
              {/* Game header */}
              <div className="text-center font-bold text-base text-ink mb-2">Game {gameNumber}</div>

              {/* Name labels + chart (no overflow-x-auto: full width for image capture) */}
              <div className="flex items-stretch">
                {/* Player name column */}
                <div className="flex flex-col shrink-0" style={{ width: 64, height: SVG_HEIGHT }}>
                  <div
                    className="flex items-center justify-end pr-2 text-sm font-bold text-ink truncate"
                    style={{ height: ROW_HEIGHT }}
                  >
                    {topName}
                  </div>
                  <div
                    className="flex items-center justify-end pr-2 text-sm font-bold text-ink truncate"
                    style={{ height: ROW_HEIGHT }}
                  >
                    {botName}
                  </div>
                </div>

                {/* Chart: no overflow-x-auto so full width renders for image capture */}
                <div className="flex-1 min-w-0">
                  <div className="relative" style={{ width: svgWidth, height: SVG_HEIGHT }}>
                    {/* SVG overlay for lines */}
                    <svg
                      className="absolute inset-0 pointer-events-none"
                      width={svgWidth}
                      height={SVG_HEIGHT}
                      style={{ overflow: "visible" }}
                    >
                      {lines.map((ln, li) => (
                        <line
                          key={li}
                          x1={ln.x1}
                          y1={ln.y1}
                          x2={ln.x2}
                          y2={ln.y2}
                          stroke="#3b82f6"
                          strokeWidth={3}
                          strokeLinecap="round"
                        />
                      ))}
                    </svg>

                    {/* Rally columns */}
                    {points.map((pt, colIdx) => {
                      const scorer = displayScorer(pt);
                      const server = matchFirstServer ? displayServer(pt) : null;
                      const tScore = topScore(pt);
                      const bScore = botScore(pt);
                      const left = colIdx * COL_WIDTH;

                      return (
                        <div
                          key={colIdx}
                          className="absolute flex flex-col items-center"
                          style={{ left, width: COL_WIDTH, height: SVG_HEIGHT }}
                        >
                          {/* Top row */}
                          <div
                            className="relative flex items-center justify-center"
                            style={{ height: ROW_HEIGHT, width: COL_WIDTH }}
                          >
                            <div
                              className={`flex items-center justify-center rounded-full font-bold text-sm select-none ${
                                scorer === "top"
                                  ? "bg-blue-500 text-white"
                                  : "bg-neutral-200 text-neutral-700"
                              }`}
                              style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
                            >
                              {tScore}
                            </div>
                            {server === "top" && (
                              <div
                                className="absolute bg-orange-500 rounded-full"
                                style={{
                                  width: 20,
                                  height: 4,
                                  bottom: 6,
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                }}
                              />
                            )}
                          </div>
                          {/* Bottom row */}
                          <div
                            className="relative flex items-center justify-center"
                            style={{ height: ROW_HEIGHT, width: COL_WIDTH }}
                          >
                            <div
                              className={`flex items-center justify-center rounded-full font-bold text-sm select-none ${
                                scorer === "bot"
                                  ? "bg-blue-500 text-white"
                                  : "bg-neutral-200 text-neutral-700"
                              }`}
                              style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
                            >
                              {bScore}
                            </div>
                            {server === "bot" && (
                              <div
                                className="absolute bg-orange-500 rounded-full"
                                style={{
                                  width: 20,
                                  height: 4,
                                  bottom: 6,
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                }}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Final score column */}
                    <div
                      className="absolute flex flex-col items-center"
                      style={{ left: colCount * COL_WIDTH, width: COL_WIDTH, height: SVG_HEIGHT }}
                    >
                      {/* Top final */}
                      <div
                        className="flex items-center justify-center"
                        style={{ height: ROW_HEIGHT, width: COL_WIDTH }}
                      >
                        <div
                          className={`flex items-center justify-center rounded-full font-bold text-sm bg-amber-300 select-none ${
                            finalTop > finalBot ? "text-green-800" : "text-neutral-700"
                          }`}
                          style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
                        >
                          {finalTop}
                        </div>
                      </div>
                      {/* Bottom final */}
                      <div
                        className="flex items-center justify-center"
                        style={{ height: ROW_HEIGHT, width: COL_WIDTH }}
                      >
                        <div
                          className={`flex items-center justify-center rounded-full font-bold text-sm bg-amber-300 select-none ${
                            finalBot > finalTop ? "text-green-800" : "text-neutral-700"
                          }`}
                          style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
                        >
                          {finalBot}
                        </div>
                      </div>
                    </div>
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
