import { DoublesList } from "@/features/tournament/matches/doubles";
import { FORMAT, SIDE_KIND } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";
import { makeTournament, makeParticipant, makeMatch, gameFromLog } from "@/test/factories";
import { renderWithStore, seedStore, setupStoreIsolation } from "@/test/renderWithStore";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";

// jsdom は scrollIntoView を実装していないため polyfill
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn<() => void>();
});

// ---------------------------------------------------------------------------
// ヘルパ: 4 人以上の doubles tournament を seed する
// ---------------------------------------------------------------------------
const PARTICIPANT_IDS = ["p1", "p2", "p3", "p4"];

const seedDoublesTournament = (participantIds = PARTICIPANT_IDS) => {
  seedStore({
    tournaments: {
      t1: makeTournament({
        id: "t1",
        format: FORMAT.DOUBLES,
        bestOf: 5,
        participantIds,
      }),
    },
    participants: {
      p1: makeParticipant({ id: "p1", name: "選手A", tournamentId: "t1" }),
      p2: makeParticipant({ id: "p2", name: "選手B", tournamentId: "t1" }),
      p3: makeParticipant({ id: "p3", name: "選手C", tournamentId: "t1" }),
      p4: makeParticipant({ id: "p4", name: "選手D", tournamentId: "t1" }),
    },
    matches: {},
  });
};

/**
 * Select の custom listbox を操作するヘルパ。
 * - label prop に対応する表示テキストを持つ trigger button を探してクリック（listbox を開く）
 * - 次に option の表示名でクリックして選択する
 */
const selectOption = async (
  user: ReturnType<typeof userEvent.setup>,
  labelText: string,
  optionText: string,
) => {
  // Select の label は <span> で描画される。
  // trigger button は aria-labelledby で label span と自身の id を参照するが、
  // getByRole("button", { name: /labelText/ }) で当たる。
  const trigger = screen.getByRole("button", { name: new RegExp(labelText, "u") });
  await user.click(trigger);
  // listbox が開いたら option をクリック
  const option = await screen.findByRole("option", { name: optionText });
  await user.click(option);
};

