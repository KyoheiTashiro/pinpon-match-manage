import type { Match, Participant } from "@/store/types";

type MatchSideIds = Match["left"];

export const sideMembers = (side: MatchSideIds): string[] =>
  typeof side === "string" ? [side] : [...side];

/** 2者の組み合わせを順序非依存で表す一意キー */
export const pairKey = (a: string, b: string): string => [a, b].toSorted().join("|");

export const sideName = (side: MatchSideIds, participants: Record<string, Participant>): string =>
  sideMembers(side)
    .map((id) => participants[id]?.name ?? "?")
    .join(" / ");
