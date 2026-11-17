import { matchesOf } from "@/store/selectors";
import { FORMAT, type MatchSides } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";
import { gameFromLog } from "@/test/factories";
import { beforeEach, describe, expect, it } from "vitest";

const matchIdsOf = (tId: string) => matchesOf(useAppStore.getState().matches, tId).map((m) => m.id);

/** 検証を通る前提で試合を作る（null は前提崩れなので落とす） */
const addMatch = (tournamentId: string, sides: MatchSides): string => {
  const id = useAppStore.getState().addManualMatch(tournamentId, sides);
  if (id === null) throw new Error("試合を作成できない");
  return id;
};

beforeEach(() => {
  useAppStore.getState().resetAll();
});

/** 大会を作り参加者2人(シングルス用)を返す */
function setupSingles() {
  const tId = useAppStore
    .getState()
    .createTournament("試合テスト", FORMAT.SINGLES, "2026-01-01", 5);
  const pId1 = useAppStore.getState().addParticipant(tId, "選手A");
  const pId2 = useAppStore.getState().addParticipant(tId, "選手B");
  const pId3 = useAppStore.getState().addParticipant(tId, "選手C");
  return { tId, pId1, pId2, pId3 };
}

describe("addManualMatch", () => {
  it("シングルス: match が追加され tournament の試合に含まれる", () => {
    const { tId, pId1, pId2 } = setupSingles();
    const mId = addMatch(tId, { kind: FORMAT.SINGLES, left: pId1, right: pId2 });
    const state = useAppStore.getState();
    expect(state.matches[mId]).toBeDefined();
    expect(matchIdsOf(tId)).toContain(mId);
  });

  it("シングルス重複検出: 同一2人を再度追加すると同じ ID が返り match は1件のみ", () => {
    const { tId, pId1, pId2 } = setupSingles();
    const mId1 = addMatch(tId, { kind: FORMAT.SINGLES, left: pId1, right: pId2 });
    const mId2 = addMatch(tId, { kind: FORMAT.SINGLES, left: pId1, right: pId2 });
    expect(mId1).toBe(mId2);
    expect(matchIdsOf(tId)).toHaveLength(1);
  });

  it("シングルス重複検出: 左右入れ替えても同じ ID が返り match は1件のみ", () => {
    const { tId, pId1, pId2 } = setupSingles();
    const mId1 = addMatch(tId, { kind: FORMAT.SINGLES, left: pId1, right: pId2 });
    // 左右逆で追加
    const mId2 = addMatch(tId, { kind: FORMAT.SINGLES, left: pId2, right: pId1 });
    expect(mId1).toBe(mId2);
    expect(matchIdsOf(tId)).toHaveLength(1);
  });

  it("シングルス: 別ペアなら別 ID で追加される", () => {
    const { tId, pId1, pId2, pId3 } = setupSingles();
    const mId_ab = addMatch(tId, { kind: FORMAT.SINGLES, left: pId1, right: pId2 });
    const mId_ac = addMatch(tId, { kind: FORMAT.SINGLES, left: pId1, right: pId3 });
    expect(mId_ab).not.toBe(mId_ac);
    expect(matchIdsOf(tId)).toHaveLength(2);
  });

  it("存在しない tournamentId では null を返し match が追加されない", () => {
    const { pId1, pId2 } = setupSingles();
    const mId = useAppStore
      .getState()
      .addManualMatch("ghost-tournament", { kind: FORMAT.SINGLES, left: pId1, right: pId2 });
    expect(mId).toBeNull();
    expect(Object.keys(useAppStore.getState().matches)).toHaveLength(0);
  });

  it("大会形式と違う種別・同一人物・非所属の参加者は null を返す", () => {
    const { tId, pId1, pId2, pId3 } = setupSingles();
    const add = useAppStore.getState().addManualMatch;
    expect(add(tId, { kind: FORMAT.DOUBLES, left: [pId1, pId2], right: [pId3, "x"] })).toBeNull();
    expect(add(tId, { kind: FORMAT.SINGLES, left: pId1, right: pId1 })).toBeNull();
    expect(add(tId, { kind: FORMAT.SINGLES, left: pId1, right: "ghost" })).toBeNull();
    expect(Object.keys(useAppStore.getState().matches)).toHaveLength(0);
  });

  it("ダブルス: ペアサイドで match を追加できる", () => {
    const tId = useAppStore
      .getState()
      .createTournament("ダブルス大会", FORMAT.DOUBLES, "2026-01-01", 5);
    const pId1 = useAppStore.getState().addParticipant(tId, "A");
    const pId2 = useAppStore.getState().addParticipant(tId, "B");
    const pId3 = useAppStore.getState().addParticipant(tId, "C");
    const pId4 = useAppStore.getState().addParticipant(tId, "D");
    const mId = addMatch(tId, { kind: FORMAT.DOUBLES, left: [pId1, pId2], right: [pId3, pId4] });
    const state = useAppStore.getState();
    expect(state.matches[mId]).toBeDefined();
    expect(matchIdsOf(tId)).toContain(mId);
  });
});

