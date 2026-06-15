import type { Game } from "@/domain/match";
import {
  padGames,
  trimTrailingEmptyGames,
  lockedGameStartIndex,
  firstPlayableGameIndex,
} from "@/domain/matchGames";
import { describe, it, expect } from "vitest";

const game = (leftScore: number, rightScore: number): Game => ({ leftScore, rightScore });
const empty = (): Game => game(0, 0);

describe("padGames", () => {
  it("不足分を空ゲームで埋める", () => {
    const result = padGames([game(11, 5)], 3);
    expect(result).toEqual([game(11, 5), empty(), empty()]);
  });

  it("超過分を切り詰める", () => {
    const result = padGames([game(11, 5), game(11, 6), game(11, 7), game(11, 8)], 2);
    expect(result).toEqual([game(11, 5), game(11, 6)]);
  });

  it("ちょうどの時はそのまま", () => {
    const games = [game(11, 5), game(11, 6), game(11, 7)];
    expect(padGames(games, 3)).toEqual(games);
  });

  it("元の配列を変更しない", () => {
    const games = [game(11, 5)];
    padGames(games, 3);
    expect(games).toEqual([game(11, 5)]);
  });
});

describe("trimTrailingEmptyGames", () => {
  it("lockedStartIndex 未満の空ゲームは残す", () => {
    const games = [empty(), game(11, 5), empty()];
    expect(trimTrailingEmptyGames(games, 2)).toEqual([empty(), game(11, 5)]);
  });

  it("lockedStartIndex 以降の空ゲームは除去する", () => {
    const games = [game(11, 5), empty(), empty()];
    expect(trimTrailingEmptyGames(games, 1)).toEqual([game(11, 5)]);
  });

  it("非空ゲームは常に残す", () => {
    const games = [game(11, 5), game(11, 6), game(11, 7)];
    expect(trimTrailingEmptyGames(games, 0)).toEqual(games);
  });

  it("lockedStartIndex 以降の非空ゲームも残す", () => {
    const games = [game(11, 5), empty(), game(11, 7)];
    expect(trimTrailingEmptyGames(games, 0)).toEqual([game(11, 5), game(11, 7)]);
  });
});

describe("lockedGameStartIndex", () => {
  it("winsNeeded=2 で 11-0,11-0 と並ぶと index 2 を返す", () => {
    const games = [game(11, 0), game(11, 0), empty(), empty(), empty()];
    expect(lockedGameStartIndex(games, 2, 5)).toBe(2);
  });

  it("未確定なら gameCount を返す", () => {
    const games = [game(11, 0), empty(), empty(), empty(), empty()];
    expect(lockedGameStartIndex(games, 2, 5)).toBe(5);
  });

  it("空ゲームはスキップする", () => {
    const games = [empty(), game(11, 0), game(11, 0)];
    expect(lockedGameStartIndex(games, 2, 5)).toBe(3);
  });

  it("未完了ゲームはスキップする", () => {
    const games = [game(11, 0), game(5, 3), game(11, 0)];
    expect(lockedGameStartIndex(games, 2, 5)).toBe(3);
  });

  it("右側が先取しても index を返す", () => {
    const games = [game(0, 11), game(0, 11), empty()];
    expect(lockedGameStartIndex(games, 2, 5)).toBe(2);
  });
});

describe("firstPlayableGameIndex", () => {
  it("最初の未完了ゲーム位置を返す", () => {
    const games = [game(11, 5), game(3, 2), empty()];
    expect(firstPlayableGameIndex(games, 5, 5)).toBe(1);
  });

  it("最初のゲームが未完了ならそれを返す", () => {
    const games = [empty(), empty(), empty()];
    expect(firstPlayableGameIndex(games, 5, 5)).toBe(0);
  });

  it("全て完了なら lockedStartIndex-1 を返す", () => {
    const games = [game(11, 5), game(11, 6), game(11, 7)];
    expect(firstPlayableGameIndex(games, 3, 5)).toBe(2);
  });

  it("lockedStartIndex-1 は gameCount-1 で頭打ちになる", () => {
    const games = [game(11, 5), game(11, 6), game(11, 7), game(11, 8), game(11, 9)];
    expect(firstPlayableGameIndex(games, 10, 5)).toBe(4);
  });

  it("0 未満にならない", () => {
    const games = [game(11, 5)];
    expect(firstPlayableGameIndex(games, 0, 5)).toBe(0);
  });
});
