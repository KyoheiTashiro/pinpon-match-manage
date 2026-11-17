import { pairKey, sideMembers, sideName } from "@/domain/side";
import type { Participant } from "@/store/types";
import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// テスト用ヘルパー
// ---------------------------------------------------------------------------

const participants: Record<string, Participant> = {
  p1: { id: "p1", tournamentId: "t1", name: "田中" },
  p2: { id: "p2", tournamentId: "t1", name: "鈴木" },
};

const singleSide = "p1";
const pairSide: [string, string] = ["p1", "p2"];
const unknownSingleSide = "unknown";
const unknownPairSide: [string, string] = ["p1", "unknown"];

// ---------------------------------------------------------------------------
// sideMembers
// ---------------------------------------------------------------------------

describe("sideMembers", () => {
  it("シングルは participantId を配列で返す", () => {
    expect(sideMembers(singleSide)).toEqual(["p1"]);
  });

  it("ペアは memberIds を配列で返す", () => {
    expect(sideMembers(pairSide)).toEqual(["p1", "p2"]);
  });

  it("シングルの結果は要素数1", () => {
    expect(sideMembers(singleSide)).toHaveLength(1);
  });

  it("ペアの結果は要素数2", () => {
    expect(sideMembers(pairSide)).toHaveLength(2);
  });

  it("ペアの返り値は memberIds のコピー（参照が異なる）", () => {
    expect(sideMembers(pairSide)).not.toBe(pairSide);
  });
});

// ---------------------------------------------------------------------------
// pairKey
// ---------------------------------------------------------------------------

describe("pairKey", () => {
  it("引数順を入れ替えても同一キー", () => {
    expect(pairKey("p1", "p2")).toBe(pairKey("p2", "p1"));
  });

  it("異なる組み合わせは別キー", () => {
    expect(pairKey("p1", "p2")).not.toBe(pairKey("p1", "p3"));
  });
});

// ---------------------------------------------------------------------------
// sideName
// ---------------------------------------------------------------------------

describe("sideName", () => {
  it("シングル: 参加者名を返す", () => {
    expect(sideName(singleSide, participants)).toBe("田中");
  });

  it("ペア: 'A / B' 形式で返す", () => {
    expect(sideName(pairSide, participants)).toBe("田中 / 鈴木");
  });

  it("シングル: 未知IDは '?' を返す", () => {
    expect(sideName(unknownSingleSide, participants)).toBe("?");
  });

  it("ペア: 片方が未知IDなら '田中 / ?'", () => {
    expect(sideName(unknownPairSide, participants)).toBe("田中 / ?");
  });

  it("ペア: 両方が未知IDなら '? / ?'", () => {
    const bothUnknown: [string, string] = ["x", "y"];
    expect(sideName(bothUnknown, participants)).toBe("? / ?");
  });

  it("participants が空オブジェクトなら '?' を返す", () => {
    expect(sideName(singleSide, {})).toBe("?");
  });
});
