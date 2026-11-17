import { GAME_POINT, WIN_DIFF } from "@/domain/constants";
import { GAME_KIND, SIDE, type Game, type Side } from "@/domain/match";
import { FORMAT, type Match } from "@/store/types";
import * as fc from "fast-check";

// participantId / memberId 用の ID arbitrary。
// Object.prototype のプロパティ名("toString" 等)はプレーンオブジェクトのルックアップで
// prototype 由来の値を拾い `names[id] ?? "?"` の "?" フォールバックをすり抜けるため除外する。
// 実 ID は nanoid 生成でこれらと衝突しないため、テスト固有の偽陽性を防ぐだけの絞り込み。
const idArb = (maxLength = 8): fc.Arbitrary<string> =>
  fc.string({ minLength: 1, maxLength: maxLength }).filter((id) => !(id in Object.prototype));

// サイド（"L" | "R"）の arbitrary
export const sideArb: fc.Arbitrary<Side> = fc.constantFrom(SIDE.LEFT, SIDE.RIGHT);

// 任意の直書き Game（完了・未完了どちらも出る）
export const gameArb: fc.Arbitrary<Game> = fc.record({
  kind: fc.constant(GAME_KIND.MANUAL),
  leftScore: fc.integer({ min: 0, max: 21 }),
  rightScore: fc.integer({ min: 0, max: 21 }),
});

// 得点履歴つき Game
export const gameFromLogArb: fc.Arbitrary<Game> = fc
  .array(sideArb, { minLength: 0, maxLength: 30 })
  .map((log) => ({ kind: GAME_KIND.LOGGED, pointLog: log }));

// 必ず isGameFinished が true になる Game
export const finishedGameArb: fc.Arbitrary<Game> = fc
  .integer({ min: 0, max: 10 })
  .chain((extra) =>
    fc.record({
      leftScore: fc.constant(GAME_POINT + extra),
      rightScore: fc.integer({ min: 0, max: GAME_POINT + extra - WIN_DIFF }),
    }),
  )
  .chain((score) =>
    fc.boolean().map((flip): Game => ({
      kind: GAME_KIND.MANUAL,
      leftScore: flip ? score.leftScore : score.rightScore,
      rightScore: flip ? score.rightScore : score.leftScore,
    })),
  );

// シングルス(ID 1 つ) / ダブルス(ID 2 つ) 両方出るサイド arbitrary
export const matchSideArb: fc.Arbitrary<string | [string, string]> = fc.oneof(
  idArb(),
  fc.tuple(idArb(), idArb()),
);

// single vs single の Match arbitrary（left/right は別 participantId）
export const matchArb: fc.Arbitrary<Match> = fc
  .tuple(idArb(), idArb())
  .filter(([a, b]) => a !== b)
  .chain(([leftId, rightId]) =>
    fc.record({
      id: fc.string({ minLength: 1, maxLength: 8 }),
      tournamentId: fc.constant("t1"),
      kind: fc.constant(FORMAT.SINGLES),
      left: fc.constant(leftId),
      right: fc.constant(rightId),
      games: fc.array(gameArb, { minLength: 0, maxLength: 7 }),
      firstServer: sideArb,
    }),
  );

// PAIR を含む Match arbitrary（ranking の doubles 検証用）
// 全メンバーIDが一意
export const matchWithPairArb: fc.Arbitrary<Match> = fc
  .tuple(idArb(6), idArb(6), idArb(6), idArb(6))
  .filter(([a, b, c, d]) => new Set([a, b, c, d]).size === 4)
  .chain(([a, b, c, d]) =>
    fc.record({
      id: fc.string({ minLength: 1, maxLength: 8 }),
      tournamentId: fc.constant("t1"),
      kind: fc.constant(FORMAT.DOUBLES),
      left: fc.constant<[string, string]>([a, b]),
      right: fc.constant<[string, string]>([c, d]),
      games: fc.array(gameArb, { minLength: 0, maxLength: 7 }),
      firstServer: sideArb,
    }),
  );
