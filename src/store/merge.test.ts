import { FONT_SIZE, FORMAT, SIDE_KIND, type AppState } from "@/store/types";
import { describe, expect, it } from "vitest";

import { salvageAppState } from "./useAppStore";

// ---------------------------------------------------------------------------
// テスト用ヘルパー
// ---------------------------------------------------------------------------

const emptyState: AppState = {
  tournaments: {},
  participants: {},
  matches: {},
  currentTournamentId: null,
  fontSize: FONT_SIZE.NORMAL,
};

const validTournament = {
  id: "t1",
  name: "春季大会",
  format: FORMAT.SINGLES,
  bestOf: 5,
  date: "2026-01-01",
  createdAt: "2026-01-01T00:00:00.000Z",
  participantIds: [],
};

const validParticipant = {
  id: "p1",
  tournamentId: "t1",
  name: "選手A",
};

const validMatch = {
  id: "m1",
  tournamentId: "t1",
  leftSide: { kind: SIDE_KIND.SINGLE, participantId: "p1" },
  rightSide: { kind: SIDE_KIND.SINGLE, participantId: "p2" },
  games: [],
  firstServer: "L" as const,
};

// ---------------------------------------------------------------------------
// (a) 有効な永続化データはそのまま通る
// ---------------------------------------------------------------------------

describe("salvageAppState: 有効な永続化データ", () => {
  it("全エンティティが有効なら全て保持される", () => {
    const persisted = {
      tournaments: { t1: validTournament },
      participants: { p1: validParticipant },
      matches: { m1: validMatch },
      currentTournamentId: "t1",
      fontSize: FONT_SIZE.LARGE,
    };

    const result = salvageAppState(persisted, emptyState);

    expect(result.tournaments.t1).toBeDefined();
    expect(result.participants.p1).toBeDefined();
    expect(result.matches.m1).toBeDefined();
    // currentTournamentId: t1 は tournaments に存在するので保持
    expect(result.currentTournamentId).toBe("t1");
    expect(result.fontSize).toBe(FONT_SIZE.LARGE);
  });
});

// ---------------------------------------------------------------------------
// (b) 壊れた match が1件混入 → 有効エンティティをサルベージ、壊れた1件を除去
// ---------------------------------------------------------------------------

describe("salvageAppState: 部分的に壊れた状態", () => {
  it("corrupt な match が1件あっても有効な match は保持される", () => {
    const corruptMatch = {
      id: "m_corrupt",
      // tournamentId が欠落 → matchSchema 失敗
      leftSide: { kind: SIDE_KIND.SINGLE, participantId: "p1" },
      rightSide: { kind: SIDE_KIND.SINGLE, participantId: "p2" },
      games: [],
      firstServer: "L",
    };

    const persisted = {
      tournaments: { t1: validTournament },
      participants: { p1: validParticipant },
      matches: {
        m1: validMatch,
        m_corrupt: corruptMatch,
      },
      currentTournamentId: "t1",
      fontSize: FONT_SIZE.NORMAL,
    };

    const result = salvageAppState(persisted, emptyState);

    // 有効な match は残る
    expect(result.matches.m1).toBeDefined();
    // 壊れた match は除去される
    expect(result.matches.m_corrupt).toBeUndefined();
  });

  it("corrupt な tournament が1件あっても有効な tournament は保持される", () => {
    const corruptTournament = {
      id: "t_corrupt",
      // name が欠落 → tournamentSchema 失敗
      format: FORMAT.SINGLES,
      bestOf: 5,
      date: "2026-01-01",
      createdAt: "2026-01-01T00:00:00.000Z",
      participantIds: [],
    };

    const persisted = {
      tournaments: {
        t1: validTournament,
        t_corrupt: corruptTournament,
      },
      participants: { p1: validParticipant },
      matches: { m1: validMatch },
      currentTournamentId: "t1",
      fontSize: FONT_SIZE.NORMAL,
    };

    const result = salvageAppState(persisted, emptyState);

    expect(result.tournaments.t1).toBeDefined();
    expect(result.tournaments.t_corrupt).toBeUndefined();
  });

  it("fontSize が無効な値なら current の fontSize にフォールバックする", () => {
    const persisted = {
      tournaments: { t1: validTournament },
      participants: {},
      matches: {},
      currentTournamentId: null,
      fontSize: "invalid-size",
    };

    const currentWithLarge: AppState = { ...emptyState, fontSize: FONT_SIZE.LARGE };
    const result = salvageAppState(persisted, currentWithLarge);

    expect(result.fontSize).toBe(FONT_SIZE.LARGE);
  });

  it("currentTournamentId が存在しない tournament を指していたら null になる", () => {
    const persisted = {
      tournaments: { t1: validTournament },
      participants: {},
      matches: {},
      currentTournamentId: "non-existent",
      fontSize: FONT_SIZE.NORMAL,
    };

    const result = salvageAppState(persisted, emptyState);

    expect(result.currentTournamentId).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// (c) non-object persisted → current にフォールバック
// ---------------------------------------------------------------------------

describe("salvageAppState: non-object 入力", () => {
  it("null が渡されたら current をそのまま返す", () => {
    const result = salvageAppState(null, emptyState);
    expect(result).toBe(emptyState);
  });

  it("文字列が渡されたら current をそのまま返す", () => {
    const result = salvageAppState("not-an-object", emptyState);
    expect(result).toBe(emptyState);
  });

  it("配列が渡されたら current をそのまま返す", () => {
    const result = salvageAppState([1, 2, 3], emptyState);
    expect(result).toBe(emptyState);
  });

  it("数値が渡されたら current をそのまま返す", () => {
    const result = salvageAppState(42, emptyState);
    expect(result).toBe(emptyState);
  });
});
