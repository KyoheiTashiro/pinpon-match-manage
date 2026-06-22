import type { Match, Participant } from "@/store/types";

/** tournament に属する match を挿入順で返す。Tournament.matchIds 廃止に伴う導出。 */
export const matchesOf = (matches: Record<string, Match>, tournamentId: string): Match[] =>
  Object.values(matches).filter((match) => match.tournamentId === tournamentId);

/** 現大会(currentTournamentId)以外の参加者の名前を、trim・空文字除外・重複除去・名前順ソートして返す。 */
export const pastParticipantNamesOf = (
  participants: Record<string, Participant>,
  currentTournamentId: string,
): string[] => {
  const names = Object.values(participants)
    .filter((participant) => participant.tournamentId !== currentTournamentId)
    .map((participant) => participant.name.trim())
    .filter((name) => name.length > 0);
  return [...new Set(names)].toSorted((a, b) => a.localeCompare(b));
};
