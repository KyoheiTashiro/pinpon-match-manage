import type { Side } from "@/domain/match";

export type SideView = {
  name: string;
  score: number;
  isGameWinner: boolean;
  isMatchWinner: boolean;
  isMatchPoint: boolean;
  isServing: boolean;
  /** 加点も取り消しもできない（「入力不可」表示） */
  disabled: boolean;
  disableAdd: boolean;
  disableSub: boolean;
  onAdd: () => void;
  onSub: () => void;
};

export type MatchSummary = {
  leftWins: number;
  rightWins: number;
  matchWinner: Side | null;
  swapped: boolean;
};

export type ScoreInputProps = MatchSummary & {
  left: SideView;
  right: SideView;
  locked: boolean;
  onSwap: () => void;
};
