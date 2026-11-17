import type { Game, Side } from "@/domain/match";

export const FORMAT = { SINGLES: "singles", DOUBLES: "doubles" } as const;
export type Format = (typeof FORMAT)[keyof typeof FORMAT];

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

type MatchBase = {
  id: string;
  tournamentId: string;
  games: Game[];
  note?: string;
  firstServer: Side;
};

/** kind が左右両方の形を決める（片側だけペアの試合を表現不能にする）。大会の format と一致させる。 */
export type Match =
  | (MatchBase & { kind: typeof FORMAT.SINGLES; left: string; right: string })
  | (MatchBase & {
      kind: typeof FORMAT.DOUBLES;
      left: [string, string];
      right: [string, string];
    });

/** 試合の対戦者だけを取り出した形（試合作成の入力）。 */
export type MatchSides =
  | { kind: typeof FORMAT.SINGLES; left: string; right: string }
  | { kind: typeof FORMAT.DOUBLES; left: [string, string]; right: [string, string] };

export const FONT_SIZE = {
  XSMALL: "xsmall",
  SMALL: "small",
  NORMAL: "normal",
  LARGE: "large",
  XLARGE: "xlarge",
} as const;
export type FontSize = (typeof FONT_SIZE)[keyof typeof FONT_SIZE];

export const MATCHES_VIEW = { LIST: "list", MATRIX: "matrix" } as const;
export type MatchesView = (typeof MATCHES_VIEW)[keyof typeof MATCHES_VIEW];

export type AppState = {
  tournaments: Record<string, Tournament>;
  participants: Record<string, Participant>;
  matches: Record<string, Match>;
  fontSize: FontSize;
  matchesView: MatchesView;
  defaultBestOf: BestOf;
  keepScreenOn: boolean;
};
