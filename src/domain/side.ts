import { SIDE_KIND, type MatchSide, type Participant } from "@/store/types";

export const sideMembers = (side: MatchSide): string[] =>
  side.kind === SIDE_KIND.SINGLE ? [side.participantId] : [...side.memberIds];

/** 2者の組み合わせを順序非依存で表す一意キー */
export const pairKey = (a: string, b: string): string => [a, b].toSorted().join("|");

export const sideName = (side: MatchSide, participants: Record<string, Participant>): string =>
  sideMembers(side)
    .map((id) => participants[id]?.name ?? "?")
    .join(" / ");
