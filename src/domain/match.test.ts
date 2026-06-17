import type { Side } from "@/domain/match";
import {
  isGameFinished,
  gameWinner,
  matchSummary,
  scoresFromLog,
  addPointToGame,
  undoLastPoint,
  lastScorer,
} from "@/domain/match";
import { describe, it, expect } from "vitest";

describe("isGameFinished", () => {
  it("11-9 は終了", () => {
    expect(isGameFinished({ leftScore: 11, rightScore: 9 })).toBe(true);
  });
  it("11-10 は未終了", () => {
    expect(isGameFinished({ leftScore: 11, rightScore: 10 })).toBe(false);
  });
  it("12-10 は終了（デュース2点差）", () => {
    expect(isGameFinished({ leftScore: 12, rightScore: 10 })).toBe(true);
  });
  it("15-13 は終了", () => {
    expect(isGameFinished({ leftScore: 15, rightScore: 13 })).toBe(true);
  });
  it("5-3 は未終了", () => {
    expect(isGameFinished({ leftScore: 5, rightScore: 3 })).toBe(false);
  });
});

describe("gameWinner", () => {
  it("左の勝ち", () => {
    expect(gameWinner({ leftScore: 11, rightScore: 7 })).toBe("L");
  });
  it("右の勝ち", () => {
    expect(gameWinner({ leftScore: 9, rightScore: 11 })).toBe("R");
  });
  it("未終了なら null", () => {
    expect(gameWinner({ leftScore: 10, rightScore: 10 })).toBeNull();
  });
});

describe("matchSummary", () => {
  it("3-0 で終了", () => {
    const summary = matchSummary([
      { leftScore: 11, rightScore: 5 },
      { leftScore: 11, rightScore: 8 },
      { leftScore: 11, rightScore: 9 },
    ]);
    expect(summary.finished).toBe(true);
    expect(summary.winner).toBe("L");
    expect(summary.leftWins).toBe(3);
  });
  it("3-2 で終了", () => {
    const summary = matchSummary([
      { leftScore: 11, rightScore: 9 },
      { leftScore: 8, rightScore: 11 },
      { leftScore: 11, rightScore: 7 },
      { leftScore: 6, rightScore: 11 },
      { leftScore: 11, rightScore: 9 },
    ]);
    expect(summary.winner).toBe("L");
    expect(summary.leftWins).toBe(3);
    expect(summary.rightWins).toBe(2);
  });
  it("2-2 は進行中", () => {
    const summary = matchSummary([
      { leftScore: 11, rightScore: 9 },
      { leftScore: 8, rightScore: 11 },
      { leftScore: 11, rightScore: 7 },
      { leftScore: 6, rightScore: 11 },
    ]);
    expect(summary.finished).toBe(false);
    expect(summary.winner).toBeNull();
  });
});

describe("scoresFromLog", () => {
  it("空ログは 0-0", () => {
    expect(scoresFromLog([])).toEqual({ leftScore: 0, rightScore: 0 });
  });
  it("L と R を正しく数える", () => {
    expect(scoresFromLog(["L", "R", "L", "L", "R"])).toEqual({
      leftScore: 3,
      rightScore: 2,
    });
  });
});

describe("addPointToGame", () => {
  it("pointLog に追加しスコア再計算", () => {
    const game = { leftScore: 1, rightScore: 0, pointLog: ["L" as const] };
    const result = addPointToGame(game, "R");
    expect(result.pointLog).toEqual(["L", "R"]);
    expect(result.leftScore).toBe(1);
    expect(result.rightScore).toBe(1);
  });
  it("pointLog 未定義なら空ログから開始", () => {
    const game = { leftScore: 0, rightScore: 0 };
    const result = addPointToGame(game, "L");
    expect(result.pointLog).toEqual(["L"]);
    expect(result.leftScore).toBe(1);
    expect(result.rightScore).toBe(0);
  });
});

describe("undoLastPoint", () => {
  it("末尾を削除し再計算", () => {
    const game = { leftScore: 2, rightScore: 1, pointLog: ["L", "R", "L"] as Side[] };
    const result = undoLastPoint(game);
    expect(result.pointLog).toEqual(["L", "R"]);
    expect(result.leftScore).toBe(1);
    expect(result.rightScore).toBe(1);
  });
  it("pointLog が空なら変化なし", () => {
    const game = { leftScore: 0, rightScore: 0, pointLog: [] as Side[] };
    expect(undoLastPoint(game)).toBe(game);
  });
  it("pointLog が未定義なら変化なし", () => {
    const game = { leftScore: 0, rightScore: 0 };
    expect(undoLastPoint(game)).toBe(game);
  });
});

describe("lastScorer", () => {
  it("pointLog の末尾要素を返す", () => {
    const game = { leftScore: 2, rightScore: 1, pointLog: ["L", "R", "L"] as Side[] };
    expect(lastScorer(game)).toBe("L");
  });
  it("pointLog が空なら null", () => {
    expect(lastScorer({ leftScore: 0, rightScore: 0, pointLog: [] })).toBeNull();
  });
  it("pointLog が未定義なら null", () => {
    expect(lastScorer({ leftScore: 0, rightScore: 0 })).toBeNull();
  });
});
