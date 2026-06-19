import type { Game, Side } from "@/domain/match";
import {
  FONT_SIZE,
  FORMAT,
  SIDE_KIND,
  type AppState,
  type Match,
  type Participant,
  type Tournament,
} from "@/store/types";

// ---------------------------------------------------------------------------
// テストデータ・ファクトリ
// overrides で必要なフィールドだけ上書きする。各 test の散在を防ぐ。
// ---------------------------------------------------------------------------

export const makeTournament = (overrides: Partial<Tournament> = {}): Tournament => ({
  id: "t1",
  name: "春季大会",
  format: FORMAT.SINGLES,
  bestOf: 5,
  date: "2026-01-01",
  createdAt: "2026-01-01T00:00:00.000Z",
  participantIds: [],
  ...overrides,
});

export const makeParticipant = (overrides: Partial<Participant> = {}): Participant => ({
  id: "p1",
  tournamentId: "t1",
  name: "選手A",
  ...overrides,
});

export const makeMatch = (overrides: Partial<Match> = {}): Match => ({
  id: "m1",
  tournamentId: "t1",
  leftSide: { kind: SIDE_KIND.SINGLE, participantId: "p1" },
  rightSide: { kind: SIDE_KIND.SINGLE, participantId: "p2" },
  games: [],
  firstServer: "L",
  ...overrides,
});

export const makeGame = (overrides: Partial<Game> = {}): Game => ({
  leftScore: 0,
  rightScore: 0,
  ...overrides,
});

/** point ログから Game を組む(進行ロジックのテスト用)。 */
export const gameFromLog = (log: Side[]): Game => ({
  leftScore: log.filter((s) => s === "L").length,
  rightScore: log.filter((s) => s === "R").length,
  pointLog: log,
});

export const makeAppState = (overrides: Partial<AppState> = {}): AppState => ({
  tournaments: {},
  participants: {},
  matches: {},
  currentTournamentId: null,
  fontSize: FONT_SIZE.NORMAL,
  ...overrides,
});
