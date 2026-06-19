/**
 * selectors.test.ts
 * selectors.ts の matchesOf を直接ユニットテストする。
 * merge.test.ts 経由の間接カバレッジではなく、各分岐を明示的に検証する。
 */

import { matchesOf } from "@/store/selectors";
import { type Match } from "@/store/types";
import { makeMatch } from "@/test/factories";
import { describe, expect, it } from "vitest";

// ---------------------------------------------------------------------------
// matchesOf
// ---------------------------------------------------------------------------

describe("matchesOf", () => {
  it("指定した tournamentId に属する match のみ返す", () => {
    const matches: Record<string, Match> = {
      m1: makeMatch({ id: "m1", tournamentId: "t1" }),
      m2: makeMatch({ id: "m2", tournamentId: "t2" }),
      m3: makeMatch({ id: "m3", tournamentId: "t1" }),
    };

    const result = matchesOf(matches, "t1");

    expect(result).toHaveLength(2);
    expect(result.map((m) => m.id)).toContain("m1");
    expect(result.map((m) => m.id)).toContain("m3");
    expect(result.map((m) => m.id)).not.toContain("m2");
  });

  it("一致する match が存在しない場合は空配列を返す", () => {
    const matches: Record<string, Match> = {
      m1: makeMatch({ id: "m1", tournamentId: "t1" }),
    };

    const result = matchesOf(matches, "non-existent");

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it("matches が空オブジェクトのとき空配列を返す", () => {
    const result = matchesOf({}, "t1");

    expect(result).toHaveLength(0);
  });

  it("指定 tournamentId の match が全件一致するとき全て返す", () => {
    const matches: Record<string, Match> = {
      m1: makeMatch({ id: "m1", tournamentId: "t1" }),
      m2: makeMatch({ id: "m2", tournamentId: "t1" }),
      m3: makeMatch({ id: "m3", tournamentId: "t1" }),
    };

    const result = matchesOf(matches, "t1");

    expect(result).toHaveLength(3);
  });

  it("一致するのが1件だけのとき、その1件を返す", () => {
    const matches: Record<string, Match> = {
      m1: makeMatch({ id: "m1", tournamentId: "t1" }),
      m2: makeMatch({ id: "m2", tournamentId: "t2" }),
    };

    const result = matchesOf(matches, "t2");

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("m2");
  });

  it("返り値は Match オブジェクトの配列であり、元データの参照を保持する", () => {
    const m1 = makeMatch({ id: "m1", tournamentId: "t1" });
    const matches: Record<string, Match> = { m1 };

    const result = matchesOf(matches, "t1");

    expect(result[0]).toBe(m1);
  });

  it("複数 tournament が混在する場合、それぞれ正しく分離できる", () => {
    const matches: Record<string, Match> = {
      m1: makeMatch({ id: "m1", tournamentId: "t1" }),
      m2: makeMatch({ id: "m2", tournamentId: "t2" }),
      m3: makeMatch({ id: "m3", tournamentId: "t1" }),
      m4: makeMatch({ id: "m4", tournamentId: "t3" }),
      m5: makeMatch({ id: "m5", tournamentId: "t2" }),
    };

    const t1Matches = matchesOf(matches, "t1");
    const t2Matches = matchesOf(matches, "t2");
    const t3Matches = matchesOf(matches, "t3");

    expect(t1Matches.map((m) => m.id).toSorted()).toEqual(["m1", "m3"]);
    expect(t2Matches.map((m) => m.id).toSorted()).toEqual(["m2", "m5"]);
    expect(t3Matches.map((m) => m.id).toSorted()).toEqual(["m4"]);
  });
});
