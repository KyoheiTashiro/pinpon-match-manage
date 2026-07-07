import { SIDE_KIND, type MatchSide, type Participant } from "@/store/types";

export const sideMembers = (side: MatchSide): string[] =>
  side.kind === SIDE_KIND.SINGLE ? [side.participantId] : [...side.memberIds];

export const sideName = (side: MatchSide, participants: Record<string, Participant>): string =>
  sideMembers(side)
    .map((id) => participants[id]?.name ?? "?")
    .join(" / ");
