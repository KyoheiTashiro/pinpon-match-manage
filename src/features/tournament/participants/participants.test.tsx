import { ParticipantsTab } from "@/features/tournament/participants";
import { makeTournament, makeParticipant } from "@/test/factories";
import { renderWithStore, seedStore, setupStoreIsolation } from "@/test/renderWithStore";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";

const ROUTE_PATH = "/tournaments/:tournamentId/participants";
const INITIAL_ENTRY = "/tournaments/t1/participants";

const renderParticipants = () =>
  renderWithStore(<ParticipantsTab />, {
    initialEntries: [INITIAL_ENTRY],
    routePath: ROUTE_PATH,
  });

describe("ParticipantsTab", () => {
  beforeEach(setupStoreIsolation);

  beforeEach(() => {
    // 各テストで tournament t1 を seed
    seedStore({
      tournaments: {
        t1: makeTournament({ id: "t1" }),
      },
    });
  });

  it("空の参加者名では追加できない", () => {
    renderParticipants();

    // 名前を入力していない → "追加" ボタンが disabled
    const addBtn = screen.getByRole("button", { name: "追加" });
    expect(addBtn).toBeDisabled();
  });

  it("参加者を追加すると一覧に表示される", async () => {
    renderParticipants();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("参加者名"), "山田太郎");

    const addBtn = screen.getByRole("button", { name: "追加" });
    expect(addBtn).not.toBeDisabled();
    await user.click(addBtn);

    expect(await screen.findByText("山田太郎")).toBeInTheDocument();
  });

  it("参加者名を編集して保存できる", async () => {
    seedStore({
      tournaments: {
        t1: makeTournament({ id: "t1", participantIds: ["p1"] }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", tournamentId: "t1", name: "選手A" }),
      },
    });

    renderParticipants();
    const user = userEvent.setup();

    // "編集" ボタンをクリック
    await user.click(screen.getByRole("button", { name: "編集" }));

    // 編集 input が表示され、現在の名前がセットされている
    const editInput = screen.getByLabelText("参加者名を編集");
    await user.clear(editInput);
    await user.type(editInput, "選手B");

    // 保存
    const saveBtn = screen.getByRole("button", { name: "保存" });
    expect(saveBtn).not.toBeDisabled();
    await user.click(saveBtn);

    // "選手B" が表示されていること
    expect(await screen.findByText("選手B")).toBeInTheDocument();
    expect(screen.queryByText("選手A")).not.toBeInTheDocument();
  });

  it("編集キャンセルで元の名前のまま", async () => {
    seedStore({
      tournaments: {
        t1: makeTournament({ id: "t1", participantIds: ["p1"] }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", tournamentId: "t1", name: "選手A" }),
      },
    });

    renderParticipants();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "編集" }));

    const editInput = screen.getByLabelText("参加者名を編集");
    await user.clear(editInput);
    await user.type(editInput, "選手Z");

    // キャンセル（やめる）
    await user.click(screen.getByRole("button", { name: "やめる" }));

    // 元の "選手A" が残っていること
    expect(await screen.findByText("選手A")).toBeInTheDocument();
    expect(screen.queryByText("選手Z")).not.toBeInTheDocument();
  });

  it("参加者削除: ConfirmModal確定で消える", async () => {
    seedStore({
      tournaments: {
        t1: makeTournament({ id: "t1", participantIds: ["p1"] }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", tournamentId: "t1", name: "選手A" }),
      },
    });

    renderParticipants();
    const user = userEvent.setup();

    // 削除ボタンをクリック
    await user.click(screen.getByRole("button", { name: "削除" }));

    // ConfirmModal が開く
    await waitFor(() => {
      expect(document.querySelector("dialog")?.open).toBe(true);
    });

    // "削除する" で確定
    await user.click(screen.getByRole("button", { name: "削除する" }));

    await waitFor(() => {
      expect(screen.queryByText("選手A")).not.toBeInTheDocument();
    });
  });

  it("参加者削除: ConfirmModalキャンセルで残る", async () => {
    seedStore({
      tournaments: {
        t1: makeTournament({ id: "t1", participantIds: ["p1"] }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", tournamentId: "t1", name: "選手A" }),
      },
    });

    renderParticipants();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "削除" }));

    await waitFor(() => {
      expect(document.querySelector("dialog")?.open).toBe(true);
    });

    // "やめる" でキャンセル
    await user.click(screen.getByRole("button", { name: "やめる" }));

    // "選手A" が残っていること
    await waitFor(() => {
      expect(screen.getByText("選手A")).toBeInTheDocument();
    });
  });

  it("名前 10 文字超でバリデーションエラーが表示される", async () => {
    renderParticipants();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("参加者名"), "あ".repeat(11));

    await waitFor(() => {
      expect(screen.getByText("名前は10文字以内で入力してください")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "追加" })).toBeDisabled();
  });

  it("参加者 0 人のとき「まだ参加者がいません。」が表示される", () => {
    renderParticipants();

    expect(screen.getByText("まだ参加者がいません。")).toBeInTheDocument();
  });

  it("参加者数が「参加者（N人）」として表示される", () => {
    seedStore({
      tournaments: {
        t1: makeTournament({ id: "t1", participantIds: ["p1", "p2", "p3"] }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", tournamentId: "t1", name: "選手A" }),
        p2: makeParticipant({ id: "p2", tournamentId: "t1", name: "選手B" }),
        p3: makeParticipant({ id: "p3", tournamentId: "t1", name: "選手C" }),
      },
    });

    renderParticipants();

    expect(screen.getByText("参加者（3人）", { exact: false })).toBeInTheDocument();
  });

  it("編集中に空入力にすると保存ボタンが disabled になる", async () => {
    seedStore({
      tournaments: {
        t1: makeTournament({ id: "t1", participantIds: ["p1"] }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", tournamentId: "t1", name: "選手A" }),
      },
    });

    renderParticipants();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "編集" }));
    const editInput = screen.getByLabelText("参加者名を編集");

    // 全消し
    await user.clear(editInput);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
    });
  });

  it("編集フォームに現在の名前が初期表示される", async () => {
    seedStore({
      tournaments: {
        t1: makeTournament({ id: "t1", participantIds: ["p1"] }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", tournamentId: "t1", name: "選手Xyz" }),
      },
    });

    renderParticipants();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "編集" }));

    expect(screen.getByLabelText("参加者名を編集")).toHaveValue("選手Xyz");
  });

  it("追加成功後フォームがリセットされる（入力欄が空になる）", async () => {
    renderParticipants();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("参加者名"), "山田太郎");
    await user.click(screen.getByRole("button", { name: "追加" }));

    await waitFor(() => {
      expect(screen.getByText("山田太郎")).toBeInTheDocument();
    });

    // 入力欄がリセットされ空になっている
    expect(screen.getByLabelText("参加者名")).toHaveValue("");
  });

  it("複数参加者のうち対象のみ削除される", async () => {
    seedStore({
      tournaments: {
        t1: makeTournament({ id: "t1", participantIds: ["p1", "p2"] }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", tournamentId: "t1", name: "選手A" }),
        p2: makeParticipant({ id: "p2", tournamentId: "t1", name: "選手B" }),
      },
    });

    renderParticipants();
    const user = userEvent.setup();

    // 削除ボタンは複数あるので最初のものをクリック（選手Aの削除）
    const deleteButtons = screen.getAllByRole("button", { name: "削除" });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(document.querySelector("dialog")?.open).toBe(true);
    });

    await user.click(screen.getByRole("button", { name: "削除する" }));

    await waitFor(() => {
      // 選手Aが消えている
      expect(screen.queryByText("選手A")).not.toBeInTheDocument();
      // 選手Bは残っている
      expect(screen.getByText("選手B")).toBeInTheDocument();
    });
  });

  it("tournamentId がない場合は null を返す（何も描画されない）", () => {
    // routePath を指定せず、useParams が tournamentId を解決できない状態
    renderWithStore(<ParticipantsTab />, {
      initialEntries: ["/"],
    });

    expect(screen.queryByText("参加者")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("参加者名")).not.toBeInTheDocument();
  });

  describe("過去参加者ピッカー", () => {
    it("過去の参加者がいない場合「過去から選ぶ」ボタンが disabled", () => {
      renderParticipants();

      const pastBtn = screen.getByRole("button", { name: "過去から選ぶ" });
      expect(pastBtn).toBeDisabled();
    });

    it("過去の参加者がいる場合「過去から選ぶ」ボタンが有効", () => {
      seedStore({
        tournaments: {
          t1: makeTournament({ id: "t1" }),
          t2: makeTournament({ id: "t2", participantIds: ["p2"] }),
        },
        participants: {
          p2: makeParticipant({ id: "p2", tournamentId: "t2", name: "選手X" }),
        },
      });

      renderParticipants();

      const pastBtn = screen.getByRole("button", { name: "過去から選ぶ" });
      expect(pastBtn).not.toBeDisabled();
    });

    it("「過去から選ぶ」ボタンクリックでモーダルが開く", async () => {
      seedStore({
        tournaments: {
          t1: makeTournament({ id: "t1" }),
          t2: makeTournament({ id: "t2", participantIds: ["p2"] }),
        },
        participants: {
          p2: makeParticipant({ id: "p2", tournamentId: "t2", name: "選手X" }),
        },
      });

      renderParticipants();
      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: "過去から選ぶ" }));

      await waitFor(() => {
        expect(document.querySelector("dialog[open]")).toBeInTheDocument();
      });
      expect(screen.getByText("過去から選ぶ", { selector: "h2" })).toBeInTheDocument();
    });

    it("候補を選んで追加するとt1の参加者に加わる", async () => {
      seedStore({
        tournaments: {
          t1: makeTournament({ id: "t1" }),
          t2: makeTournament({ id: "t2", participantIds: ["p2"] }),
        },
        participants: {
          p2: makeParticipant({ id: "p2", tournamentId: "t2", name: "選手X" }),
        },
      });

      renderParticipants();
      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: "過去から選ぶ" }));

      await waitFor(() => {
        expect(document.querySelector("dialog[open]")).toBeInTheDocument();
      });

      // チェックボックスをオン
      await user.click(screen.getByRole("checkbox", { name: /選手X/u }));

      // 追加ボタンをクリック
      await user.click(screen.getByRole("button", { name: "追加" }));

      await waitFor(() => {
        expect(screen.getByText("選手X")).toBeInTheDocument();
      });
    });

    it("既に追加済みの参加者は disabled + 「追加済み」表示", async () => {
      seedStore({
        tournaments: {
          t1: makeTournament({ id: "t1", participantIds: ["p1"] }),
          t2: makeTournament({ id: "t2", participantIds: ["p2"] }),
        },
        participants: {
          p1: makeParticipant({ id: "p1", tournamentId: "t1", name: "選手X" }),
          p2: makeParticipant({ id: "p2", tournamentId: "t2", name: "選手X" }),
        },
      });

      renderParticipants();
      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: "過去から選ぶ" }));

      await waitFor(() => {
        expect(document.querySelector("dialog[open]")).toBeInTheDocument();
      });

      const checkbox = screen.getByRole("checkbox", { name: /選手X/u });
      expect(checkbox).toBeDisabled();
      expect(screen.getByText("追加済み")).toBeInTheDocument();
    });

    it("何も選ばないと「追加」ボタンが disabled", async () => {
      seedStore({
        tournaments: {
          t1: makeTournament({ id: "t1" }),
          t2: makeTournament({ id: "t2", participantIds: ["p2"] }),
        },
        participants: {
          p2: makeParticipant({ id: "p2", tournamentId: "t2", name: "選手X" }),
        },
      });

      renderParticipants();
      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: "過去から選ぶ" }));

      await waitFor(() => {
        expect(document.querySelector("dialog[open]")).toBeInTheDocument();
      });

      // 「追加」ボタンは disabled（何も選択していない）
      // モーダル内のボタン「追加」を取得
      const addBtn = screen.getAllByRole("button", { name: "追加" });
      // モーダル内の追加ボタン（フォームの追加ボタンではなくモーダルのもの）
      const modalAddBtn = addBtn.find((btn) => btn.closest("dialog"));
      expect(modalAddBtn).toBeDisabled();
    });

    it("「やめる」でモーダルが閉じる", async () => {
      seedStore({
        tournaments: {
          t1: makeTournament({ id: "t1" }),
          t2: makeTournament({ id: "t2", participantIds: ["p2"] }),
        },
        participants: {
          p2: makeParticipant({ id: "p2", tournamentId: "t2", name: "選手X" }),
        },
      });

      renderParticipants();
      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: "過去から選ぶ" }));

      await waitFor(() => {
        expect(document.querySelector("dialog[open]")).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: "やめる" }));

      await waitFor(() => {
        expect(document.querySelector("dialog[open]")).not.toBeInTheDocument();
      });
    });
  });
});
