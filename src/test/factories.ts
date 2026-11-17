import { GAME_KIND, type Game, type Score, type Side } from "@/domain/match";
import {
  FONT_SIZE,
  FORMAT,
  MATCHES_VIEW,
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

// ダブルスにするときは kind / left / right を揃えて上書きする（spread では判別を型で追えないため as）
export const makeMatch = (overrides: Partial<Match> = {}): Match => {
  const match = {
    id: "m1",
    tournamentId: "t1",
    kind: FORMAT.SINGLES,
    left: "p1",
    right: "p2",
    games: [],
    firstServer: "L",
    ...overrides,
  };
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return match as Match;
};

/** スコア直書き（履歴なし）の Game。 */
export const makeGame = (overrides: Partial<Score> = {}): Game => ({
  kind: GAME_KIND.MANUAL,
  leftScore: 0,
  rightScore: 0,
  ...overrides,
});

/** point ログから Game を組む(進行ロジックのテスト用)。 */
export const gameFromLog = (log: Side[]): Game => ({ kind: GAME_KIND.LOGGED, pointLog: log });

export const makeAppState = (overrides: Partial<AppState> = {}): AppState => ({
  tournaments: {},
  participants: {},
  matches: {},
  fontSize: FONT_SIZE.NORMAL,
  matchesView: MATCHES_VIEW.MATRIX,
  defaultBestOf: 3,
  keepScreenOn: true,
  ...overrides,
});
