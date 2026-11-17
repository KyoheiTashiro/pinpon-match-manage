import { emptyGame, type Game } from "@/domain/match";
import {
  addPoint,
  canAddPoint,
  canRemovePoint,
  lastScoredGameIndex,
  padGames,
  removePoint,
  trimTrailingEmptyGames,
} from "@/domain/matchGames";
import { gameFromLog, makeGame } from "@/test/factories";
import { describe, it, expect } from "vitest";

const game = (leftScore: number, rightScore: number): Game => makeGame({ leftScore, rightScore });
const empty = (): Game => emptyGame();

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

describe("lastScoredGameIndex", () => {
  it("最後に得点が入ったゲームの位置を返す", () => {
    expect(lastScoredGameIndex([game(11, 5), game(3, 2), empty()])).toBe(1);
  });

  it("全ゲーム空なら -1", () => {
    expect(lastScoredGameIndex([empty(), empty()])).toBe(-1);
    expect(lastScoredGameIndex([])).toBe(-1);
  });
});

describe("trimTrailingEmptyGames", () => {
  it("末尾の空ゲームを除去する", () => {
    expect(trimTrailingEmptyGames([game(11, 5), empty(), empty()])).toEqual([game(11, 5)]);
  });

  it("途中の空ゲームは位置を保つため残す", () => {
    const games = [empty(), game(11, 5), empty()];
    expect(trimTrailingEmptyGames(games)).toEqual([empty(), game(11, 5)]);
  });

  it("全て空なら空配列", () => {
    expect(trimTrailingEmptyGames([empty(), empty()])).toEqual([]);
  });
});

describe("canAddPoint / addPoint", () => {
  it("進行中ゲームにだけ加点できる", () => {
    const games = [game(11, 5), game(3, 2), empty()];
    expect(canAddPoint(games, 2, 0)).toBe(false);
    expect(canAddPoint(games, 2, 1)).toBe(true);
    expect(canAddPoint(games, 2, 2)).toBe(false);
  });

  it("勝敗確定後はどのゲームにも加点できない", () => {
    const games = [game(11, 5), game(11, 5), empty()];
    expect([0, 1, 2].map((index) => canAddPoint(games, 2, index))).toEqual([false, false, false]);
    expect(addPoint(games, 2, 2, "L")).toBe(games);
  });

  it("加点は対象ゲームだけを更新し元の配列を変更しない", () => {
    const games = [game(11, 5), gameFromLog(["L"]), empty()];
    expect(addPoint(games, 2, 1, "R")).toEqual([game(11, 5), gameFromLog(["L", "R"]), empty()]);
    expect(games[1]).toEqual(gameFromLog(["L"]));
  });

  it("進行中でないゲームへの加点は同じ配列を返す", () => {
    const games = [game(11, 5), empty(), empty()];
    expect(addPoint(games, 2, 0, "L")).toBe(games);
    expect(addPoint(games, 2, 2, "L")).toBe(games);
  });

  it("全ゲーム終了で未決着なら次のゲームを足して加点する", () => {
    const games = [game(11, 5)];
    expect(addPoint(games, 2, 1, "L")).toEqual([game(11, 5), gameFromLog(["L"])]);
  });
});

describe("canRemovePoint / removePoint", () => {
  it("最後に得点が入ったゲームだけ取り消せる", () => {
    const games = [game(11, 5), game(3, 2), empty()];
    expect(canRemovePoint(games, 0)).toBe(false);
    expect(canRemovePoint(games, 1)).toBe(true);
    expect(canRemovePoint(games, 2)).toBe(false);
  });

  it("勝敗確定後も決着ゲームは取り消せる（誤入力の訂正）", () => {
    const games = [game(11, 5), game(11, 5), empty()];
    expect(removePoint(games, 1, "L")).toEqual([game(11, 5), game(10, 5), empty()]);
  });

  it("全ゲーム空ならどこも取り消せない", () => {
    const games = [empty(), empty()];
    expect(canRemovePoint(games, 0)).toBe(false);
    expect(canRemovePoint(games, -1)).toBe(false);
    expect(removePoint(games, 0, "L")).toBe(games);
  });

  it("前のゲームの取り消しは同じ配列を返す", () => {
    const games = [game(11, 5), game(3, 2)];
    expect(removePoint(games, 0, "L")).toBe(games);
  });
});
