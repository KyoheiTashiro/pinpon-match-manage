import { sideMembers, sideName } from "@/domain/side";
import { SIDE_KIND, type MatchSide, type Participant } from "@/store/types";
import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// テスト用ヘルパー
// ---------------------------------------------------------------------------

const participants: Record<string, Participant> = {
  p1: { id: "p1", tournamentId: "t1", name: "田中" },
  p2: { id: "p2", tournamentId: "t1", name: "鈴木" },
};

const singleSide: MatchSide = { kind: SIDE_KIND.SINGLE, participantId: "p1" };
const pairSide: MatchSide = { kind: SIDE_KIND.PAIR, memberIds: ["p1", "p2"] };
const unknownSingleSide: MatchSide = { kind: SIDE_KIND.SINGLE, participantId: "unknown" };
const unknownPairSide: MatchSide = { kind: SIDE_KIND.PAIR, memberIds: ["p1", "unknown"] };

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
    const side: MatchSide = { kind: SIDE_KIND.PAIR, memberIds: ["p1", "p2"] };
    const result = sideMembers(side);
    expect(result).not.toBe((side as { memberIds: string[] }).memberIds);
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
    const bothUnknown: MatchSide = { kind: SIDE_KIND.PAIR, memberIds: ["x", "y"] };
    expect(sideName(bothUnknown, participants)).toBe("? / ?");
  });

  it("participants が空オブジェクトなら '?' を返す", () => {
    expect(sideName(singleSide, {})).toBe("?");
  });
});
