import { GAME_POINT, WIN_DIFF } from "@/domain/constants";
import { SIDE, scoresFromLog, type Game, type Side } from "@/domain/match";
import { SIDE_KIND, type Match, type MatchSide } from "@/store/types";
import * as fc from "fast-check";

// サイド（"L" | "R"）の arbitrary
export const sideArb: fc.Arbitrary<Side> = fc.constantFrom(SIDE.LEFT, SIDE.RIGHT);

// 任意の Game（完了・未完了どちらも出る）
export const gameArb: fc.Arbitrary<Game> = fc.record({
  leftScore: fc.integer({ min: 0, max: 21 }),
  rightScore: fc.integer({ min: 0, max: 21 }),
});

// pointLog から Game を生成する arbitrary（scoresFromLog で score を導く）
export const gameFromLogArb: fc.Arbitrary<Game> = fc
  .array(sideArb, { minLength: 0, maxLength: 30 })
  .map((log) => {
    const scores = scoresFromLog(log);
    return Object.assign(scores, { pointLog: log });
  });

// 必ず isGameFinished が true になる Game
export const finishedGameArb: fc.Arbitrary<Game> = fc
  .integer({ min: 0, max: 10 })
  .chain((extra) =>
    fc.record({
      leftScore: fc.constant(GAME_POINT + extra),
      rightScore: fc.integer({ min: 0, max: GAME_POINT + extra - WIN_DIFF }),
    }),
  )
  .chain((g) =>
    fc.boolean().map((flip) => (flip ? g : { leftScore: g.rightScore, rightScore: g.leftScore })),
  );

// single の MatchSide
const singleSideArb: fc.Arbitrary<MatchSide> = fc
  .string({ minLength: 1, maxLength: 8 })
  .map((id) => ({ kind: SIDE_KIND.SINGLE, participantId: id }));

// pair の MatchSide
const pairSideArb: fc.Arbitrary<MatchSide> = fc
  .tuple(fc.string({ minLength: 1, maxLength: 8 }), fc.string({ minLength: 1, maxLength: 8 }))
  .map(([a, b]) => ({ kind: SIDE_KIND.PAIR, memberIds: [a, b] as [string, string] }));

// single/pair 両方出る MatchSide arbitrary
export const matchSideArb: fc.Arbitrary<MatchSide> = fc.oneof(singleSideArb, pairSideArb);

// single vs single の Match arbitrary（leftSide/rightSide は別 participantId）
export const matchArb: fc.Arbitrary<Match> = fc
  .tuple(fc.string({ minLength: 1, maxLength: 8 }), fc.string({ minLength: 1, maxLength: 8 }))
  .filter(([a, b]) => a !== b)
  .chain(([leftId, rightId]) =>
    fc.record({
      id: fc.string({ minLength: 1, maxLength: 8 }),
      tournamentId: fc.constant("t1"),
      leftSide: fc.constant({ kind: SIDE_KIND.SINGLE, participantId: leftId } as MatchSide),
      rightSide: fc.constant({ kind: SIDE_KIND.SINGLE, participantId: rightId } as MatchSide),
      games: fc.array(gameArb, { minLength: 0, maxLength: 7 }),
      firstServer: sideArb,
    }),
  );

// PAIR を含む Match arbitrary（ranking の doubles 検証用）
// leftSide/rightSide はどちらも pairSideArb を使い、全メンバーIDが一意
export const matchWithPairArb: fc.Arbitrary<Match> = fc
  .tuple(
    fc.string({ minLength: 1, maxLength: 6 }),
    fc.string({ minLength: 1, maxLength: 6 }),
    fc.string({ minLength: 1, maxLength: 6 }),
    fc.string({ minLength: 1, maxLength: 6 }),
  )
  .filter(([a, b, c, d]) => new Set([a, b, c, d]).size === 4)
  .chain(([a, b, c, d]) =>
    fc.record({
      id: fc.string({ minLength: 1, maxLength: 8 }),
      tournamentId: fc.constant("t1"),
      leftSide: fc.constant({
        kind: SIDE_KIND.PAIR,
        memberIds: [a, b] as [string, string],
      } as MatchSide),
      rightSide: fc.constant({
        kind: SIDE_KIND.PAIR,
        memberIds: [c, d] as [string, string],
      } as MatchSide),
      games: fc.array(gameArb, { minLength: 0, maxLength: 7 }),
      firstServer: sideArb,
    }),
  );
