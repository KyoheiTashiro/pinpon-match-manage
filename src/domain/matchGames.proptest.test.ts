import {
  MATCH_PHASE,
  MATCH_STATUS,
  gameScore,
  isGameEmpty,
  isGameFinished,
  matchPhase,
  matchStatus,
  matchSummary,
} from "@/domain/match";
import {
  addPoint,
  canAddPoint,
  canRemovePoint,
  lastScoredGameIndex,
  padGames,
  removePoint,
  trimTrailingEmptyGames,
} from "@/domain/matchGames";
import { gameArb, gameFromLogArb, sideArb } from "@/test/arbitraries";
import * as fc from "fast-check";
import { describe, expect, it } from "vitest";

const gamesArb = fc.array(fc.oneof(gameArb, gameFromLogArb), { minLength: 0, maxLength: 7 });
const winsNeededArb = fc.integer({ min: 1, max: 4 });
const indexArb = fc.integer({ min: -1, max: 8 });

describe("padGames プロパティテスト", () => {
  it("出力の長さは常に totalCount と一致する（パディング・トリミング両対応）", () => {
    fc.assert(
      fc.property(gamesArb, fc.integer({ min: 0, max: 10 }), (games, totalCount) => {
        expect(padGames(games, totalCount)).toHaveLength(totalCount);
      }),
    );
  });

  it("元のゲームは先頭にそのまま残り、追加分は全て空ゲーム", () => {
    fc.assert(
      fc.property(gamesArb, fc.integer({ min: 0, max: 10 }), (games, totalCount) => {
        const result = padGames(games, totalCount);
        expect(result.slice(0, games.length)).toEqual(games.slice(0, totalCount));
        expect(result.slice(games.length).every((game) => isGameEmpty(game))).toBe(true);
      }),
    );
  });
});

describe("trimTrailingEmptyGames プロパティテスト", () => {
  it("結果は元配列の先頭部分で、末尾が空ゲームにならない", () => {
    fc.assert(
      fc.property(gamesArb, (games) => {
        const result = trimTrailingEmptyGames(games);
        const last = result.at(-1);
        expect(result).toEqual(games.slice(0, result.length));
        expect(last === undefined || !isGameEmpty(last)).toBe(true);
        expect(games.slice(result.length).every((game) => isGameEmpty(game))).toBe(true);
      }),
    );
  });

  it("pad → trim は試合の集計を変えない", () => {
    fc.assert(
      fc.property(gamesArb, winsNeededArb, (games, winsNeeded) => {
        const roundTripped = trimTrailingEmptyGames(padGames(games, 7));
        expect(matchSummary(roundTripped, winsNeeded)).toEqual(matchSummary(games, winsNeeded));
      }),
    );
  });
});

describe("matchPhase / matchStatus プロパティテスト", () => {
  it("decided ⟺ matchSummary に勝者あり、勝者も一致する", () => {
    fc.assert(
      fc.property(gamesArb, winsNeededArb, (games, winsNeeded) => {
        const phase = matchPhase(games, winsNeeded);
        const summary = matchSummary(games, winsNeeded);
        expect(phase.kind === MATCH_PHASE.DECIDED).toBe(summary.finished);
        expect(phase.kind === MATCH_PHASE.DECIDED ? phase.winner : null).toBe(summary.winner);
      }),
    );
  });

  it("decided の gameIndex は終了済みゲームを指す", () => {
    fc.assert(
      fc.property(gamesArb, winsNeededArb, (games, winsNeeded) => {
        const phase = matchPhase(games, winsNeeded);
        fc.pre(phase.kind === MATCH_PHASE.DECIDED);
        expect(isGameFinished(games[phase.gameIndex])).toBe(true);
      }),
    );
  });

  it("playing の gameIndex より前は全て終了済みで、指すゲームは未終了（または配列の次）", () => {
    fc.assert(
      fc.property(gamesArb, winsNeededArb, (games, winsNeeded) => {
        const phase = matchPhase(games, winsNeeded);
        fc.pre(phase.kind === MATCH_PHASE.PLAYING);
        expect(games.slice(0, phase.gameIndex).every((game) => isGameFinished(game))).toBe(true);
        expect(phase.gameIndex === games.length || !isGameFinished(games[phase.gameIndex])).toBe(
          true,
        );
      }),
    );
  });

  it("matchStatus は finished / unplayed / inProgress を排他的に返す", () => {
    fc.assert(
      fc.property(gamesArb, winsNeededArb, (games, winsNeeded) => {
        const finished = matchSummary(games, winsNeeded).finished;
        const expected = finished
          ? MATCH_STATUS.FINISHED
          : games.every((game) => isGameEmpty(game))
            ? MATCH_STATUS.UNPLAYED
            : MATCH_STATUS.IN_PROGRESS;
        expect(matchStatus(games, winsNeeded)).toBe(expected);
      }),
    );
  });
});

