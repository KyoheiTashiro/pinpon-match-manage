import type { BadgeTone } from "@/components/ui";

/** 1試合の表示上の状態。リスト表示・マトリクス表示で共有する */
export const MATCH_STATE = {
  UNPLAYED: "unplayed",
  IN_PROGRESS: "inProgress",
  WON: "won",
  LOST: "lost",
} as const;
export type MatchState = (typeof MATCH_STATE)[keyof typeof MATCH_STATE];

/**
 * 状態 → バッジの見た目・ラベルと行/セルの背景色。
 * リストは勝者を上段へ寄せるため LOST を使わない（マトリクスのみが使う）。
 */
export const STATE_BADGE: Record<
  MatchState,
  { tone: BadgeTone; label: string; backgroundClassName: string }
> = {
  [MATCH_STATE.UNPLAYED]: { tone: "primary", label: "対戦", backgroundClassName: "bg-white" },
  [MATCH_STATE.IN_PROGRESS]: {
    tone: "warning",
    label: "途中",
    backgroundClassName: "bg-warning/10",
  },
  [MATCH_STATE.WON]: { tone: "neutral", label: "終了", backgroundClassName: "bg-winBg" },
  [MATCH_STATE.LOST]: { tone: "neutral", label: "終了", backgroundClassName: "bg-loseBg" },
};
