import { FORMAT, SIDE_KIND, type Format } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";
import { beforeEach, describe, expect, it } from "vitest";

beforeEach(() => {
  useAppStore.getState().resetAll();
});

/** テスト用に大会を1つ作り、ID を返すヘルパー */
function setupTournament(format: Format = FORMAT.SINGLES) {
  return useAppStore.getState().createTournament("テスト大会", format, "2026-01-01", 5);
}

describe("addParticipant", () => {
  it("name が trim される", () => {
    const tId = setupTournament();
    const pId = useAppStore.getState().addParticipant(tId, "  田中  ");
    expect(useAppStore.getState().participants[pId].name).toBe("田中");
  });

  it("affiliation なしで追加できる", () => {
    const tId = setupTournament();
    const pId = useAppStore.getState().addParticipant(tId, "山田");
    expect(useAppStore.getState().participants[pId].affiliation).toBeUndefined();
  });

  it("affiliation ありで追加できる", () => {
    const tId = setupTournament();
    const pId = useAppStore.getState().addParticipant(tId, "田中", "卓球クラブ");
    expect(useAppStore.getState().participants[pId].affiliation).toBe("卓球クラブ");
  });

  it("tournament.participantIds に追加される", () => {
    const tId = setupTournament();
    const pId = useAppStore.getState().addParticipant(tId, "佐藤");
    expect(useAppStore.getState().tournaments[tId].participantIds).toContain(pId);
  });

  it("存在しない tournamentId では何も起きない(参加者が追加されない)", () => {
    const pId = useAppStore.getState().addParticipant("ghost-tournament", "幻の選手");
    const state = useAppStore.getState();
    // 参加者オブジェクトは生成されても tournaments には載らない(ID は返るが state は変わらない)
    // ソース実装: tournament が存在しない場合 set の中で return するため participants にも追加されない
    expect(state.participants[pId]).toBeUndefined();
  });

  it("同じ大会に複数参加者を追加できる", () => {
    const tId = setupTournament();
    const pId1 = useAppStore.getState().addParticipant(tId, "A");
    const pId2 = useAppStore.getState().addParticipant(tId, "B");
    const participantIds = useAppStore.getState().tournaments[tId].participantIds;
    expect(participantIds).toContain(pId1);
    expect(participantIds).toContain(pId2);
    expect(participantIds).toHaveLength(2);
  });
});

describe("updateParticipant", () => {
  it("name を更新すると trim される", () => {
    const tId = setupTournament();
    const pId = useAppStore.getState().addParticipant(tId, "旧名");
    useAppStore.getState().updateParticipant(pId, { name: "  新名  " });
    expect(useAppStore.getState().participants[pId].name).toBe("新名");
  });

  it("存在しない id では何も起きない", () => {
    expect(() =>
      useAppStore.getState().updateParticipant("ghost", { name: "ゴースト" }),
    ).not.toThrow();
    expect(useAppStore.getState().participants.ghost).toBeUndefined();
  });
});

describe("removeParticipant", () => {
  it("participants から削除され tournament.participantIds から除去される", () => {
    const tId = setupTournament();
    const pId = useAppStore.getState().addParticipant(tId, "削除対象");
    useAppStore.getState().removeParticipant(tId, pId);
    const state = useAppStore.getState();
    expect(state.participants[pId]).toBeUndefined();
    expect(state.tournaments[tId].participantIds).not.toContain(pId);
  });

  it("シングルス: 削除対象の参加者が leftSide にいる match が全削除される", () => {
    const tId = setupTournament();
    const pId1 = useAppStore.getState().addParticipant(tId, "A");
    const pId2 = useAppStore.getState().addParticipant(tId, "B");
    const mId = useAppStore
      .getState()
      .addManualMatch(
        tId,
        { kind: SIDE_KIND.SINGLE, participantId: pId1 },
        { kind: SIDE_KIND.SINGLE, participantId: pId2 },
      );

    useAppStore.getState().removeParticipant(tId, pId1);
    const state = useAppStore.getState();

    expect(state.matches[mId]).toBeUndefined();
    expect(state.tournaments[tId].matchIds).not.toContain(mId);
  });

  it("シングルス: 削除対象の参加者が rightSide にいる match が全削除される", () => {
    const tId = setupTournament();
    const pId1 = useAppStore.getState().addParticipant(tId, "A");
    const pId2 = useAppStore.getState().addParticipant(tId, "B");
    const mId = useAppStore
      .getState()
      .addManualMatch(
        tId,
        { kind: SIDE_KIND.SINGLE, participantId: pId1 },
        { kind: SIDE_KIND.SINGLE, participantId: pId2 },
      );

    useAppStore.getState().removeParticipant(tId, pId2);
    const state = useAppStore.getState();

    expect(state.matches[mId]).toBeUndefined();
    expect(state.tournaments[tId].matchIds).not.toContain(mId);
  });

  it("ペア: memberIds に含まれる場合も match が削除される", () => {
    const tId = setupTournament(FORMAT.DOUBLES);
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

    // pId2 を削除 → ペアに含まれるため match も削除
    useAppStore.getState().removeParticipant(tId, pId2);
    const state = useAppStore.getState();

    expect(state.matches[mId]).toBeUndefined();
    expect(state.tournaments[tId].matchIds).not.toContain(mId);
  });

  it("無関係な match は残る", () => {
    const tId = setupTournament();
    const pId1 = useAppStore.getState().addParticipant(tId, "A");
    const pId2 = useAppStore.getState().addParticipant(tId, "B");
    const pId3 = useAppStore.getState().addParticipant(tId, "C");
    // A vs B を追加
    const mId_ab = useAppStore
      .getState()
      .addManualMatch(
        tId,
        { kind: SIDE_KIND.SINGLE, participantId: pId1 },
        { kind: SIDE_KIND.SINGLE, participantId: pId2 },
      );
    // B vs C を追加
    const mId_bc = useAppStore
      .getState()
      .addManualMatch(
        tId,
        { kind: SIDE_KIND.SINGLE, participantId: pId2 },
        { kind: SIDE_KIND.SINGLE, participantId: pId3 },
      );

    // A を削除 → A vs B は消えるが B vs C は残る
    useAppStore.getState().removeParticipant(tId, pId1);
    const state = useAppStore.getState();

    expect(state.matches[mId_ab]).toBeUndefined();
    expect(state.matches[mId_bc]).toBeDefined();
    expect(state.tournaments[tId].matchIds).toContain(mId_bc);
    expect(state.tournaments[tId].matchIds).not.toContain(mId_ab);
  });

  it("存在しない tournamentId では何も起きない", () => {
    const tId = setupTournament();
    const pId = useAppStore.getState().addParticipant(tId, "A");
    useAppStore.getState().removeParticipant("ghost-tournament", pId);
    // 何も変化しない
    expect(useAppStore.getState().participants[pId]).toBeDefined();
  });
});
