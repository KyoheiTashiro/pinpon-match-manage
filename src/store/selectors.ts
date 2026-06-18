import type { Match } from "@/store/types";

/** tournament に属する match を挿入順で返す。Tournament.matchIds 廃止に伴う導出。 */
export const matchesOf = (matches: Record<string, Match>, tournamentId: string): Match[] =>
  Object.values(matches).filter((match) => match.tournamentId === tournamentId);
