import type { Game, Side } from "@/domain/match";

export type Format = "singles" | "doubles";

/** 1試合のゲーム数。先取は (bestOf + 1) / 2。 */
export type BestOf = 3 | 5 | 7;

export type Tournament = {
  id: string;
  name: string;
  format: Format;
  bestOf: BestOf;
  date: string;
  createdAt: string;
  participantIds: string[];
  matchIds: string[];
};

export type Participant = {
  id: string;
  tournamentId: string;
  name: string;
  affiliation?: string;
};

export type SingleSide = { kind: "single"; participantId: string };
export type PairSide = { kind: "pair"; memberIds: [string, string] };
export type MatchSide = SingleSide | PairSide;

export type Match = {
  id: string;
  tournamentId: string;
  leftSide: MatchSide;
  rightSide: MatchSide;
  games: Game[];
  note?: string;
  firstServer: Side;
};

export type FontSize = "normal" | "large" | "xlarge";

export type AppState = {
  tournaments: Record<string, Tournament>;
  participants: Record<string, Participant>;
  matches: Record<string, Match>;
  currentTournamentId: string | null;
  fontSize: FontSize;
};
