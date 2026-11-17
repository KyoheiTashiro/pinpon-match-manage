import { DEUCE_FROM } from "@/domain/constants";
import { GAME_KIND, SIDE, type Game, type Side } from "@/domain/match";
import {
  addPointToGame,
  currentServer,
  flip,
  gameFirstServer,
  gameScore,
  gameWinner,
  isGameEmpty,
  isGameFinished,
  matchSummary,
  opposite,
  realGames,
  removePointFromGame,
  scoresFromLog,
  winsNeededForBestOf,
} from "@/domain/match";
import { finishedGameArb, gameArb, gameFromLogArb, sideArb } from "@/test/arbitraries";
import { gameFromLog, makeGame } from "@/test/factories";
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
            kind: fc.constant(GAME_KIND.MANUAL),
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

  it("勝敗未確定なら leftPoints / rightPoints は全ゲームのスコア合計", () => {
    fc.assert(
      fc.property(fc.array(gameArb, { minLength: 0, maxLength: 7 }), (games) => {
        const { leftPoints, rightPoints, finished } = matchSummary(games, 8);
        expect(finished).toBe(false);
        expect(leftPoints).toBe(games.reduce((sum, game) => sum + gameScore(game).leftScore, 0));
        expect(rightPoints).toBe(games.reduce((sum, game) => sum + gameScore(game).rightScore, 0));
      }),
    );
  });

  it("勝敗確定後に続くゲームは集計に影響しない", () => {
    fc.assert(
      fc.property(
        fc.array(gameArb, { minLength: 0, maxLength: 7 }),
        fc.array(gameArb, { minLength: 1, maxLength: 3 }),
        (games, extra) => {
          const summary = matchSummary(games);
          fc.pre(summary.finished);
          expect(matchSummary([...games, ...extra])).toEqual(summary);
        },
      ),
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
      fc.property(fc.constantFrom<Game>(makeGame(), gameFromLog([])), (game) => {
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

describe("addPointToGame / removePointFromGame プロパティテスト", () => {
  it("addPoint → removePoint(同じ side) で元のゲームに戻る（履歴・直書きとも）", () => {
    fc.assert(
      fc.property(fc.oneof(gameArb, gameFromLogArb), sideArb, (game, side) => {
        expect(removePointFromGame(addPointToGame(game, side), side)).toEqual(game);
      }),
    );
  });

  it("addPoint は該当 side を +1 し、相手スコアとゲーム種別を変えない", () => {
    fc.assert(
      fc.property(fc.oneof(gameArb, gameFromLogArb), sideArb, (game, side) => {
        const before = gameScore(game);
        const after = addPointToGame(game, side);
        const expected =
          side === SIDE.LEFT
            ? { leftScore: before.leftScore + 1, rightScore: before.rightScore }
            : { leftScore: before.leftScore, rightScore: before.rightScore + 1 };
        expect(gameScore(after)).toEqual(expected);
        expect(after.kind).toBe(game.kind);
      }),
    );
  });
});

describe("removePointFromGame プロパティテスト", () => {
  it("該当 side のスコアは max(0, 元-1) になり、相手スコアは不変", () => {
    fc.assert(
      fc.property(fc.oneof(gameArb, gameFromLogArb), sideArb, (game, side) => {
        const before = gameScore(game);
        const after = gameScore(removePointFromGame(game, side));
        const expected =
          side === SIDE.LEFT
            ? { leftScore: Math.max(0, before.leftScore - 1), rightScore: before.rightScore }
            : { leftScore: before.leftScore, rightScore: Math.max(0, before.rightScore - 1) };
        expect(after).toEqual(expected);
      }),
    );
  });

  it("該当 side のスコアが 0 なら同一参照が返る", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 21 }), sideArb, (opponentScore, side) => {
        const game: Game =
          side === SIDE.LEFT
            ? { kind: "manual", leftScore: 0, rightScore: opponentScore }
            : { kind: "manual", leftScore: opponentScore, rightScore: 0 };
        expect(removePointFromGame(game, side)).toBe(game);
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
        const server19 = currentServer(
          { kind: "manual", leftScore: 10, rightScore: 9 },
          firstServer,
        );
        const server20 = currentServer(
          { kind: "manual", leftScore: 10, rightScore: 10 },
          firstServer,
        );
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
        const server21 = currentServer(
          { kind: "manual", leftScore: 11, rightScore: 10 },
          firstServer,
        );
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
        const server = currentServer(
          { kind: "manual", leftScore: left, rightScore: right },
          firstServer,
        );
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
        const { leftScore, rightScore } = gameScore(game);
        expect(result).toBe(leftScore === 0 && rightScore === 0);
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

describe("matchSummary 勝者確定境界プロパティテスト", () => {
  it("leftWins >= winsNeeded のとき winner === LEFT", () => {
    // winsNeeded=2 と winsNeeded=4 の両方で検証
    for (const winsNeeded of [2, 4] as const) {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              kind: fc.constant(GAME_KIND.MANUAL),
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
              kind: fc.constant(GAME_KIND.MANUAL),
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
