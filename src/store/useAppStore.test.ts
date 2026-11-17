/**
 * useAppStore.test.ts
 * migratePersistedState のユニットテスト。
 * salvageAppState は merge.test.ts でカバー済のため重複させない。
 */

import { FONT_SIZE, FORMAT, MATCHES_VIEW, type AppState } from "@/store/types";
import { describe, expect, it } from "vitest";

import { migratePersistedState } from "./useAppStore";

/**
 * migratePersistedState は unknown を返すため、テストで構造化アクセスする際に
 * AppState として安全に絞り込むためのヘルパー。
 * オブジェクトであることを実行時に検証してから型述語で絞り込む。
 */
const isAppState = (value: unknown): value is AppState =>
  value !== null && typeof value === "object";

const asAppState = (value: unknown): AppState => {
  if (!isAppState(value)) {
    throw new Error("expected migrated state to be an object");
  }
  return value;
};

// ---------------------------------------------------------------------------
// v1 → v2 マイグレーション: bestOf フィールドの補完
// ---------------------------------------------------------------------------

describe("migratePersistedState: v1 → v2 (bestOf 補完)", () => {
  const v1Tournament = {
    id: "t1",
    name: "春季大会",
    format: FORMAT.SINGLES,
    date: "2026-01-01",
    createdAt: "2026-01-01T00:00:00.000Z",
    participantIds: [],
    // bestOf が存在しない (v1 のデータ)
  };

  it("fromVersion=1: bestOf が未定義の tournament に bestOf:5 を補完する", () => {
    const persisted = {
      tournaments: { t1: { ...v1Tournament } },
      participants: {},
      matches: {},
      fontSize: FONT_SIZE.NORMAL,
      matchesView: MATCHES_VIEW.MATRIX,
    };

    const result = asAppState(migratePersistedState(persisted, 1));

    expect(result.tournaments.t1.bestOf).toBe(5);
  });

  it("fromVersion=1: bestOf が既に存在する tournament はそのまま保持される", () => {
    const tournamentWithBestOf = { ...v1Tournament, bestOf: 3 };
    const persisted = {
      tournaments: { t1: tournamentWithBestOf },
      participants: {},
      matches: {},
      fontSize: FONT_SIZE.NORMAL,
      matchesView: MATCHES_VIEW.MATRIX,
    };

    const result = asAppState(migratePersistedState(persisted, 1));

    expect(result.tournaments.t1.bestOf).toBe(3);
  });

  it("fromVersion=1: 複数の tournament がある場合、それぞれ補完される", () => {
    const persisted = {
      tournaments: {
        t1: { ...v1Tournament, id: "t1" },
        t2: { ...v1Tournament, id: "t2", name: "秋季大会" },
        t3: { ...v1Tournament, id: "t3", name: "冬季大会", bestOf: 7 },
      },
      participants: {},
      matches: {},
      fontSize: FONT_SIZE.NORMAL,
      matchesView: MATCHES_VIEW.MATRIX,
    };

    const result = asAppState(migratePersistedState(persisted, 1));

    // bestOf なし → 5 に補完
    expect(result.tournaments.t1.bestOf).toBe(5);
    expect(result.tournaments.t2.bestOf).toBe(5);
    // bestOf あり → そのまま
    expect(result.tournaments.t3.bestOf).toBe(7);
  });

  it("fromVersion=1: tournament 以外のフィールドはそのまま保持される", () => {
    const persisted = {
      tournaments: { t1: { ...v1Tournament } },
      participants: { p1: { id: "p1", tournamentId: "t1", name: "選手A" } },
      matches: {},
      currentTournamentId: "t1",
      fontSize: FONT_SIZE.LARGE,
      matchesView: MATCHES_VIEW.MATRIX,
    };

    const result = asAppState(migratePersistedState(persisted, 1));

    expect(result.participants.p1).toBeDefined();
    expect(result.fontSize).toBe(FONT_SIZE.LARGE);
  });
});

// ---------------------------------------------------------------------------
// fromVersion >= 2: 変換不要
// ---------------------------------------------------------------------------

describe("migratePersistedState: fromVersion=2 (変換不要)", () => {
  const v2Tournament = {
    id: "t1",
    name: "春季大会",
    format: FORMAT.SINGLES,
    bestOf: 5,
    date: "2026-01-01",
    createdAt: "2026-01-01T00:00:00.000Z",
    participantIds: [],
  };

  it("fromVersion=2: tournament の bestOf はそのまま保持される", () => {
    const persisted = {
      tournaments: { t1: { ...v2Tournament, bestOf: 3 } },
      participants: {},
      matches: {},
      fontSize: FONT_SIZE.NORMAL,
      matchesView: MATCHES_VIEW.MATRIX,
    };

    const result = asAppState(migratePersistedState(persisted, 2));

    expect(result.tournaments.t1.bestOf).toBe(3);
  });

  it("fromVersion=2: bestOf の補完は行われない", () => {
    const persisted = {
      tournaments: { t1: v2Tournament },
      participants: {},
      matches: {},
      fontSize: FONT_SIZE.NORMAL,
      matchesView: MATCHES_VIEW.MATRIX,
    };

    const result = migratePersistedState(persisted, 2);

    expect(result).toEqual({ ...persisted, defaultBestOf: 3, keepScreenOn: true });
  });
});

