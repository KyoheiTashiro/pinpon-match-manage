import { DEUCE_FROM } from "@/domain/constants";
import { SIDE, type Side } from "@/domain/match";
import {
  addPointToGame,
  currentServer,
  flip,
  gameFirstServer,
  gameWinner,
  isGameEmpty,
  isGameFinished,
  lastScorer,
  matchSummary,
  opposite,
  realGames,
  scoresFromLog,
  undoLastPoint,
  winsNeededForBestOf,
} from "@/domain/match";
import { finishedGameArb, gameArb, gameFromLogArb, sideArb } from "@/test/arbitraries";
import * as fc from "fast-check";
import { describe, expect, it } from "vitest";

describe("matchSummary プロパティテスト", () => {
  it("leftWins + rightWins はゲーム数以下", () => {
    // 勝利ゲーム数の合計は試合ゲーム数を超えない
    fc.assert(
      fc.property(fc.array(gameArb, { minLength: 0, maxLength: 7 }), (games) => {
        const { leftWins, rightWins } = matchSummary(games);
        expect(leftWins + rightWins).toBeLessThanOrEqual(games.length);
      }),
    );
  });

  it("finished===true のときは winner!==null（片側が全ゲーム勝利する配列を使用）", () => {
    // 同じサイドが winsNeeded 回以上勝つゲームのみを使うと finished===true かつ winner 非 null になる
    // leftScore > rightScore のゲームを3個以上並べると leftWins >= 3 が保証される
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            leftScore: fc.integer({ min: 11, max: 21 }),
            rightScore: fc.integer({ min: 0, max: 9 }),
          }),
          { minLength: 3, maxLength: 5 },
        ),
        (games) => {
          const { finished, winner } = matchSummary(games);
          expect(finished).toBe(true);
          expect(winner).not.toBeNull();
        },
      ),
    );
  });

  it("games が空なら finished===false かつ winner===null", () => {
    // ゲームが 0 件の場合は勝敗が成立しない
    const { finished, winner } = matchSummary([]);
    expect(finished).toBe(false);
    expect(winner).toBeNull();
  });

  it("winner が非 null ⟺ finished が true（双方向の整合性）", () => {
    // winner の存在と finished フラグは常に一致する
    fc.assert(
      fc.property(fc.array(gameArb, { minLength: 0, maxLength: 7 }), (games) => {
        const { finished, winner } = matchSummary(games);
        // 比較演算のみ使用し条件分岐なしで整合性を表現する
        expect(winner !== null).toBe(finished);
      }),
    );
  });

  it("leftPoints は全ゲームの leftScore の合計、rightPoints も同様", () => {
    // ポイント合計はゲームスコアの単純合算と一致する
    fc.assert(
      fc.property(fc.array(gameArb, { minLength: 0, maxLength: 7 }), (games) => {
        const { leftPoints, rightPoints } = matchSummary(games);
        const expectedLeft = games.reduce((acc, g) => acc + g.leftScore, 0);
        const expectedRight = games.reduce((acc, g) => acc + g.rightScore, 0);
        expect(leftPoints).toBe(expectedLeft);
        expect(rightPoints).toBe(expectedRight);
      }),
    );
  });
});

describe("gameWinner プロパティテスト", () => {
  it("isGameFinished===true なら gameWinner は非 null（finishedGameArb を使用）", () => {
    // finishedGameArb は必ず終了したゲームを生成するため常に非 null が保証される
    fc.assert(
      fc.property(finishedGameArb, (game) => {
        expect(isGameFinished(game)).toBe(true);
        expect(gameWinner(game)).not.toBeNull();
      }),
    );
  });

  it("スコアが 0-0 のゲームは未終了で gameWinner は null", () => {
    // 0-0 ゲームは必ず未終了
    fc.assert(
      fc.property(fc.constant({ leftScore: 0, rightScore: 0 }), (game) => {
        expect(isGameFinished(game)).toBe(false);
        expect(gameWinner(game)).toBeNull();
      }),
    );
  });

  it("gameWinner と isGameFinished は常に整合する", () => {
    // gameWinner が非 null ⟺ isGameFinished が true（双方向の等価性）
    fc.assert(
      fc.property(gameArb, (game) => {
        const winner = gameWinner(game);
        const finished = isGameFinished(game);
        expect(winner !== null).toBe(finished);
      }),
    );
  });
});

describe("addPointToGame / undoLastPoint プロパティテスト", () => {
  it("addPoint → undo でスコアが元に戻る（ラウンドトリップ）", () => {
    // 得点追加後に取り消すとスコアが完全に復元される
    // gameFromLogArb は必ず pointLog を持つため非 null アクセスが安全
    fc.assert(
      fc.property(gameFromLogArb, sideArb, (game, side) => {
        const after = addPointToGame(game, side);
        const undone = undoLastPoint(after);
        expect(undone.leftScore).toBe(game.leftScore);
        expect(undone.rightScore).toBe(game.rightScore);
        expect(undone.pointLog!.length).toBe(game.pointLog!.length);
      }),
    );
  });

  it("addPoint で pointLog が 1 増え、undo で 1 減る", () => {
    // ログの長さが正確に+1/-1される
    // gameFromLogArb は必ず pointLog を持つため非 null アクセスが安全
    fc.assert(
      fc.property(gameFromLogArb, sideArb, (game, side) => {
        const before = game.pointLog!.length;
        const after = addPointToGame(game, side);
        const undone = undoLastPoint(after);
        expect(after.pointLog!.length).toBe(before + 1);
        expect(undone.pointLog!.length).toBe(before);
      }),
    );
  });
});

