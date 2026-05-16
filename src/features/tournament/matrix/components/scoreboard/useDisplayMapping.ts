import type { Game, Side } from '../../../../../domain/match';
import {
  gameWinner,
  isGameFinished,
  matchSummary,
  gameFirstServer,
  currentServer,
} from '../../../../../domain/match';

type Params = {
  leftName: string;
  rightName: string;
  games: Game[];
  idx: number;
  swapped: boolean;
  matchFirstServer?: Side;
};

const flip = (s: Side | null): Side | null => (s === 'L' ? 'R' : s === 'R' ? 'L' : null);

const isGamePoint = (s: number, o: number) => {
  const ns = s + 1;
  return ns >= 11 && ns - o >= 2;
};

export const useDisplayMapping = ({
  leftName,
  rightName,
  games,
  idx,
  swapped,
  matchFirstServer,
}: Params) => {
  const current = games[idx];
  const sm = matchSummary(games);
  const rawWinner = current ? gameWinner(current) : null;
  const rawMatchWinner = sm.winner;

  const rawServer: Side | null =
    matchFirstServer && current
      ? currentServer(current, gameFirstServer(matchFirstServer, idx))
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
    leftWins: swapped ? sm.rightWins : sm.leftWins,
    rightWins: swapped ? sm.leftWins : sm.rightWins,
    server: swapped ? flip(rawServer) : rawServer,
    leftMatchPoint: swapped ? rightMatchPoint : leftMatchPoint,
    rightMatchPoint: swapped ? leftMatchPoint : rightMatchPoint,
    currentFinished: current ? isGameFinished(current) : false,
  };
};
