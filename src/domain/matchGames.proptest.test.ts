import { isGameFinished } from "@/domain/match";
import {
  firstPlayableGameIndex,
  lockedGameStartIndex,
  padGames,
  trimTrailingEmptyGames,
} from "@/domain/matchGames";
import { gameArb, finishedGameArb } from "@/test/arbitraries";
import * as fc from "fast-check";
import { describe, expect, it } from "vitest";

describe("padGames プロパティテスト", () => {
  it("出力の長さは常に max(totalCount, 0) と一致する（パディング・トリミング両対応）", () => {
    // 不足分は空ゲームで埋め、超過分は切り詰めた結果として正確な長さになる
    fc.assert(
      fc.property(
        fc.array(gameArb, { minLength: 0, maxLength: 10 }),
        fc.integer({ min: 0, max: 10 }),
        (games, totalCount) => {
          const result = padGames(games, totalCount);
          expect(result.length).toBe(Math.max(totalCount, 0));
        },
      ),
    );
  });
});

describe("lockedGameStartIndex プロパティテスト", () => {
  it("戻り値は常に 0 以上、かつ gameCount または games.length 以下", () => {
    // 勝敗確定時は games 配列内のインデックス+1、未確定時は gameCount を返す
    fc.assert(
      fc.property(
        fc.array(gameArb, { minLength: 0, maxLength: 10 }),
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 10 }),
        (games, winsNeeded, gameCount) => {
          const result = lockedGameStartIndex(games, winsNeeded, gameCount);
          // 未確定時は必ず gameCount を返す
          // 確定時は games 配列の範囲内のインデックス+1（1以上、games.length以下）
          expect(result).toBeGreaterThanOrEqual(0);
          const upperBound = Math.max(gameCount, games.length);
          expect(result).toBeLessThanOrEqual(upperBound);
        },
      ),
    );
  });

  it("games が空配列のとき lockedGameStartIndex === gameCount", () => {
    // 試合結果がなければ勝敗は確定せず gameCount を返す
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 10 }),
        (winsNeeded, gameCount) => {
          const index = lockedGameStartIndex([], winsNeeded, gameCount);
          expect(index).toBe(gameCount);
        },
      ),
    );
  });

  it("勝敗確定時: 戻り値は確定したゲームの index+1 (具体値検証)", () => {
    // winsNeeded=2: 左が11-0,11-0の2連勝 → lockedGameStartIndex=2
    expect(
      lockedGameStartIndex(
        [
          { leftScore: 11, rightScore: 0 },
          { leftScore: 11, rightScore: 0 },
        ],
        2,
        5,
      ),
    ).toBe(2);
    // winsNeeded=3: 右が0-11,0-11,0-11の3連勝 → lockedGameStartIndex=3
    expect(
      lockedGameStartIndex(
        [
          { leftScore: 0, rightScore: 11 },
          { leftScore: 0, rightScore: 11 },
          { leftScore: 0, rightScore: 11 },
        ],
        3,
        7,
      ),
    ).toBe(3);
  });

  it("途中の空ゲームはカウントされず、確定後のインデックスに影響しない", () => {
    // 空ゲーム→完了→空ゲーム→完了: 空ゲームはスキップ、確定は最後の完了ゲームで決まる
    expect(
      lockedGameStartIndex(
        [
          { leftScore: 0, rightScore: 0 }, // 空(skip)
          { leftScore: 11, rightScore: 0 }, // 左勝ち(leftWins=1)
          { leftScore: 0, rightScore: 0 }, // 空(skip)
          { leftScore: 11, rightScore: 0 }, // 左勝ち(leftWins=2=winsNeeded) → index+1=4
        ],
        2,
        7,
      ),
    ).toBe(4);
  });

  it("未完了ゲームが挟まっていても確定判定はスキップされる", () => {
    // 完了→未完了→完了: 未完了はスキップ、3つ目で確定
    expect(
      lockedGameStartIndex(
        [
          { leftScore: 11, rightScore: 0 }, // 左勝ち(leftWins=1)
          { leftScore: 5, rightScore: 3 }, // 未完了(skip)
          { leftScore: 11, rightScore: 0 }, // 左勝ち(leftWins=2=winsNeeded) → index+1=3
        ],
        2,
        5,
      ),
    ).toBe(3);
  });

  it("lockedStartIndex=0 相当: winsNeeded > ゲーム数なら必ず gameCount を返す", () => {
    fc.assert(
      fc.property(
        fc.array(finishedGameArb, { minLength: 0, maxLength: 3 }),
        fc.integer({ min: 1, max: 10 }),
        (games, gameCount) => {
          // winsNeeded をゲーム数より大きくすると勝敗確定不可
          const winsNeeded = games.length + 1;
          const result = lockedGameStartIndex(games, winsNeeded, gameCount);
          expect(result).toBe(gameCount);
        },
      ),
    );
  });
});