describe("scoresFromLog プロパティテスト", () => {
  it("leftScore + rightScore === log.length", () => {
    // ログの全点数がスコアに反映される
    fc.assert(
      fc.property(fc.array(sideArb, { minLength: 0, maxLength: 40 }), (log) => {
        const { leftScore, rightScore } = scoresFromLog(log);
        expect(leftScore + rightScore).toBe(log.length);
      }),
    );
  });
});

describe("opposite プロパティテスト", () => {
  it("opposite(opposite(s)) === s（双対性）", () => {
    // 反転を2回適用すると元のサイドに戻る
    fc.assert(
      fc.property(sideArb, (side) => {
        expect(opposite(opposite(side))).toBe(side);
      }),
    );
  });
});

describe("currentServer プロパティテスト", () => {
  it("currentServer は常に 'L' または 'R' を返す", () => {
    // サーバーは必ずどちらかのサイドである
    fc.assert(
      fc.property(gameArb, sideArb, (game, firstServer) => {
        const server = currentServer(game, firstServer);
        expect([SIDE.LEFT, SIDE.RIGHT] as Side[]).toContain(server);
      }),
    );
  });

  it("合計19点(デュース直前)→ サーブ交代回数9回(奇数)→ opposite", () => {
    // total=19: switches=floor(19/2)=9(奇数) → opposite
    // total=20: switches=DEUCE_SERVE_BASE+(20-20)=10(偶数) → firstServer  ← 切替ルール変更後も整合
    fc.assert(
      fc.property(sideArb, (firstServer) => {
        const server19 = currentServer({ leftScore: 10, rightScore: 9 }, firstServer);
        const server20 = currentServer({ leftScore: 10, rightScore: 10 }, firstServer);
        // 合計19点(奇数回交代) → opposite
        expect(server19).toBe(opposite(firstServer));
        // 合計20点(デュース開始、偶数回交代) → firstServer
        expect(server20).toBe(firstServer);
      }),
    );
  });

  it("合計21点(デュース中) → 1点ごとに交代(firstServerと逆)", () => {
    // total=21: switches=10+1=11(奇数) → opposite
    fc.assert(
      fc.property(sideArb, (firstServer) => {
        const server21 = currentServer({ leftScore: 11, rightScore: 10 }, firstServer);
        expect(server21).toBe(opposite(firstServer));
      }),
    );
  });

  it("デュース域(total>=20)では合計が1増えるたびにサーバーが交互に切り替わる", () => {
    // total=20+k → switches=DEUCE_SERVE_BASE+k → k偶数ならfirstServer, 奇数ならopposite
    fc.assert(
      fc.property(sideArb, fc.integer({ min: 0, max: 20 }), (firstServer, k) => {
        const total = DEUCE_FROM + k;
        const left = Math.ceil(total / 2);
        const right = Math.floor(total / 2);
        const server = currentServer({ leftScore: left, rightScore: right }, firstServer);
        const expected = k % 2 === 0 ? firstServer : opposite(firstServer);
        expect(server).toBe(expected);
      }),
    );
  });
});

describe("isGameEmpty / realGames プロパティテスト", () => {
  it("isGameEmpty は leftScore===0 && rightScore===0 のときのみ true", () => {
    fc.assert(
      fc.property(gameArb, (game) => {
        const result = isGameEmpty(game);
        expect(result).toBe(game.leftScore === 0 && game.rightScore === 0);
      }),
    );
  });

  it("realGames は 0-0 ゲームを全て除外する", () => {
    fc.assert(
      fc.property(fc.array(gameArb, { minLength: 0, maxLength: 10 }), (games) => {
        const real = realGames(games);
        for (const g of real) {
          expect(isGameEmpty(g)).toBe(false);
        }
      }),
    );
  });

  it("realGames の長さは元の配列以下", () => {
    fc.assert(
      fc.property(fc.array(gameArb, { minLength: 0, maxLength: 10 }), (games) => {
        expect(realGames(games).length).toBeLessThanOrEqual(games.length);
      }),
    );
  });

  it("realGames は非空ゲームを全て保持する", () => {
    fc.assert(
      fc.property(fc.array(gameArb, { minLength: 0, maxLength: 10 }), (games) => {
        const nonEmpty = games.filter((g) => !isGameEmpty(g));
        expect(realGames(games)).toEqual(nonEmpty);
      }),
    );
  });
});

