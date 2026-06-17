import { FORMAT, SIDE_KIND } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";
import { beforeEach, describe, expect, it } from "vitest";

beforeEach(() => {
  useAppStore.getState().resetAll();
});

describe("createTournament", () => {
  it("生成後 tournaments に追加され currentTournamentId が新IDになる", () => {
    const id = useAppStore.getState().createTournament("春季大会", FORMAT.SINGLES, "2026-04-01", 5);
    const state = useAppStore.getState();
    expect(state.tournaments[id]).toBeDefined();
    expect(state.tournaments[id].name).toBe("春季大会");
    expect(state.tournaments[id].format).toBe(FORMAT.SINGLES);
    expect(state.tournaments[id].bestOf).toBe(5);
    expect(state.currentTournamentId).toBe(id);
  });

  it("複数大会を作るたびに currentTournamentId が最後のIDになる", () => {
    useAppStore.getState().createTournament("A大会", FORMAT.SINGLES, "2026-01-01", 3);
    const id2 = useAppStore.getState().createTournament("B大会", FORMAT.DOUBLES, "2026-02-01", 5);
    expect(useAppStore.getState().currentTournamentId).toBe(id2);
  });

  it("participantIds / matchIds は空で初期化される", () => {
    const id = useAppStore
      .getState()
      .createTournament("初期化確認", FORMAT.SINGLES, "2026-01-01", 3);
    const t = useAppStore.getState().tournaments[id];
    expect(t.participantIds).toEqual([]);
    expect(t.matchIds).toEqual([]);
  });
});

describe("updateTournament", () => {
  it("name / date を部分更新できる", () => {
    const id = useAppStore.getState().createTournament("旧名", FORMAT.SINGLES, "2026-01-01", 3);
    useAppStore.getState().updateTournament(id, { name: "新名", date: "2026-06-01" });
    const t = useAppStore.getState().tournaments[id];
    expect(t.name).toBe("新名");
    expect(t.date).toBe("2026-06-01");
  });

  it("存在しない id では何も起きない(エラーなし)", () => {
    useAppStore.getState().updateTournament("non-existent", { name: "ghost" });
    expect(Object.keys(useAppStore.getState().tournaments)).toHaveLength(0);
  });
});

describe("deleteTournament", () => {
  it("大会・紐づく participants・matches が全削除される(孤児なし)", () => {
    const tId = useAppStore
      .getState()
      .createTournament("削除テスト", FORMAT.SINGLES, "2026-01-01", 5);
    const pId1 = useAppStore.getState().addParticipant(tId, "選手A");
    const pId2 = useAppStore.getState().addParticipant(tId, "選手B");
    const mId = useAppStore
      .getState()
      .addManualMatch(
        tId,
        { kind: SIDE_KIND.SINGLE, participantId: pId1 },
        { kind: SIDE_KIND.SINGLE, participantId: pId2 },
      );

    useAppStore.getState().deleteTournament(tId);
    const state = useAppStore.getState();

    expect(state.tournaments[tId]).toBeUndefined();
    expect(state.participants[pId1]).toBeUndefined();
    expect(state.participants[pId2]).toBeUndefined();
    expect(state.matches[mId]).toBeUndefined();
  });

  it("deleteTournament 後 currentTournamentId が null になる", () => {
    const tId = useAppStore
      .getState()
      .createTournament("削除後null", FORMAT.SINGLES, "2026-01-01", 3);
    expect(useAppStore.getState().currentTournamentId).toBe(tId);
    useAppStore.getState().deleteTournament(tId);
    expect(useAppStore.getState().currentTournamentId).toBeNull();
  });

  it("別の大会が current のときは currentTournamentId は変わらない", () => {
    const t1 = useAppStore.getState().createTournament("大会1", FORMAT.SINGLES, "2026-01-01", 3);
    const t2 = useAppStore.getState().createTournament("大会2", FORMAT.SINGLES, "2026-02-01", 3);
    useAppStore.getState().setCurrentTournament(t1);
    useAppStore.getState().deleteTournament(t2);
    expect(useAppStore.getState().currentTournamentId).toBe(t1);
  });

  it("存在しない id では何も起きない", () => {
    const tId = useAppStore
      .getState()
      .createTournament("残る大会", FORMAT.SINGLES, "2026-01-01", 3);
    useAppStore.getState().deleteTournament("ghost");
    expect(useAppStore.getState().tournaments[tId]).toBeDefined();
  });
});

describe("resetTournament", () => {
  it("matchIds が空になり紐づく matches が削除される", () => {
    const tId = useAppStore
      .getState()
      .createTournament("リセット大会", FORMAT.SINGLES, "2026-01-01", 5);
    const pId1 = useAppStore.getState().addParticipant(tId, "太郎");
    const pId2 = useAppStore.getState().addParticipant(tId, "花子");
    const mId = useAppStore
      .getState()
      .addManualMatch(
        tId,
        { kind: SIDE_KIND.SINGLE, participantId: pId1 },
        { kind: SIDE_KIND.SINGLE, participantId: pId2 },
      );

    useAppStore.getState().resetTournament(tId);
    const state = useAppStore.getState();

    expect(state.tournaments[tId].matchIds).toEqual([]);
    expect(state.matches[mId]).toBeUndefined();
  });

  it("participants はリセット後も残る", () => {
    const tId = useAppStore
      .getState()
      .createTournament("参加者残留", FORMAT.SINGLES, "2026-01-01", 3);
    const pId = useAppStore.getState().addParticipant(tId, "残る選手");
    useAppStore.getState().resetTournament(tId);
    const state = useAppStore.getState();
    expect(state.participants[pId]).toBeDefined();
    expect(state.tournaments[tId].participantIds).toContain(pId);
  });

  it("存在しない id では何も起きない(エラーなし)", () => {
    expect(() => useAppStore.getState().resetTournament("ghost")).not.toThrow();
    expect(useAppStore.getState().tournaments.ghost).toBeUndefined();
  });
});

describe("setCurrentTournament", () => {
  it("null をセットできる", () => {
    useAppStore.getState().createTournament("X", FORMAT.SINGLES, "2026-01-01", 3);
    useAppStore.getState().setCurrentTournament(null);
    expect(useAppStore.getState().currentTournamentId).toBeNull();
  });
});

describe("resetAll", () => {
  it("全データが初期状態に戻る", () => {
    useAppStore.getState().createTournament("全消し", FORMAT.SINGLES, "2026-01-01", 5);
    useAppStore.getState().resetAll();
    const state = useAppStore.getState();
    expect(state.tournaments).toEqual({});
    expect(state.participants).toEqual({});
    expect(state.matches).toEqual({});
    expect(state.currentTournamentId).toBeNull();
  });
});
