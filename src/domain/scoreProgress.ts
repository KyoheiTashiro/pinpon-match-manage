import type { Side } from "@/domain/match";
import { currentServer } from "@/domain/match";

export type ProgressPoint = {
  index: number;
  scorer: Side;
  left: number;
  right: number;
  server: Side;
};

export const gameProgress = (pointLog: Side[], firstServerOfGame: Side): ProgressPoint[] =>
  pointLog.map((scorer, i) => {
    const preLog = pointLog.slice(0, i);
    const left = preLog.filter((s) => s === "L").length;
    const right = preLog.filter((s) => s === "R").length;
    const server = currentServer({ leftScore: left, rightScore: right }, firstServerOfGame);
    return {
      index: i + 1,
      scorer,
      left: left + (scorer === "L" ? 1 : 0),
      right: right + (scorer === "R" ? 1 : 0),
      server,
    };
  });
