/**
 * useAppStore.test.ts
 * migratePersistedState のユニットテスト。
 * salvageAppState は merge.test.ts でカバー済のため重複させない。
 */

import { FONT_SIZE, FORMAT, type AppState } from "@/store/types";
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
      currentTournamentId: null,
      fontSize: FONT_SIZE.NORMAL,
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
      currentTournamentId: null,
      fontSize: FONT_SIZE.NORMAL,
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
      currentTournamentId: null,
      fontSize: FONT_SIZE.NORMAL,
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
    };

    const result = asAppState(migratePersistedState(persisted, 1));

    expect(result.participants.p1).toBeDefined();
    expect(result.currentTournamentId).toBe("t1");
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
      currentTournamentId: null,
      fontSize: FONT_SIZE.NORMAL,
    };

    const result = asAppState(migratePersistedState(persisted, 2));

    expect(result.tournaments.t1.bestOf).toBe(3);
  });

  it("fromVersion=2: 入力オブジェクトがそのまま返る", () => {
    const persisted = {
      tournaments: { t1: v2Tournament },
      participants: {},
      matches: {},
      currentTournamentId: null,
      fontSize: FONT_SIZE.NORMAL,
    };

    const result = migratePersistedState(persisted, 2);

    expect(result).toEqual(persisted);
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

  it("fromVersion=1: tournaments フィールドが undefined の場合は変換をスキップする", () => {
    const persisted = {
      participants: {},
      matches: {},
      currentTournamentId: null,
      fontSize: FONT_SIZE.NORMAL,
      // tournaments なし
    };

    const result = migratePersistedState(persisted, 1);

    expect(result).toEqual(persisted);
  });

  it("fromVersion=1: tournaments が空オブジェクトのとき、そのまま返る", () => {
    const persisted = {
      tournaments: {},
      participants: {},
      matches: {},
      currentTournamentId: null,
      fontSize: FONT_SIZE.NORMAL,
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
      currentTournamentId: null,
      fontSize: FONT_SIZE.NORMAL,
    };

    const result = asAppState(migratePersistedState(persisted, 0));

    expect(result.tournaments.t1.bestOf).toBe(5);
  });
});
