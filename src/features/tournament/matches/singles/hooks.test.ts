import { MATCH_STATE } from "@/features/tournament/matches/matchState";
import { buildSinglesRows } from "@/features/tournament/matches/singles/hooks";
import { SIDE_KIND, type Match } from "@/store/types";
import { makeGame, makeMatch, makeParticipant } from "@/test/factories";
import { describe, expect, it } from "vitest";

const a = makeParticipant({ id: "p1", name: "選手A" });
const b = makeParticipant({ id: "p2", name: "選手B" });
const pairs = [{ a, b }];
const cellMap = (match: Match) => new Map([["p1|p2", match]]);

describe("buildSinglesRows", () => {
  it("試合未作成なら「対戦追加」扱いで組み合わせ順のまま", () => {
    const [row] = buildSinglesRows(pairs, new Map(), 2);
    expect(row).toMatchObject({
      matchId: null,
      leftName: "選手A",
      rightName: "選手B",
      state: MATCH_STATE.UNPLAYED,
      ariaLabel: "選手A 対 選手B 対戦追加",
    });
  });

  it("ゲーム入力途中は途中扱いで組み合わせ順のまま", () => {
    const match = makeMatch({ games: [makeGame({ leftScore: 11, rightScore: 5 })] });
    const [row] = buildSinglesRows(pairs, cellMap(match), 2);
    expect(row).toMatchObject({
      matchId: "m1",
      leftName: "選手A",
      rightName: "選手B",
      leftWins: 1,
      rightWins: 0,
      state: MATCH_STATE.IN_PROGRESS,
      ariaLabel: "選手A 対 選手B 1-0 途中 編集",
    });
  });

  it("終了時は勝者を上段へ寄せる（右側の勝ちなら入れ替え）", () => {
    const match = makeMatch({
      games: [
        makeGame({ leftScore: 5, rightScore: 11 }),
        makeGame({ leftScore: 7, rightScore: 11 }),
      ],
    });
    const [row] = buildSinglesRows(pairs, cellMap(match), 2);
    expect(row).toMatchObject({
      leftName: "選手B",
      rightName: "選手A",
      leftWins: 2,
      rightWins: 0,
      state: MATCH_STATE.WON,
      ariaLabel: "選手B 対 選手A 2-0 編集",
    });
  });

  it("試合の左右が組み合わせと逆でも勝者が上段", () => {
    const match = makeMatch({
      leftSide: { kind: SIDE_KIND.SINGLE, participantId: "p2" },
      rightSide: { kind: SIDE_KIND.SINGLE, participantId: "p1" },
      games: [
        makeGame({ leftScore: 5, rightScore: 11 }),
        makeGame({ leftScore: 7, rightScore: 11 }),
      ],
    });
    const [row] = buildSinglesRows(pairs, cellMap(match), 2);
    expect(row).toMatchObject({
      leftName: "選手A",
      rightName: "選手B",
      leftWins: 2,
      rightWins: 0,
      state: MATCH_STATE.WON,
    });
  });
});
