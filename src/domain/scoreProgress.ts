import type { Side } from "@/domain/match";
import { SIDE, currentServer } from "@/domain/match";

export type ProgressPoint = {
  index: number;
  scorer: Side;
  left: number;
  right: number;
  server: Side;
};

export const gameProgress = (pointLog: Side[], firstServerOfGame: Side): ProgressPoint[] =>
  pointLog.map((scorer, index) => {
    const preLog = pointLog.slice(0, index);
    const left = preLog.filter((side) => side === SIDE.LEFT).length;
    const right = preLog.filter((side) => side === SIDE.RIGHT).length;
    const server = currentServer({ leftScore: left, rightScore: right }, firstServerOfGame);
    return {
      index: index + 1,
      scorer,
      left: left + (scorer === SIDE.LEFT ? 1 : 0),
      right: right + (scorer === SIDE.RIGHT ? 1 : 0),
      server,
    };
  });
