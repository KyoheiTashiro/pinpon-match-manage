import { SIDE_KIND, type MatchSide, type Participant } from "@/store/types";

/** side に含まれる participantId を返す（single=1人, pair=2人）。 */
export const sideMembers = (side: MatchSide): string[] =>
  side.kind === SIDE_KIND.SINGLE ? [side.participantId] : [...side.memberIds];

/** side の表示名。"A" または "A / B"。未知IDは "?"。 */
export const sideName = (side: MatchSide, participants: Record<string, Participant>): string =>
  sideMembers(side)
    .map((id) => participants[id]?.name ?? "?")
    .join(" / ");
