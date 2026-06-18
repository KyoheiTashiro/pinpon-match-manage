import { matchesOf } from "@/store/selectors";
import { FORMAT, SIDE_KIND } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";
import { beforeEach, describe, expect, it } from "vitest";

const matchIdsOf = (tId: string) => matchesOf(useAppStore.getState().matches, tId).map((m) => m.id);

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
    const mId = useAppStore
      .getState()
      .addManualMatch(
        tId,
        { kind: SIDE_KIND.SINGLE, participantId: pId1 },
        { kind: SIDE_KIND.SINGLE, participantId: pId2 },
      );
    const state = useAppStore.getState();
    expect(state.matches[mId]).toBeDefined();
    expect(matchIdsOf(tId)).toContain(mId);
  });

  it("シングルス重複検出: 同一2人を再度追加すると同じ ID が返り match は1件のみ", () => {
    const { tId, pId1, pId2 } = setupSingles();
    const mId1 = useAppStore
      .getState()
      .addManualMatch(
        tId,
        { kind: SIDE_KIND.SINGLE, participantId: pId1 },
        { kind: SIDE_KIND.SINGLE, participantId: pId2 },
      );
    const mId2 = useAppStore
      .getState()
      .addManualMatch(
        tId,
        { kind: SIDE_KIND.SINGLE, participantId: pId1 },
        { kind: SIDE_KIND.SINGLE, participantId: pId2 },
      );
    expect(mId1).toBe(mId2);
    expect(matchIdsOf(tId)).toHaveLength(1);
  });

  it("シングルス重複検出: 左右入れ替えても同じ ID が返り match は1件のみ", () => {
    const { tId, pId1, pId2 } = setupSingles();
    const mId1 = useAppStore
      .getState()
      .addManualMatch(
        tId,
        { kind: SIDE_KIND.SINGLE, participantId: pId1 },
        { kind: SIDE_KIND.SINGLE, participantId: pId2 },
      );
    // 左右逆で追加
    const mId2 = useAppStore
      .getState()
      .addManualMatch(
        tId,
        { kind: SIDE_KIND.SINGLE, participantId: pId2 },
        { kind: SIDE_KIND.SINGLE, participantId: pId1 },
      );
    expect(mId1).toBe(mId2);
    expect(matchIdsOf(tId)).toHaveLength(1);
  });

  it("シングルス: 別ペアなら別 ID で追加される", () => {
    const { tId, pId1, pId2, pId3 } = setupSingles();
    const mId_ab = useAppStore
      .getState()
      .addManualMatch(
        tId,
        { kind: SIDE_KIND.SINGLE, participantId: pId1 },
        { kind: SIDE_KIND.SINGLE, participantId: pId2 },
      );
    const mId_ac = useAppStore
      .getState()
      .addManualMatch(
        tId,
        { kind: SIDE_KIND.SINGLE, participantId: pId1 },
        { kind: SIDE_KIND.SINGLE, participantId: pId3 },
      );
    expect(mId_ab).not.toBe(mId_ac);
    expect(matchIdsOf(tId)).toHaveLength(2);
  });

  it("存在しない tournamentId では match が追加されない", () => {
    const { pId1, pId2 } = setupSingles();
    const mId = useAppStore
      .getState()
      .addManualMatch(
        "ghost-tournament",
        { kind: SIDE_KIND.SINGLE, participantId: pId1 },
        { kind: SIDE_KIND.SINGLE, participantId: pId2 },
      );
    // ID は返るが state に反映されない
    expect(useAppStore.getState().matches[mId]).toBeUndefined();
  });

  it("ダブルス: ペアサイドで match を追加できる", () => {
    const tId = useAppStore
      .getState()
      .createTournament("ダブルス大会", FORMAT.DOUBLES, "2026-01-01", 5);
    const pId1 = useAppStore.getState().addParticipant(tId, "A");
    const pId2 = useAppStore.getState().addParticipant(tId, "B");
    const pId3 = useAppStore.getState().addParticipant(tId, "C");
    const pId4 = useAppStore.getState().addParticipant(tId, "D");
    const mId = useAppStore
      .getState()
      .addManualMatch(
        tId,
        { kind: SIDE_KIND.PAIR, memberIds: [pId1, pId2] },
        { kind: SIDE_KIND.PAIR, memberIds: [pId3, pId4] },
      );
    const state = useAppStore.getState();
    expect(state.matches[mId]).toBeDefined();
    expect(matchIdsOf(tId)).toContain(mId);
  });
});

describe("updateMatch", () => {
  it("note を更新できる", () => {
    const { tId, pId1, pId2 } = setupSingles();
    const mId = useAppStore
      .getState()
      .addManualMatch(
        tId,
        { kind: SIDE_KIND.SINGLE, participantId: pId1 },
        { kind: SIDE_KIND.SINGLE, participantId: pId2 },
      );
    useAppStore.getState().updateMatch(mId, { note: "メモ" });
    expect(useAppStore.getState().matches[mId].note).toBe("メモ");
  });

  it("存在しない id では何も起きない", () => {
    expect(() => useAppStore.getState().updateMatch("ghost", { note: "幻" })).not.toThrow();
    expect(useAppStore.getState().matches.ghost).toBeUndefined();
  });
});

describe("deleteMatch", () => {
  it("matches から消え tournament の試合から除去される", () => {
    const { tId, pId1, pId2 } = setupSingles();
    const mId = useAppStore
      .getState()
      .addManualMatch(
        tId,
        { kind: SIDE_KIND.SINGLE, participantId: pId1 },
        { kind: SIDE_KIND.SINGLE, participantId: pId2 },
      );

    useAppStore.getState().deleteMatch(mId);
    const state = useAppStore.getState();

    expect(state.matches[mId]).toBeUndefined();
    expect(matchIdsOf(tId)).not.toContain(mId);
  });

  it("削除後に同じペアを再登録すると新しい match として追加される", () => {
    const { tId, pId1, pId2 } = setupSingles();
    const mId1 = useAppStore
      .getState()
      .addManualMatch(
        tId,
        { kind: SIDE_KIND.SINGLE, participantId: pId1 },
        { kind: SIDE_KIND.SINGLE, participantId: pId2 },
      );
    useAppStore.getState().deleteMatch(mId1);
    const mId2 = useAppStore
      .getState()
      .addManualMatch(
        tId,
        { kind: SIDE_KIND.SINGLE, participantId: pId1 },
        { kind: SIDE_KIND.SINGLE, participantId: pId2 },
      );
    expect(mId2).not.toBe(mId1);
    expect(useAppStore.getState().matches[mId2]).toBeDefined();
    expect(matchIdsOf(tId)).toContain(mId2);
  });

  it("他の match は残る", () => {
    const { tId, pId1, pId2, pId3 } = setupSingles();
    const mId_ab = useAppStore
      .getState()
      .addManualMatch(
        tId,
        { kind: SIDE_KIND.SINGLE, participantId: pId1 },
        { kind: SIDE_KIND.SINGLE, participantId: pId2 },
      );
    const mId_ac = useAppStore
      .getState()
      .addManualMatch(
        tId,
        { kind: SIDE_KIND.SINGLE, participantId: pId1 },
        { kind: SIDE_KIND.SINGLE, participantId: pId3 },
      );

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
