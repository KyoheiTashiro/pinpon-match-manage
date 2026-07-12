import type { Side } from "@/domain/match";

export type SideView = {
  name: string;
  score: number;
  isGameWinner: boolean;
  isMatchWinner: boolean;
  isMatchPoint: boolean;
  isServing: boolean;
  disabled: boolean;
  disableAdd: boolean;
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
