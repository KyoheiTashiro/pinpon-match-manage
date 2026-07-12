import type { Side } from "@/domain/match";
import {
  isGameEmpty,
  realGames,
  isGameFinished,
  gameWinner,
  opposite,
  flip,
  gameFirstServer,
  currentServer,
  winsNeededForBestOf,
  matchSummary,
  scoresFromLog,
  addPointToGame,
  removePointFromGame,
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

describe("removePointFromGame", () => {
  it("得点済み側を減点するとスコアが1減り、pointLog から該当 side の最後の出現が消える", () => {
    const game = { leftScore: 2, rightScore: 1, pointLog: ["L", "R", "L"] as Side[] };
    const result = removePointFromGame(game, "L");
    expect(result.leftScore).toBe(1);
    expect(result.rightScore).toBe(1);
    expect(result.pointLog).toEqual(["L", "R"]);
  });

  it("相手が最後に得点した後でも、自側の減点ができる", () => {
    const game = { leftScore: 1, rightScore: 1, pointLog: ["L", "R"] as Side[] };
    const result = removePointFromGame(game, "L");
    expect(result.leftScore).toBe(0);
    expect(result.rightScore).toBe(1);
    expect(result.pointLog).toEqual(["R"]);
  });

  it("スコア 0 の側を減点しても同一オブジェクトが返る", () => {
    const game = { leftScore: 0, rightScore: 2, pointLog: ["R", "R"] as Side[] };
    expect(removePointFromGame(game, "L")).toBe(game);
  });

  it("pointLog が未定義でもスコアが正なら減点できる", () => {
    const game = { leftScore: 3, rightScore: 2 };
    const result = removePointFromGame(game, "R");
    expect(result.leftScore).toBe(3);
    expect(result.rightScore).toBe(1);
    expect(result.pointLog).toBeUndefined();
  });

  it("pointLog に該当 side が無い場合はスコアのみ減り pointLog は変わらない", () => {
    const game = { leftScore: 1, rightScore: 2, pointLog: ["R", "R"] as Side[] };
    const result = removePointFromGame(game, "L");
    expect(result.leftScore).toBe(0);
    expect(result.rightScore).toBe(2);
    expect(result.pointLog).toEqual(["R", "R"]);
  });
});

describe("isGameEmpty", () => {
  it("両スコアが 0 のとき true", () => {
    expect(isGameEmpty({ leftScore: 0, rightScore: 0 })).toBe(true);
  });
  it("左スコアが 0 でないとき false", () => {
    expect(isGameEmpty({ leftScore: 1, rightScore: 0 })).toBe(false);
  });
  it("右スコアが 0 でないとき false", () => {
    expect(isGameEmpty({ leftScore: 0, rightScore: 1 })).toBe(false);
  });
  it("両スコアが非ゼロのとき false", () => {
    expect(isGameEmpty({ leftScore: 5, rightScore: 3 })).toBe(false);
  });
});

describe("realGames", () => {
  it("空ゲームを除外する", () => {
    const games = [
      { leftScore: 11, rightScore: 5 },
      { leftScore: 0, rightScore: 0 },
      { leftScore: 8, rightScore: 11 },
    ];
    expect(realGames(games)).toHaveLength(2);
    expect(realGames(games)).not.toContainEqual({ leftScore: 0, rightScore: 0 });
  });
  it("空ゲームがなければ全件返す", () => {
    const games = [
      { leftScore: 11, rightScore: 5 },
      { leftScore: 8, rightScore: 11 },
    ];
    expect(realGames(games)).toHaveLength(2);
  });
  it("全て空ゲームなら空配列", () => {
    expect(realGames([{ leftScore: 0, rightScore: 0 }])).toHaveLength(0);
  });
  it("空配列を渡すと空配列を返す", () => {
    expect(realGames([])).toEqual([]);
  });
});

describe("opposite", () => {
  it("L → R", () => {
    expect(opposite("L")).toBe("R");
  });
  it("R → L", () => {
    expect(opposite("R")).toBe("L");
  });
});

describe("flip", () => {
  it("L → R", () => {
    expect(flip("L")).toBe("R");
  });
  it("R → L", () => {
    expect(flip("R")).toBe("L");
  });
  it("null → null", () => {
    expect(flip(null)).toBeNull();
  });
});

describe("winsNeededForBestOf", () => {
  it("bestOf 3 → 2", () => {
    expect(winsNeededForBestOf(3)).toBe(2);
  });
  it("bestOf 5 → 3", () => {
    expect(winsNeededForBestOf(5)).toBe(3);
  });
  it("bestOf 7 → 4", () => {
    expect(winsNeededForBestOf(7)).toBe(4);
  });
  it("bestOf 1 → 1", () => {
    expect(winsNeededForBestOf(1)).toBe(1);
  });
});

describe("gameFirstServer", () => {
  it("gameIndex 0(偶数)→ matchFirstServer そのまま", () => {
    expect(gameFirstServer("L", 0)).toBe("L");
    expect(gameFirstServer("R", 0)).toBe("R");
  });
  it("gameIndex 1(奇数)→ matchFirstServer の反対", () => {
    expect(gameFirstServer("L", 1)).toBe("R");
    expect(gameFirstServer("R", 1)).toBe("L");
  });
  it("gameIndex 2(偶数)→ matchFirstServer そのまま", () => {
    expect(gameFirstServer("L", 2)).toBe("L");
  });
  it("gameIndex 3(奇数)→ matchFirstServer の反対", () => {
    expect(gameFirstServer("R", 3)).toBe("L");
  });
});

describe("currentServer", () => {
  // SERVE_SWITCH_EVERY=2, DEUCE_FROM=20, DEUCE_SERVE_BASE=10
  // デュース前: switches = floor(total / 2); 偶数→firstServer, 奇数→opposite
  // デュース以降(total>=20): switches = 10 + (total - 20); 偶数→firstServer, 奇数→opposite

  it("0-0(total=0, switches=0)→ firstServer", () => {
    expect(currentServer({ leftScore: 0, rightScore: 0 }, "L")).toBe("L");
  });
  it("1-0(total=1, switches=0)→ firstServer", () => {
    expect(currentServer({ leftScore: 1, rightScore: 0 }, "L")).toBe("L");
  });
  it("1-1(total=2, switches=1)→ opposite", () => {
    expect(currentServer({ leftScore: 1, rightScore: 1 }, "L")).toBe("R");
  });
  it("2-1(total=3, switches=1)→ opposite", () => {
    expect(currentServer({ leftScore: 2, rightScore: 1 }, "L")).toBe("R");
  });
  it("2-2(total=4, switches=2)→ firstServer", () => {
    expect(currentServer({ leftScore: 2, rightScore: 2 }, "L")).toBe("L");
  });
  it("5-4(total=9, switches=4)→ firstServer", () => {
    expect(currentServer({ leftScore: 5, rightScore: 4 }, "L")).toBe("L");
  });
  it("5-5(total=10, switches=5)→ opposite", () => {
    expect(currentServer({ leftScore: 5, rightScore: 5 }, "L")).toBe("R");
  });
  it("firstServer が R でも同様に機能する(total=0, switches=0)→ R", () => {
    expect(currentServer({ leftScore: 0, rightScore: 0 }, "R")).toBe("R");
  });
  it("firstServer が R で total=2(switches=1)→ opposite=L", () => {
    expect(currentServer({ leftScore: 1, rightScore: 1 }, "R")).toBe("L");
  });

  // デュース境界: total=19(switches=9, 奇数)→ opposite
  it("デュース直前: total=19(switches=9)→ opposite", () => {
    expect(currentServer({ leftScore: 10, rightScore: 9 }, "L")).toBe("R");
  });

  // デュース開始: total=20 → switches = DEUCE_SERVE_BASE + (20-20) = 10, 偶数 → firstServer
  it("デュース開始: 10-10(total=20, switches=10)→ firstServer", () => {
    expect(currentServer({ leftScore: 10, rightScore: 10 }, "L")).toBe("L");
  });

  // total=21 → switches = 10 + 1 = 11, 奇数 → opposite (1点ごとに交代)
  it("デュース: 11-10(total=21, switches=11)→ opposite", () => {
    expect(currentServer({ leftScore: 11, rightScore: 10 }, "L")).toBe("R");
  });

  // total=22 → switches = 10 + 2 = 12, 偶数 → firstServer
  it("デュース: 11-11(total=22, switches=12)→ firstServer", () => {
    expect(currentServer({ leftScore: 11, rightScore: 11 }, "L")).toBe("L");
  });

  // total=23 → switches = 10 + 3 = 13, 奇数 → opposite
  it("デュース: 12-11(total=23, switches=13)→ opposite", () => {
    expect(currentServer({ leftScore: 12, rightScore: 11 }, "L")).toBe("R");
  });

  // デュース中に firstServer=R の場合
  it("デュース: firstServer=R, 10-10(total=20, switches=10)→ R", () => {
    expect(currentServer({ leftScore: 10, rightScore: 10 }, "R")).toBe("R");
  });
  it("デュース: firstServer=R, 11-10(total=21, switches=11)→ L", () => {
    expect(currentServer({ leftScore: 11, rightScore: 10 }, "R")).toBe("L");
  });
});
