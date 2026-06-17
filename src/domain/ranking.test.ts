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