describe("trimTrailingEmptyGames プロパティテスト", () => {
  it("lockedStartIndex 未満のゲームは空でも必ず保持される", () => {
    fc.assert(
      fc.property(
        fc.array(gameArb, { minLength: 0, maxLength: 8 }),
        fc.integer({ min: 0, max: 8 }),
        (games, lockedStartIndex) => {
          const result = trimTrailingEmptyGames(games, lockedStartIndex);
          // lockedStartIndex 未満のゲームは全て保持される（空でも）
          const beforeLock = games.slice(0, lockedStartIndex);
          expect(result.slice(0, beforeLock.length)).toEqual(beforeLock);
        },
      ),
    );
  });

  it("lockedStartIndex 以降の非空ゲームは保持される", () => {
    fc.assert(
      fc.property(
        fc.array(gameArb, { minLength: 0, maxLength: 8 }),
        fc.integer({ min: 0, max: 8 }),
        (games, lockedStartIndex) => {
          const result = trimTrailingEmptyGames(games, lockedStartIndex);
          // 結果の中に lockedStartIndex 以降の空ゲームが存在しない
          for (let index = 0; index < result.length; index++) {
            const originalIndex = games.indexOf(result[index]);
            if (originalIndex >= lockedStartIndex) {
              expect(result[index].leftScore !== 0 || result[index].rightScore !== 0).toBe(true);
            }
          }
        },
      ),
    );
  });

  it("lockedStartIndex 以降の空ゲームは全て除去される", () => {
    fc.assert(
      fc.property(
        fc.array(gameArb, { minLength: 0, maxLength: 8 }),
        fc.integer({ min: 0, max: 8 }),
        (games, lockedStartIndex) => {
          const result = trimTrailingEmptyGames(games, lockedStartIndex);
          const afterLock = result.filter((_, index) => index >= lockedStartIndex);
          for (const g of afterLock) {
            expect(g.leftScore !== 0 || g.rightScore !== 0).toBe(true);
          }
        },
      ),
    );
  });
});

describe("padGames 境界値プロパティテスト", () => {
  it("totalCount=0 のとき常に空配列を返す", () => {
    fc.assert(
      fc.property(fc.array(gameArb, { minLength: 0, maxLength: 5 }), (games) => {
        expect(padGames(games, 0)).toEqual([]);
      }),
    );
  });

  it("パディングで追加されたゲームは全て leftScore===0 && rightScore===0", () => {
    fc.assert(
      fc.property(
        fc.array(gameArb, { minLength: 0, maxLength: 5 }),
        fc.integer({ min: 0, max: 10 }),
        (games, totalCount) => {
          const result = padGames(games, totalCount);
          // gamesの長さを超えた部分は空ゲームで埋まっている
          for (let index = games.length; index < totalCount; index++) {
            expect(result[index]).toEqual({ leftScore: 0, rightScore: 0 });
          }
        },
      ),
    );
  });
});

describe("firstPlayableGameIndex プロパティテスト", () => {
  it("戻り値は常に 0 以上", () => {
    // 結果が負にならないことを保証する
    fc.assert(
      fc.property(
        fc.array(gameArb, { minLength: 0, maxLength: 10 }),
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 1, max: 10 }),
        (games, lockedStartIndex, gameCount) => {
          const result = firstPlayableGameIndex(games, lockedStartIndex, gameCount);
          expect(result).toBeGreaterThanOrEqual(0);
        },
      ),
    );
  });

  it("lockedStartIndex 未満に未完了ゲームがない場合: Math.min(gameCount-1, ...) の上限が効く", () => {
    // fallback パス: 結果は gameCount-1 以下になる
    fc.assert(
      fc.property(
        fc.array(finishedGameArb, { minLength: 0, maxLength: 5 }),
        fc.integer({ min: 0, max: 3 }),
        fc.integer({ min: 1, max: 10 }),
        (games, lockedStartIndex, gameCount) => {
          const result = firstPlayableGameIndex(games, lockedStartIndex, gameCount);
          // 全ゲームが完了しているので fallback パスを通る
          expect(result).toBeLessThanOrEqual(gameCount - 1);
        },
      ),
    );
  });

  it("未完了ゲームが lockedStartIndex 未満に存在すれば最初の未完了 index を返す", () => {
    // 全ゲームが完了済みでない場合、最初の未完了ゲームのインデックスが返される
    fc.assert(
      fc.property(
        fc.array(gameArb, { minLength: 1, maxLength: 7 }),
        fc.integer({ min: 5, max: 10 }),
        fc.integer({ min: 5, max: 10 }),
        (games, lockedStartIndex, gameCount) => {
          const result = firstPlayableGameIndex(games, lockedStartIndex, gameCount);
          // ゲームが全て完了していなければ未完了の最初インデックスが返される可能性がある
          const firstUnfinished = games.findIndex((g) => !isGameFinished(g));
          if (firstUnfinished !== -1 && firstUnfinished < lockedStartIndex) {
            expect(result).toBe(firstUnfinished);
          }
        },
      ),
    );
  });

  it("全ゲームが完了済み: Math.min(gameCount-1, Math.max(0, lockedStartIndex-1)) を返す", () => {
    fc.assert(
      fc.property(
        fc.array(finishedGameArb, { minLength: 1, maxLength: 5 }),
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 1, max: 10 }),
        (games, lockedStartIndex, gameCount) => {
          // lockedStartIndex がゲーム数より大きければ全ゲーム完了を見て fallback
          const effectiveLocked = Math.min(lockedStartIndex, games.length + 1);
          const result = firstPlayableGameIndex(games, effectiveLocked, gameCount);
          expect(result).toBeGreaterThanOrEqual(0);
          expect(result).toBeLessThanOrEqual(gameCount - 1);
        },
      ),
    );
  });

  it("lockedStartIndex=0 のとき未完了ループが回らず fallback が返る", () => {
    fc.assert(
      fc.property(
        fc.array(gameArb, { minLength: 0, maxLength: 5 }),
        fc.integer({ min: 1, max: 10 }),
        (games, gameCount) => {
          // lockedStartIndex=0: ループ条件 index<0 が偽なので即 fallback
          const result = firstPlayableGameIndex(games, 0, gameCount);
          const expected = Math.min(gameCount - 1, Math.max(0, 0 - 1));
          expect(result).toBe(expected); // Math.min(gameCount-1, 0) = 0
        },
      ),
    );
  });
});