describe("setGames / setFirstServer", () => {
  it("ゲーム列と先攻サーバーを更新できる", () => {
    const { tId, pId1, pId2 } = setupSingles();
    const mId = addMatch(tId, { kind: FORMAT.SINGLES, left: pId1, right: pId2 });
    useAppStore.getState().setGames(mId, [gameFromLog(["L", "R"])]);
    useAppStore.getState().setFirstServer(mId, "R");
    const match = useAppStore.getState().matches[mId];
    expect(match.games).toEqual([gameFromLog(["L", "R"])]);
    expect(match.firstServer).toBe("R");
  });

  it("存在しない id では何も起きない", () => {
    useAppStore.getState().setGames("ghost", [gameFromLog(["L"])]);
    useAppStore.getState().setFirstServer("ghost", "R");
    expect(useAppStore.getState().matches.ghost).toBeUndefined();
  });
});

describe("deleteMatch", () => {
  it("matches から消え tournament の試合から除去される", () => {
    const { tId, pId1, pId2 } = setupSingles();
    const mId = addMatch(tId, { kind: FORMAT.SINGLES, left: pId1, right: pId2 });

    useAppStore.getState().deleteMatch(mId);
    const state = useAppStore.getState();

    expect(state.matches[mId]).toBeUndefined();
    expect(matchIdsOf(tId)).not.toContain(mId);
  });

  it("削除後に同じペアを再登録すると新しい match として追加される", () => {
    const { tId, pId1, pId2 } = setupSingles();
    const mId1 = addMatch(tId, { kind: FORMAT.SINGLES, left: pId1, right: pId2 });
    useAppStore.getState().deleteMatch(mId1);
    const mId2 = addMatch(tId, { kind: FORMAT.SINGLES, left: pId1, right: pId2 });
    expect(mId2).not.toBe(mId1);
    expect(useAppStore.getState().matches[mId2]).toBeDefined();
    expect(matchIdsOf(tId)).toContain(mId2);
  });

  it("他の match は残る", () => {
    const { tId, pId1, pId2, pId3 } = setupSingles();
    const mId_ab = addMatch(tId, { kind: FORMAT.SINGLES, left: pId1, right: pId2 });
    const mId_ac = addMatch(tId, { kind: FORMAT.SINGLES, left: pId1, right: pId3 });

    useAppStore.getState().deleteMatch(mId_ab);
    const state = useAppStore.getState();

    expect(state.matches[mId_ab]).toBeUndefined();
    expect(state.matches[mId_ac]).toBeDefined();
    expect(matchIdsOf(tId)).toContain(mId_ac);
    expect(matchIdsOf(tId)).not.toContain(mId_ab);
  });

  it("存在しない id では何も起きない", () => {
    expect(() => useAppStore.getState().deleteMatch("ghost")).not.toThrow();
    expect(useAppStore.getState().matches.ghost).toBeUndefined();
  });
});
