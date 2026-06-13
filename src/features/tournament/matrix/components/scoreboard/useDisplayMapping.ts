import type { Game, Side } from "@/domain/match";
import {
  gameWinner,
  isGameFinished,
  matchSummary,
  gameFirstServer,
  currentServer,
} from "@/domain/match";

type Params = {
  leftName: string;
  rightName: string;
  games: Game[];
  gameIndex: number;
  swapped: boolean;
  winsNeeded: number;
  matchFirstServer: Side;
};

const flip = (side: Side | null): Side | null => (side === "L" ? "R" : side === "R" ? "L" : null);

const isGamePoint = (score: number, opponent: number) => {
  const nextScore = score + 1;
  return nextScore >= 11 && nextScore - opponent >= 2;
};

export const useDisplayMapping = ({
  leftName,
  rightName,
  games,
  gameIndex,
  swapped,
  winsNeeded,
  matchFirstServer,
}: Params) => {
  const current = games[gameIndex];
  const summary = matchSummary(games, winsNeeded);
  const rawWinner = current ? gameWinner(current) : null;
  const rawMatchWinner = summary.winner;

  const rawServer: Side | null = current
    ? currentServer(current, gameFirstServer(matchFirstServer, gameIndex))
    : null;

  const gameOpen = current ? !isGameFinished(current) && !rawMatchWinner : false;
  const leftMatchPoint =
    gameOpen && current ? isGamePoint(current.leftScore, current.rightScore) : false;
  const rightMatchPoint =
    gameOpen && current ? isGamePoint(current.rightScore, current.leftScore) : false;

  return {
    current,
    rawWinner,
    rawMatchWinner,
    winner: swapped ? flip(rawWinner) : rawWinner,
    matchWinner: swapped ? flip(rawMatchWinner) : rawMatchWinner,
    leftName: swapped ? rightName : leftName,
    rightName: swapped ? leftName : rightName,
    leftScore: swapped ? (current?.rightScore ?? 0) : (current?.leftScore ?? 0),
    rightScore: swapped ? (current?.leftScore ?? 0) : (current?.rightScore ?? 0),
    leftWins: swapped ? summary.rightWins : summary.leftWins,
    rightWins: swapped ? summary.leftWins : summary.rightWins,
    server: swapped ? flip(rawServer) : rawServer,
    leftMatchPoint: swapped ? rightMatchPoint : leftMatchPoint,
    rightMatchPoint: swapped ? leftMatchPoint : rightMatchPoint,
    currentFinished: current ? isGameFinished(current) : false,
  };
};