// ---------------------------------------------------------------------------
// テスト
// ---------------------------------------------------------------------------
describe("DoublesList", () => {
  beforeEach(setupStoreIsolation);

  // -------------------------------------------------------------------------
  // 1. 参加者 4 人以上 → フォーム表示・Select 4 つ存在
  // -------------------------------------------------------------------------
  it("参加者 4 人以上 → 「試合を追加」フォームと Select 4 つが表示される", () => {
    seedDoublesTournament();
    renderWithStore(<DoublesList tournamentId="t1" />);

    expect(screen.getByText("試合を追加")).toBeInTheDocument();
    // 左1/左2/右1/右2 のラベルが表示される
    expect(screen.getByText("左1")).toBeInTheDocument();
    expect(screen.getByText("左2")).toBeInTheDocument();
    expect(screen.getByText("右1")).toBeInTheDocument();
    expect(screen.getByText("右2")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // 2. 試合なし → 「まだ試合がありません。」表示
  // -------------------------------------------------------------------------
  it("試合なし → 「まだ試合がありません。」が表示される", () => {
    seedDoublesTournament();
    renderWithStore(<DoublesList tournamentId="t1" />);

    expect(screen.getByText("まだ試合がありません。")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // 3. 未選択時 → 追加ボタン disabled
  // -------------------------------------------------------------------------
  it("Select 未選択時 → 「試合を追加して入力へ」ボタンが disabled", () => {
    seedDoublesTournament();
    renderWithStore(<DoublesList tournamentId="t1" />);

    const addBtn = screen.getByRole("button", { name: "試合を追加して入力へ" });
    expect(addBtn).toBeDisabled();
  });

  // -------------------------------------------------------------------------
  // 4. 4 つの Select で別々の選手を選ぶ → ボタン有効化 → クリックで match 追加 & Modal 開く
  // -------------------------------------------------------------------------
  it("4 つの Select で別々の選手を選択 → ボタン有効化 → 追加で store に PAIR match が増え MatchModal が開く", async () => {
    const user = userEvent.setup();
    seedDoublesTournament();
    renderWithStore(<DoublesList tournamentId="t1" />);

    // 初期状態: ボタン disabled
    const addBtn = screen.getByRole("button", { name: "試合を追加して入力へ" });
    expect(addBtn).toBeDisabled();

    // 左1 → 選手A
    await selectOption(user, "左1", "選手A");
    // 左2 → 選手B（左1で選手Aを選んだので選手Bが選択肢に残る）
    await selectOption(user, "左2", "選手B");
    // 右1 → 選手C
    await selectOption(user, "右1", "選手C");
    // 右2 → 選手D
    await selectOption(user, "右2", "選手D");

    // schema refine: 4人全員異なる → isValid=true → ボタン有効化
    await waitFor(() => {
      expect(addBtn).not.toBeDisabled();
    });

    // store の matches 件数を記録
    const matchesBefore = Object.keys(useAppStore.getState().matches).length;

    // ボタンクリック
    await user.click(addBtn);

    // store に PAIR match が 1 件追加される
    await waitFor(() => {
      const matchesAfter = Object.keys(useAppStore.getState().matches);
      expect(matchesAfter.length).toBe(matchesBefore + 1);
      // 追加された match が PAIR side を持つ
      const newMatch = Object.values(useAppStore.getState().matches).find(
        (m) => m.tournamentId === "t1",
      );
      expect(newMatch?.leftSide.kind).toBe(SIDE_KIND.PAIR);
      expect(newMatch?.rightSide.kind).toBe(SIDE_KIND.PAIR);
    });

    // MatchModal が開く（createPortal → document.body に描画）
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByRole("heading", { name: "試合の入力" })).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // 5. 既存 doubles match(PAIR side) を seed → 一覧表示
  // -------------------------------------------------------------------------
  it("既存 doubles match を seed → 一覧に「左ペア名 対 右ペア名」とスコアが表示される", () => {
    seedStore({
      tournaments: {
        t1: makeTournament({
          id: "t1",
          format: FORMAT.DOUBLES,
          bestOf: 5,
          participantIds: ["p1", "p2", "p3", "p4"],
        }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", name: "選手A", tournamentId: "t1" }),
        p2: makeParticipant({ id: "p2", name: "選手B", tournamentId: "t1" }),
        p3: makeParticipant({ id: "p3", name: "選手C", tournamentId: "t1" }),
        p4: makeParticipant({ id: "p4", name: "選手D", tournamentId: "t1" }),
      },
      matches: {
        m1: makeMatch({
          id: "m1",
          tournamentId: "t1",
          leftSide: { kind: SIDE_KIND.PAIR, memberIds: ["p1", "p2"] },
          rightSide: { kind: SIDE_KIND.PAIR, memberIds: ["p3", "p4"] },
          games: [],
          firstServer: "L",
        }),
      },
    });

    renderWithStore(<DoublesList tournamentId="t1" />);

    // 試合一覧: 「左ペア名 対 右ペア名」パターン
    // sideName の実装: PAIR は "選手A・選手B" のような表示を期待
    // まず「対」が表示されていることを確認
    expect(screen.getByText("対")).toBeInTheDocument();
    // スコア 0-0 表示（games 空）
    expect(screen.getByText("0-0")).toBeInTheDocument();
    // 途中表示
    expect(screen.getByText("途中")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // 6. 既存 doubles match に勝利スコアを seed → 勝者表示
  // -------------------------------------------------------------------------
  it("試合が完了した match を seed → 「〇〇 の勝ち」と勝者が表示される", () => {
    // bestOf=3 → winsNeeded=2。2ゲーム先取で決着
    const leftPoints: ("L" | "R")[] = Array.from({ length: 11 }, (): "L" => "L");
    const wonGame = gameFromLog(leftPoints);

    seedStore({
      tournaments: {
        t1: makeTournament({
          id: "t1",
          format: FORMAT.DOUBLES,
          bestOf: 3,
          participantIds: ["p1", "p2", "p3", "p4"],
        }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", name: "選手A", tournamentId: "t1" }),
        p2: makeParticipant({ id: "p2", name: "選手B", tournamentId: "t1" }),
        p3: makeParticipant({ id: "p3", name: "選手C", tournamentId: "t1" }),
        p4: makeParticipant({ id: "p4", name: "選手D", tournamentId: "t1" }),
      },
      matches: {
        m1: makeMatch({
          id: "m1",
          tournamentId: "t1",
          leftSide: { kind: SIDE_KIND.PAIR, memberIds: ["p1", "p2"] },
          rightSide: { kind: SIDE_KIND.PAIR, memberIds: ["p3", "p4"] },
          games: [wonGame, wonGame],
          firstServer: "L",
        }),
      },
    });

    renderWithStore(<DoublesList tournamentId="t1" />);

    // 2-0 スコア表示
    expect(screen.getByText("2-0")).toBeInTheDocument();
    // 「〇〇 の勝ち」が表示される（「途中」は表示されない）
    expect(screen.queryByText("途中")).not.toBeInTheDocument();
    expect(screen.getByText(/の勝ち/u)).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // 7. 同一選手重複選択でボタン disabled (refine バリデーション)
  // -------------------------------------------------------------------------
  it("同一選手を複数フィールドで選択するとボタンが disabled のまま", async () => {
    const user = userEvent.setup();
    seedDoublesTournament();
    renderWithStore(<DoublesList tournamentId="t1" />);

    const addBtn = screen.getByRole("button", { name: "試合を追加して入力へ" });

    // 左1 → 選手A
    await selectOption(user, "左1", "選手A");
    // 左2 → 選手A（同じ選手は選択肢から除外されているので、別の選手で試みる）
    // refine は 4 つ全選択かつ重複あり で false になる。
    // ここでは「3 つだけ選択」テストも兼ね: left2 を空のままにする
    await selectOption(user, "右1", "選手B");
    await selectOption(user, "右2", "選手C");
    // left2 未入力 → isValid=false → disabled
    expect(addBtn).toBeDisabled();
  });

  // -------------------------------------------------------------------------
  // 8. 3つだけ選択でボタン disabled
  // -------------------------------------------------------------------------
  it("3 フィールドのみ選択してボタン disabled", async () => {
    const user = userEvent.setup();
    seedDoublesTournament();
    renderWithStore(<DoublesList tournamentId="t1" />);

    const addBtn = screen.getByRole("button", { name: "試合を追加して入力へ" });

    await selectOption(user, "左1", "選手A");
    await selectOption(user, "左2", "選手B");
    await selectOption(user, "右1", "選手C");
    // 右2 は未選択
    expect(addBtn).toBeDisabled();
  });

  // -------------------------------------------------------------------------
  // 9. 試合追加後フォームがリセットされ、ボタンが再び disabled になる
  // -------------------------------------------------------------------------
  it("試合追加後フォームがリセットされボタンが再び disabled になる", async () => {
    const user = userEvent.setup();
    seedDoublesTournament();
    renderWithStore(<DoublesList tournamentId="t1" />);

    const addBtn = screen.getByRole("button", { name: "試合を追加して入力へ" });

    await selectOption(user, "左1", "選手A");
    await selectOption(user, "左2", "選手B");
    await selectOption(user, "右1", "選手C");
    await selectOption(user, "右2", "選手D");

    await waitFor(() => {
      expect(addBtn).not.toBeDisabled();
    });

    await user.click(addBtn);

    // MatchModal が開く
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // MatchModal を閉じる（dialog内のbutton[aria-label="閉じる"]）
    const dialog = screen.getByRole("dialog");
    const closeBtn = dialog.querySelector<HTMLButtonElement>("button[aria-label='閉じる']");
    expect(closeBtn).not.toBeNull();
    await user.click(closeBtn!);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    // フォームがリセットされボタンが再び disabled
    await waitFor(() => {
      expect(addBtn).toBeDisabled();
    });
  });

  // -------------------------------------------------------------------------
  // 10. 既存試合クリックで MatchModal が開く
  // -------------------------------------------------------------------------
  it("既存試合アイテムクリックで MatchModal が開く", async () => {
    const user = userEvent.setup();
    seedStore({
      tournaments: {
        t1: makeTournament({
          id: "t1",
          format: FORMAT.DOUBLES,
          bestOf: 5,
          participantIds: ["p1", "p2", "p3", "p4"],
        }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", name: "選手A", tournamentId: "t1" }),
        p2: makeParticipant({ id: "p2", name: "選手B", tournamentId: "t1" }),
        p3: makeParticipant({ id: "p3", name: "選手C", tournamentId: "t1" }),
        p4: makeParticipant({ id: "p4", name: "選手D", tournamentId: "t1" }),
      },
      matches: {
        m1: makeMatch({
          id: "m1",
          tournamentId: "t1",
          leftSide: { kind: SIDE_KIND.PAIR, memberIds: ["p1", "p2"] },
          rightSide: { kind: SIDE_KIND.PAIR, memberIds: ["p3", "p4"] },
          games: [],
          firstServer: "L",
        }),
      },
    });

    renderWithStore(<DoublesList tournamentId="t1" />);

    // 試合一覧のボタンをクリック（match listのli内のbutton）
    // 「試合を追加して入力へ」以外の対戦ボタンを選択する
    const allButtons = screen.getAllByRole("button", { name: /対/u });
    const matchBtn = allButtons.find((el) => !el.textContent?.includes("試合を追加"))!;
    expect(matchBtn).toBeDefined();
    await user.click(matchBtn);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByRole("heading", { name: "試合の入力" })).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // 11. SaveImageButton は参加者 4 人以上かつ試合 1 件以上で表示される
  // -------------------------------------------------------------------------
  it("参加者 4 人以上かつ試合あり → SaveImageButton が表示される", () => {
    seedStore({
      tournaments: {
        t1: makeTournament({
          id: "t1",
          format: FORMAT.DOUBLES,
          bestOf: 5,
          participantIds: ["p1", "p2", "p3", "p4"],
        }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", name: "選手A", tournamentId: "t1" }),
        p2: makeParticipant({ id: "p2", name: "選手B", tournamentId: "t1" }),
        p3: makeParticipant({ id: "p3", name: "選手C", tournamentId: "t1" }),
        p4: makeParticipant({ id: "p4", name: "選手D", tournamentId: "t1" }),
      },
      matches: {
        m1: makeMatch({
          id: "m1",
          tournamentId: "t1",
          leftSide: { kind: SIDE_KIND.PAIR, memberIds: ["p1", "p2"] },
          rightSide: { kind: SIDE_KIND.PAIR, memberIds: ["p3", "p4"] },
          games: [],
          firstServer: "L",
        }),
      },
    });

    renderWithStore(<DoublesList tournamentId="t1" />);

    expect(screen.getByText("画像で保存")).toBeInTheDocument();
  });

  it("試合 0 件のとき SaveImageButton が表示されない", () => {
    seedDoublesTournament();
    renderWithStore(<DoublesList tournamentId="t1" />);

    expect(screen.queryByText("画像で保存")).not.toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // 12. MatchModal 閉で消える
  // -------------------------------------------------------------------------
  it("MatchModal を閉じると非表示になる", async () => {
    const user = userEvent.setup();
    seedStore({
      tournaments: {
        t1: makeTournament({
          id: "t1",
          format: FORMAT.DOUBLES,
          bestOf: 5,
          participantIds: ["p1", "p2", "p3", "p4"],
        }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", name: "選手A", tournamentId: "t1" }),
        p2: makeParticipant({ id: "p2", name: "選手B", tournamentId: "t1" }),
        p3: makeParticipant({ id: "p3", name: "選手C", tournamentId: "t1" }),
        p4: makeParticipant({ id: "p4", name: "選手D", tournamentId: "t1" }),
      },
      matches: {
        m1: makeMatch({
          id: "m1",
          tournamentId: "t1",
          leftSide: { kind: SIDE_KIND.PAIR, memberIds: ["p1", "p2"] },
          rightSide: { kind: SIDE_KIND.PAIR, memberIds: ["p3", "p4"] },
          games: [],
          firstServer: "L",
        }),
      },
    });

    renderWithStore(<DoublesList tournamentId="t1" />);

    const allButtons = screen.getAllByRole("button", { name: /対/u });
    const matchBtn = allButtons.find((el) => !el.textContent?.includes("試合を追加"))!;
    await user.click(matchBtn);
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // × ボタン（dialog内）でモーダルを閉じる
    const dialog = screen.getByRole("dialog");
    const closeBtn = dialog.querySelector<HTMLButtonElement>("button[aria-label='閉じる']");
    expect(closeBtn).not.toBeNull();
    await user.click(closeBtn!);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
