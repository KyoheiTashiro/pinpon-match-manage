import type { Match, Participant } from "@/store/types";

export const matchesOf = (matches: Record<string, Match>, tournamentId: string): Match[] =>
  Object.values(matches).filter((match) => match.tournamentId === tournamentId);

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