describe("addPoint / removePoint プロパティテスト", () => {
  it("加点できるゲームは高々 1 つで、勝敗確定後は 0", () => {
    fc.assert(
      fc.property(gamesArb, winsNeededArb, (games, winsNeeded) => {
        const addable = games.filter((_, index) => canAddPoint(games, winsNeeded, index));
        expect(addable.length).toBeLessThanOrEqual(1);
        if (matchSummary(games, winsNeeded).finished) expect(addable).toHaveLength(0);
      }),
    );
  });

  it("取り消せるのは最後に得点が入ったゲームだけ", () => {
    fc.assert(
      fc.property(gamesArb, indexArb, (games, gameIndex) => {
        expect(canRemovePoint(games, gameIndex)).toBe(
          gameIndex >= 0 && gameIndex === lastScoredGameIndex(games),
        );
      }),
    );
  });

  it("許可されない操作は同じ配列を返す", () => {
    fc.assert(
      fc.property(gamesArb, winsNeededArb, indexArb, sideArb, (games, winsNeeded, index, side) => {
        if (!canAddPoint(games, winsNeeded, index)) {
          expect(addPoint(games, winsNeeded, index, side)).toBe(games);
        }
        if (!canRemovePoint(games, index)) expect(removePoint(games, index, side)).toBe(games);
      }),
    );
  });

  it("加点は対象ゲームの合計点を 1 増やし、他のゲームを変えない", () => {
    fc.assert(
      fc.property(gamesArb, winsNeededArb, sideArb, (games, winsNeeded, side) => {
        const padded = padGames(games, 7);
        const phase = matchPhase(padded, winsNeeded);
        fc.pre(phase.kind === MATCH_PHASE.PLAYING && phase.gameIndex < padded.length);
        const next = addPoint(padded, winsNeeded, phase.gameIndex, side);
        const total = (index: number, list: typeof padded) =>
          gameScore(list[index]).leftScore + gameScore(list[index]).rightScore;
        expect(total(phase.gameIndex, next)).toBe(total(phase.gameIndex, padded) + 1);
        expect(next.filter((_, index) => index !== phase.gameIndex)).toEqual(
          padded.filter((_, index) => index !== phase.gameIndex),
        );
      }),
    );
  });

  it("加点直後の同じ側の取り消しで元に戻る", () => {
    fc.assert(
      fc.property(gamesArb, winsNeededArb, sideArb, (games, winsNeeded, side) => {
        const padded = padGames(games, 7);
        const phase = matchPhase(padded, winsNeeded);
        fc.pre(phase.kind === MATCH_PHASE.PLAYING && phase.gameIndex < padded.length);
        // 後続ゲームに得点が残る旧データでは、加点したゲームが「最後に得点が入ったゲーム」にならない
        fc.pre(lastScoredGameIndex(padded) <= phase.gameIndex);
        const added = addPoint(padded, winsNeeded, phase.gameIndex, side);
        expect(removePoint(added, phase.gameIndex, side)).toEqual(padded);
      }),
    );
  });
});
