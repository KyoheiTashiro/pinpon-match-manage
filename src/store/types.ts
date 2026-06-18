import type { Game, Side } from "@/domain/match";

export const FORMAT = { SINGLES: "singles", DOUBLES: "doubles" } as const;
export type Format = (typeof FORMAT)[keyof typeof FORMAT];

/** 選択可能なゲーム数(bestOf)。先取は (bestOf + 1) / 2。 */
export const BEST_OF_OPTIONS = [3, 5, 7] as const;
export type BestOf = (typeof BEST_OF_OPTIONS)[number];

export type Tournament = {
  id: string;
  name: string;
  format: Format;
  bestOf: BestOf;
  date: string;
  createdAt: string;
  participantIds: string[];
};

export type Participant = {
  id: string;
  tournamentId: string;
  name: string;
  affiliation?: string;
};

export const SIDE_KIND = { SINGLE: "single", PAIR: "pair" } as const;
export type SideKind = (typeof SIDE_KIND)[keyof typeof SIDE_KIND];

export type SingleSide = { kind: typeof SIDE_KIND.SINGLE; participantId: string };
export type PairSide = { kind: typeof SIDE_KIND.PAIR; memberIds: [string, string] };
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

export const FONT_SIZE = { NORMAL: "normal", LARGE: "large", XLARGE: "xlarge" } as const;
export type FontSize = (typeof FONT_SIZE)[keyof typeof FONT_SIZE];

export type AppState = {
  tournaments: Record<string, Tournament>;
  participants: Record<string, Participant>;
  matches: Record<string, Match>;
  currentTournamentId: string | null;
  fontSize: FontSize;
};