describe("gameFirstServer プロパティテスト", () => {
  it("gameIndex 偶数なら matchFirstServer そのまま", () => {
    fc.assert(
      fc.property(sideArb, fc.integer({ min: 0, max: 20 }), (s, n) => {
        const index = n * 2; // 偶数
        expect(gameFirstServer(s, index)).toBe(s);
      }),
    );
  });

  it("gameIndex 奇数なら opposite(matchFirstServer)", () => {
    fc.assert(
      fc.property(sideArb, fc.integer({ min: 0, max: 20 }), (s, n) => {
        const index = n * 2 + 1; // 奇数
        expect(gameFirstServer(s, index)).toBe(opposite(s));
      }),
    );
  });

  it("周期2性: gameFirstServer(s,0)===s, gameFirstServer(s,1)===opposite(s), gameFirstServer(s,2)===s", () => {
    fc.assert(
      fc.property(sideArb, (s) => {
        expect(gameFirstServer(s, 0)).toBe(s);
        expect(gameFirstServer(s, 1)).toBe(opposite(s));
        expect(gameFirstServer(s, 2)).toBe(s);
      }),
    );
  });
});

describe("flip プロパティテスト", () => {
  it("flip(null) === null", () => {
    expect(flip(null)).toBeNull();
  });

  it("flip(side) === opposite(side)", () => {
    fc.assert(
      fc.property(sideArb, (side) => {
        expect(flip(side)).toBe(opposite(side));
      }),
    );
  });

  it("flip(flip(side)) === side（双対性）", () => {
    fc.assert(
      fc.property(sideArb, (side) => {
        expect(flip(flip(side))).toBe(side);
      }),
    );
  });
});

describe("winsNeededForBestOf プロパティテスト", () => {
  it("bestOf=3 → 2", () => {
    expect(winsNeededForBestOf(3)).toBe(2);
  });

  it("bestOf=5 → 3", () => {
    expect(winsNeededForBestOf(5)).toBe(3);
  });

  it("bestOf=7 → 4", () => {
    expect(winsNeededForBestOf(7)).toBe(4);
  });

  it("任意の奇数 n → floor(n/2)+1", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 21 }).filter((n) => n % 2 === 1),
        (n) => {
          expect(winsNeededForBestOf(n)).toBe(Math.floor(n / 2) + 1);
        },
      ),
    );
  });
});

describe("lastScorer プロパティテスト", () => {
  it("pointLog が undefined なら null", () => {
    expect(lastScorer({ leftScore: 0, rightScore: 0 })).toBeNull();
  });

  it("pointLog が空配列なら null", () => {
    expect(lastScorer({ leftScore: 0, rightScore: 0, pointLog: [] })).toBeNull();
  });

  it("pointLog が非空なら末尾要素を返す", () => {
    fc.assert(
      fc.property(fc.array(sideArb, { minLength: 1, maxLength: 20 }), (log) => {
        const game = { leftScore: 0, rightScore: 0, pointLog: log };
        expect(lastScorer(game)).toBe(log.at(-1));
      }),
    );
  });
});

describe("undoLastPoint early-return プロパティテスト", () => {
  it("pointLog が undefined のとき元の game オブジェクトをそのまま返す(参照同一)", () => {
    fc.assert(
      fc.property(
        fc.record({
          leftScore: fc.integer({ min: 0, max: 20 }),
          rightScore: fc.integer({ min: 0, max: 20 }),
        }),
        (game) => {
          expect(undoLastPoint(game)).toBe(game);
        },
      ),
    );
  });

  it("pointLog が空配列のとき元の game オブジェクトをそのまま返す(参照同一)", () => {
    fc.assert(
      fc.property(
        fc.record({
          leftScore: fc.integer({ min: 0, max: 20 }),
          rightScore: fc.integer({ min: 0, max: 20 }),
        }),
        (base) => {
          const game = { ...base, pointLog: [] as Side[] };
          expect(undoLastPoint(game)).toBe(game);
        },
      ),
    );
  });
});

describe("matchSummary 勝者確定境界プロパティテスト", () => {
  it("leftWins >= winsNeeded のとき winner === LEFT", () => {
    // winsNeeded=2 と winsNeeded=4 の両方で検証
    for (const winsNeeded of [2, 4] as const) {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              leftScore: fc.integer({ min: 11, max: 15 }),
              rightScore: fc.integer({ min: 0, max: 9 }),
            }),
            { minLength: winsNeeded, maxLength: winsNeeded },
          ),
          (games) => {
            const { winner, finished } = matchSummary(games, winsNeeded);
            expect(finished).toBe(true);
            expect(winner).toBe(SIDE.LEFT);
          },
        ),
      );
    }
  });

  it("rightWins >= winsNeeded のとき winner === RIGHT", () => {
    for (const winsNeeded of [2, 4] as const) {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              leftScore: fc.integer({ min: 0, max: 9 }),
              rightScore: fc.integer({ min: 11, max: 15 }),
            }),
            { minLength: winsNeeded, maxLength: winsNeeded },
          ),
          (games) => {
            const { winner, finished } = matchSummary(games, winsNeeded);
            expect(finished).toBe(true);
            expect(winner).toBe(SIDE.RIGHT);
          },
        ),
      );
    }
  });
});