// ---------------------------------------------------------------------------
// v2 → v3 マイグレーション: matchesView フィールドの補完
// ---------------------------------------------------------------------------

describe("migratePersistedState: v2 → v3 (matchesView 補完)", () => {
  it("fromVersion=2: matchesView が未定義なら MATRIX に補完される", () => {
    const persisted = {
      tournaments: {},
      participants: {},
      matches: {},
      fontSize: FONT_SIZE.NORMAL,
      // matchesView が存在しない (v2 のデータ)
    };

    const result = asAppState(migratePersistedState(persisted, 2));

    expect(result.matchesView).toBe(MATCHES_VIEW.MATRIX);
  });

  it('fromVersion=2: matchesView が既に "list" ならそのまま保持される', () => {
    const persisted = {
      tournaments: {},
      participants: {},
      matches: {},
      fontSize: FONT_SIZE.NORMAL,
      matchesView: MATCHES_VIEW.LIST,
    };

    const result = asAppState(migratePersistedState(persisted, 2));

    expect(result.matchesView).toBe(MATCHES_VIEW.LIST);
  });

  it("fromVersion=1: v1→v2→v3 の連鎖適用でも matchesView が付与される", () => {
    const persisted = {
      tournaments: {
        t1: {
          id: "t1",
          name: "春季大会",
          format: FORMAT.SINGLES,
          date: "2026-01-01",
          createdAt: "2026-01-01T00:00:00.000Z",
          participantIds: [],
          // bestOf が存在しない (v1 のデータ)
        },
      },
      participants: {},
      matches: {},
      fontSize: FONT_SIZE.NORMAL,
      // matchesView が存在しない (v1 のデータ)
    };

    const result = asAppState(migratePersistedState(persisted, 1));

    expect(result.tournaments.t1.bestOf).toBe(5);
    expect(result.matchesView).toBe(MATCHES_VIEW.MATRIX);
  });
});

// ---------------------------------------------------------------------------
// v3 → v4 マイグレーション: defaultBestOf フィールドの補完
// ---------------------------------------------------------------------------

