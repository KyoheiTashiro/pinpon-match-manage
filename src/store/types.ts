import type { Game } from '../domain/match';

export type Format = 'singles' | 'doubles';

export type Tournament = {
  id: string;
  name: string;
  format: Format;
  date: string;
  createdAt: string;
  participantIds: string[];
  matchIds: string[];
};

export type Participant = {
  id: string;
  name: string;
  affiliation?: string;
};

export type SingleSide = { kind: 'single'; participantId: string };
export type PairSide = { kind: 'pair'; memberIds: [string, string] };
export type MatchSide = SingleSide | PairSide;

export type MatchStatus = 'scheduled' | 'in_progress' | 'finished';

export type Match = {
  id: string;
  tournamentId: string;
  leftSide: MatchSide;
  rightSide: MatchSide;
  refereeId?: string;
  scorerId?: string;
  startAt?: string;
  endAt?: string;
  games: Game[];
  note?: string;
  status: MatchStatus;
};

export type FontSize = 'normal' | 'large' | 'xlarge';

export type AppState = {
  tournaments: Record<string, Tournament>;
  participants: Record<string, Participant>;
  matches: Record<string, Match>;
  currentTournamentId: string | null;
  fontSize: FontSize;
};
