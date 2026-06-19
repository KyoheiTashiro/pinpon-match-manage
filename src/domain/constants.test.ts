import {
  GAME_POINT,
  WIN_DIFF,
  DEUCE_FROM,
  SERVE_SWITCH_EVERY,
  DEUCE_SERVE_BASE,
} from "@/domain/constants";
import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// 卓球(ITTF)ルールに基づく定数の妥当性検証
// ---------------------------------------------------------------------------

describe("GAME_POINT", () => {
  it("11点先取ルールである", () => {
    expect(GAME_POINT).toBe(11);
  });
});

describe("WIN_DIFF", () => {
  it("2点差ルールである", () => {
    expect(WIN_DIFF).toBe(2);
  });
});

describe("DEUCE_FROM", () => {
  it("両者の合計20点(10-10)からデュースになる", () => {
    expect(DEUCE_FROM).toBe(20);
  });

  it("(GAME_POINT - 1) * 2 に等しい（デュース開始点 = 10-10 の合計）", () => {
    expect(DEUCE_FROM).toBe((GAME_POINT - 1) * WIN_DIFF);
  });
});

describe("SERVE_SWITCH_EVERY", () => {
  it("通常は2点ごとにサーブ交代", () => {
    expect(SERVE_SWITCH_EVERY).toBe(2);
  });
});

describe("DEUCE_SERVE_BASE", () => {
  it("デュース以降は1点ごとにサーブ交代するための基準値が10である", () => {
    expect(DEUCE_SERVE_BASE).toBe(10);
  });

  it("DEUCE_FROM / SERVE_SWITCH_EVERY と一致する（10回交代後にデュース）", () => {
    expect(DEUCE_SERVE_BASE).toBe(DEUCE_FROM / SERVE_SWITCH_EVERY);
  });
});