describe("migratePersistedState: v3 → v4 (defaultBestOf 補完)", () => {
  it("fromVersion=3: defaultBestOf が未定義なら 3 に補完される", () => {
    const persisted = {
      tournaments: {},
      participants: {},
      matches: {},
      fontSize: FONT_SIZE.NORMAL,
      matchesView: MATCHES_VIEW.MATRIX,
      // defaultBestOf が存在しない (v3 のデータ)
    };

    const result = asAppState(migratePersistedState(persisted, 3));

    expect(result.defaultBestOf).toBe(3);
  });

  it("fromVersion=3: defaultBestOf が既にあればそのまま保持される", () => {
    const persisted = {
      tournaments: {},
      participants: {},
      matches: {},
      fontSize: FONT_SIZE.NORMAL,
      matchesView: MATCHES_VIEW.MATRIX,
      defaultBestOf: 7,
    };

    const result = asAppState(migratePersistedState(persisted, 3));

    expect(result.defaultBestOf).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// v4 → v5 マイグレーション: keepScreenOn フィールドの補完
// ---------------------------------------------------------------------------

describe("migratePersistedState: v4 → v5 (keepScreenOn 補完)", () => {
  const v4 = {
    tournaments: {},
    participants: {},
    matches: {},
    fontSize: FONT_SIZE.NORMAL,
    matchesView: MATCHES_VIEW.MATRIX,
    defaultBestOf: 3,
  };

  it("fromVersion=4: keepScreenOn が未定義なら true に補完される", () => {
    expect(asAppState(migratePersistedState(v4, 4)).keepScreenOn).toBe(true);
  });

  it("fromVersion=4: keepScreenOn が既にあればそのまま保持される", () => {
    const result = asAppState(migratePersistedState({ ...v4, keepScreenOn: false }, 4));
    expect(result.keepScreenOn).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// v5 → v6 マイグレーション: Game / Match のユニオン化・currentTournamentId 廃止
// ---------------------------------------------------------------------------

const v5Match = (overrides: Record<string, unknown>) => ({
  id: "m1",
  tournamentId: "t1",
  leftSide: { kind: "single", participantId: "p1" },
  rightSide: { kind: "single", participantId: "p2" },
  games: [],
  firstServer: "L",
  ...overrides,
});
const migrateV5 = (matches: Record<string, unknown>) =>
  asAppState(migratePersistedState({ matches, currentTournamentId: "t1" }, 5));

describe("migratePersistedState: v5 → v6 (Game/Match ユニオン化)", () => {
  it("シングルスの leftSide/rightSide を kind/left/right へ変換する", () => {
    expect(migrateV5({ m1: v5Match({}) }).matches.m1).toEqual({
      id: "m1",
      tournamentId: "t1",
      kind: FORMAT.SINGLES,
      left: "p1",
      right: "p2",
      games: [],
      firstServer: "L",
    });
  });

  it("ダブルスの memberIds をタプルへ変換する", () => {
    const match = migrateV5({
      m1: v5Match({
        leftSide: { kind: "pair", memberIds: ["p1", "p2"] },
        rightSide: { kind: "pair", memberIds: ["p3", "p4"] },
      }),
    }).matches.m1;
    expect(match).toMatchObject({ kind: FORMAT.DOUBLES, left: ["p1", "p2"], right: ["p3", "p4"] });
  });

  it("履歴がスコアと一致するゲームは logged、食い違う・履歴なしのゲームは manual になる", () => {
    const match = migrateV5({
      m1: v5Match({
        games: [
          { leftScore: 2, rightScore: 1, pointLog: ["L", "R", "L"] },
          { leftScore: 11, rightScore: 5, pointLog: ["L"] },
          { leftScore: 11, rightScore: 9 },
          { leftScore: 0, rightScore: 0 },
        ],
      }),
    }).matches.m1;
    expect(match.games).toEqual([
      { kind: "logged", pointLog: ["L", "R", "L"] },
      { kind: "manual", leftScore: 11, rightScore: 5 },
      { kind: "manual", leftScore: 11, rightScore: 9 },
      { kind: "logged", pointLog: [] },
    ]);
  });

  it("片側だけペアの試合・壊れた試合は変換せず残す（後段の検証で落ちる）", () => {
    const mixed = v5Match({ rightSide: { kind: "pair", memberIds: ["p2", "p3"] } });
    const broken = { id: "m2", leftSide: "x" };
    const result = migrateV5({ m1: mixed, m2: broken, m3: null });
    expect(result.matches).toEqual({ m1: mixed, m2: broken, m3: null });
  });

  it("変換済み（kind あり）の試合・ゲームには触らない", () => {
    const migrated = {
      id: "m1",
      tournamentId: "t1",
      kind: FORMAT.SINGLES,
      left: "p1",
      right: "p2",
      games: [{ kind: "logged", pointLog: ["L"] }],
      firstServer: "L",
    };
    expect(migrateV5({ m1: migrated }).matches.m1).toEqual(migrated);
    const legacyWithNewGame = v5Match({ games: [{ kind: "logged", pointLog: ["L"] }, "x"] });
    expect(migrateV5({ m1: legacyWithNewGame }).matches.m1.games).toEqual([
      { kind: "logged", pointLog: ["L"] },
      "x",
    ]);
  });

  it("currentTournamentId を捨てる。matches が無くても落ちない", () => {
    expect(migrateV5({})).not.toHaveProperty("currentTournamentId");
    const result = migratePersistedState({ currentTournamentId: "t1", fontSize: "normal" }, 5);
    expect(result).toEqual({ fontSize: "normal" });
  });
});

// ---------------------------------------------------------------------------
// 不正入力・境界ケース
// ---------------------------------------------------------------------------

describe("migratePersistedState: 不正入力・境界ケース", () => {
  it("fromVersion=1: persisted が null のとき null がそのまま返る", () => {
    const result = migratePersistedState(null, 1);
    // null は object チェックで弾かれてそのまま返る
    expect(result).toBeNull();
  });

  it("fromVersion=1: persisted が文字列のとき、そのまま返る", () => {
    const result = migratePersistedState("not-an-object", 1);
    expect(result).toBe("not-an-object");
  });

  it("fromVersion=1: persisted が配列のとき、そのまま返る", () => {
    const arr = [1, 2, 3];
    const result = migratePersistedState(arr, 1);
    // 配列は typeof "object" だが tournaments フィールドがないので変換されない
    expect(result).toEqual(arr);
  });

  it("fromVersion=1: tournaments フィールドが undefined の場合は bestOf 変換をスキップする", () => {
    const persisted = {
      participants: {},
      matches: {},
      fontSize: FONT_SIZE.NORMAL,
      matchesView: MATCHES_VIEW.MATRIX,
      // tournaments なし
    };

    const result = migratePersistedState(persisted, 1);

    expect(result).toEqual({ ...persisted, defaultBestOf: 3, keepScreenOn: true });
  });

  it("fromVersion=1: tournaments が空オブジェクトのとき、そのまま返る", () => {
    const persisted = {
      tournaments: {},
      participants: {},
      matches: {},
      fontSize: FONT_SIZE.NORMAL,
      matchesView: MATCHES_VIEW.MATRIX,
    };

    const result = asAppState(migratePersistedState(persisted, 1));

    expect(result.tournaments).toEqual({});
  });

  it("fromVersion=0: v1 より前のバージョンにも bestOf 補完が適用される", () => {
    const persisted = {
      tournaments: {
        t1: {
          id: "t1",
          name: "春季大会",
          format: FORMAT.SINGLES,
          date: "2026-01-01",
          createdAt: "2026-01-01T00:00:00.000Z",
          participantIds: [],
        },
      },
      participants: {},
      matches: {},
      fontSize: FONT_SIZE.NORMAL,
      matchesView: MATCHES_VIEW.MATRIX,
    };

    const result = asAppState(migratePersistedState(persisted, 0));

    expect(result.tournaments.t1.bestOf).toBe(5);
  });
});
