import { computeRanking } from "@/domain/ranking";
import type { Match } from "@/store/types";
import { describe, it, expect } from "vitest";

const make = (
  id: string,
  leftId: string,
  rightId: string,
  games: { leftScore: number; rightScore: number }[],
): Match => ({
  id,
  tournamentId: "t",
  leftSide: { kind: "single", participantId: leftId },
  rightSide: { kind: "single", participantId: rightId },
  games,
  firstServer: "L",
});

describe("computeRanking", () => {
  it("勝数→ゲーム差→得失点差の順で並ぶ", () => {
    const matches: Match[] = [
      make("1", "A", "B", [
        { leftScore: 11, rightScore: 5 },
        { leftScore: 11, rightScore: 6 },
        { leftScore: 11, rightScore: 7 },
      ]),
      make("2", "A", "C", [
        { leftScore: 11, rightScore: 9 },
        { leftScore: 11, rightScore: 9 },
        { leftScore: 11, rightScore: 9 },
      ]),
      make("3", "B", "C", [
        { leftScore: 11, rightScore: 9 },
        { leftScore: 11, rightScore: 9 },
        { leftScore: 11, rightScore: 9 },
      ]),
    ];
    const rows = computeRanking(matches, { A: "A", B: "B", C: "C" });
    expect(rows[0].name).toBe("A");
    expect(rows[0].wins).toBe(2);
    expect(rows[0].rank).toBe(1);
    expect(rows[1].name).toBe("B");
    expect(rows[2].name).toBe("C");
    expect(rows[2].wins).toBe(0);
  });

  it("未完了 match は無視", () => {
    const matches: Match[] = [make("1", "A", "B", [{ leftScore: 11, rightScore: 9 }])];
    const rows = computeRanking(matches, { A: "A", B: "B" });
    expect(rows.every((row) => row.wins === 0)).toBe(true);
    expect(rows.every((row) => row.losses === 0)).toBe(true);
  });

  it("試合なし参加者も一覧に出す", () => {
    const rows = computeRanking([], { A: "A", B: "B" });
    expect(rows).toHaveLength(2);
  });
});

describe("computeRanking — タイブレーク・同順位", () => {
  // 勝数が同じ → gameDiff で分岐(line 90)
  it("勝数同数 → gameDiff 大きい方が上位", () => {
    // A: 1勝 3-1(gameDiff=+2), B: 1勝 3-2(gameDiff=+1)
    const matches: Match[] = [
      make("1", "A", "C", [
        { leftScore: 11, rightScore: 5 },
        { leftScore: 11, rightScore: 5 },
        { leftScore: 5, rightScore: 11 },
        { leftScore: 11, rightScore: 5 },
      ]),
      make("2", "B", "D", [
        { leftScore: 11, rightScore: 9 },
        { leftScore: 9, rightScore: 11 },
        { leftScore: 11, rightScore: 9 },
        { leftScore: 9, rightScore: 11 },
        { leftScore: 11, rightScore: 9 },
      ]),
    ];
    const rows = computeRanking(matches, { A: "A", B: "B", C: "C", D: "D" });
    const a = rows.find((r) => r.name === "A")!;
    const b = rows.find((r) => r.name === "B")!;
    expect(a.wins).toBe(b.wins);
    expect(a.gameDiff).toBeGreaterThan(b.gameDiff);
    expect(rows.indexOf(a)).toBeLessThan(rows.indexOf(b));
  });

  // 勝数・gameDiff が同じ → pointDiff で分岐(line 91)
  it("勝数・gameDiff 同数 → pointDiff 大きい方が上位", () => {
    // A: 1勝 3-0, 合計点差+10, B: 1勝 3-0, 合計点差+3
    const matches: Match[] = [
      make("1", "A", "C", [
        { leftScore: 11, rightScore: 5 },
        { leftScore: 11, rightScore: 4 },
        { leftScore: 11, rightScore: 3 },
      ]),
      make("2", "B", "D", [
        { leftScore: 11, rightScore: 9 },
        { leftScore: 11, rightScore: 9 },
        { leftScore: 11, rightScore: 9 },
      ]),
    ];
    const rows = computeRanking(matches, { A: "A", B: "B", C: "C", D: "D" });
    const a = rows.find((r) => r.name === "A")!;
    const b = rows.find((r) => r.name === "B")!;
    expect(a.wins).toBe(b.wins);
    expect(a.gameDiff).toBe(b.gameDiff);
    expect(a.pointDiff).toBeGreaterThan(b.pointDiff);
    expect(rows.indexOf(a)).toBeLessThan(rows.indexOf(b));
  });

  // 全指標が同じ → name の localeCompare(line 92)
  it("勝数・gameDiff・pointDiff が完全同数 → 名前順(五十音)", () => {
    // 全指標同値になるよう対戦なしの2人にする(どちらも wins=0, diff=0)
    const rows = computeRanking([], { A: "あ", B: "い" });
    expect(rows[0].name).toBe("あ");
    expect(rows[1].name).toBe("い");
  });

  // 同順位(1,2,2,4 形式)のチェック(line 101-105)
  it("同順位は同じ rank になり次の順位が飛ぶ", () => {
    // B と C が同勝数・同gameDiff・同pointDiff → 同 rank 2
    const matches: Match[] = [
      make("1", "A", "B", [
        { leftScore: 11, rightScore: 5 },
        { leftScore: 11, rightScore: 5 },
        { leftScore: 11, rightScore: 5 },
      ]),
      make("2", "A", "C", [
        { leftScore: 11, rightScore: 5 },
        { leftScore: 11, rightScore: 5 },
        { leftScore: 11, rightScore: 5 },
      ]),
    ];
    const rows = computeRanking(matches, { A: "A", B: "B", C: "C" });
    const a = rows.find((r) => r.name === "A")!;
    const b = rows.find((r) => r.name === "B")!;
    const c = rows.find((r) => r.name === "C")!;
    expect(a.rank).toBe(1);
    expect(b.rank).toBe(c.rank); // B と C が同 rank
    expect(b.rank).toBe(2);
  });

  // 右側プレイヤーが勝つケース(line 57: left 敗北, line 67: right 勝利)
  it("右側プレイヤーが勝った場合も正しく集計される", () => {
    const matches: Match[] = [
      make("1", "A", "B", [
        { leftScore: 5, rightScore: 11 },
        { leftScore: 5, rightScore: 11 },
        { leftScore: 5, rightScore: 11 },
      ]),
    ];
    const rows = computeRanking(matches, { A: "A", B: "B" });
    const a = rows.find((r) => r.name === "A")!;
    const b = rows.find((r) => r.name === "B")!;
    // B(右側)が勝つ → line 57(左側の losses++)と line 67(右側の wins++)が通る
    expect(b.wins).toBe(1);
    expect(b.losses).toBe(0);
    expect(a.wins).toBe(0);
    expect(a.losses).toBe(1);
    expect(b.rank).toBe(1);
    expect(a.rank).toBe(2);
  });

  // winsNeeded カスタム値(bestOf=3 → winsNeeded=2)
  it("winsNeeded=2 でも正しく集計される", () => {
    const matches: Match[] = [
      make("1", "A", "B", [
        { leftScore: 11, rightScore: 5 },
        { leftScore: 11, rightScore: 5 },
      ]),
    ];
    const rows = computeRanking(matches, { A: "A", B: "B" }, 2);
    const a = rows.find((r) => r.name === "A")!;
    const b = rows.find((r) => r.name === "B")!;
    expect(a.wins).toBe(1);
    expect(b.losses).toBe(1);
  });
});
