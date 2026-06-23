import type { Side } from "@/domain/match";

/** スコア列1つ分の表示・操作プロパティ（ScoreColumn にそのまま渡す）。 */
export type SideView = {
  name: string;
  score: number;
  isGameWinner: boolean;
  isMatchWinner: boolean;
  isMatchPoint: boolean;
  isServing: boolean;
  disabled: boolean;
  disableAdd: boolean;
  canSub: boolean;
  onAdd: () => void;
  onSub: () => void;
};

/** 両ビュー共通の試合サマリー表示。 */
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
