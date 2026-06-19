import { SettingsTab } from "@/features/tournament/settings";
import { useAppStore } from "@/store/useAppStore";
import { makeTournament, makeParticipant, makeMatch } from "@/test/factories";
import { renderWithStore, seedStore, setupStoreIsolation } from "@/test/renderWithStore";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";

// jsdom は HTMLDialogElement.showModal / close を実装していないため polyfill
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn<() => void>(function (this: HTMLDialogElement) {
    this.open = true;
  });
  HTMLDialogElement.prototype.close = vi.fn<() => void>(function (this: HTMLDialogElement) {
    this.open = false;
  });
});

const ROUTE_PATH = "/tournaments/:tournamentId/settings";
const INITIAL_ENTRY = "/tournaments/t1/settings";

const seedTournament = () => {
  seedStore({
    tournaments: {
      t1: makeTournament({ id: "t1", name: "春季大会", date: "2026-01-01" }),
    },
  });
};

const renderSettings = () =>
  renderWithStore(<SettingsTab />, {
    initialEntries: [INITIAL_ENTRY],
    routePath: ROUTE_PATH,
  });

describe("SettingsTab", () => {
  beforeEach(setupStoreIsolation);
  beforeEach(seedTournament);

  it("既存の大会情報がビュー表示される", () => {
    renderSettings();

    // dl 内に大会名と開催日が表示されている
    const dl = document.querySelector("dl");
    expect(dl).toBeTruthy();
    expect(screen.getByText("春季大会")).toBeInTheDocument();
    // 開催日は formatDate でフォーマットされる。"2026" を含む文字列が存在すること
    expect(screen.getByText(/2026/u)).toBeInTheDocument();
  });

  it("編集して保存するとストアが更新される", async () => {
    renderSettings();
    const user = userEvent.setup();

    // 編集ボタンをクリック
    await user.click(screen.getByRole("button", { name: "編集" }));

    // 大会名 input が表示される
    const nameInput = screen.getByLabelText("大会名");
    await user.clear(nameInput);
    await user.type(nameInput, "夏季大会");

    // 保存ボタンが enabled であること（startEdit 内で form.trigger() が呼ばれているため）
    const saveBtn = screen.getByRole("button", { name: "保存" });
    await waitFor(() => {
      expect(saveBtn).not.toBeDisabled();
    });

    await user.click(saveBtn);

    // dl に "夏季大会" が表示されていること
    expect(await screen.findByText("夏季大会")).toBeInTheDocument();
    expect(screen.queryByText("春季大会")).not.toBeInTheDocument();
  });

  it("編集キャンセルで元のまま", async () => {
    renderSettings();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "編集" }));

    const nameInput = screen.getByLabelText("大会名");
    await user.clear(nameInput);
    await user.type(nameInput, "秋季大会");

    // キャンセルをクリック
    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    // 元の "春季大会" が表示されていること
    expect(await screen.findByText("春季大会")).toBeInTheDocument();
    expect(screen.queryByText("秋季大会")).not.toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // 追加テスト
  // -----------------------------------------------------------------------

  it("大会名を空にすると「大会名を入力してください」エラーと保存 disabled", async () => {
    renderSettings();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "編集" }));

    const nameInput = screen.getByLabelText("大会名");
    await user.clear(nameInput);

    await waitFor(() => {
      expect(screen.getByText("大会名を入力してください")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
    });
  });

  it("大会名が 21 文字以上で「大会名は20文字以内で入力してください」エラー", async () => {
    renderSettings();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "編集" }));

    const nameInput = screen.getByLabelText("大会名");
    await user.clear(nameInput);
    await user.type(nameInput, "あ".repeat(21));

    await waitFor(() => {
      expect(screen.getByText("大会名は20文字以内で入力してください")).toBeInTheDocument();
    });
  });

  it("開催日を空にすると「開催日を選択してください」エラー", async () => {
    renderSettings();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "編集" }));

    const dateInput = screen.getByLabelText("開催日");
    await user.clear(dateInput);
    await user.tab(); // blur でバリデーション発火

    await waitFor(() => {
      expect(screen.getByText("開催日を選択してください")).toBeInTheDocument();
    });
  });

  it("「試合結果を削除」→「削除する」で resetTournament が呼ばれ試合が消える", async () => {
    // マッチを先に seed
    seedStore({
      tournaments: {
        t1: makeTournament({ id: "t1", name: "春季大会", date: "2026-01-01" }),
      },
      matches: {
        m1: makeMatch({ id: "m1", tournamentId: "t1" }),
      },
    });
    renderSettings();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "試合結果を削除" }));

    // ConfirmModal は常に DOM にある; "削除する" は 2 つ（reset + delete modal）
    // 試合結果削除モーダルが最初
    const deleteButtons = screen.getAllByRole("button", { name: "削除する" });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      const state = useAppStore.getState();
      expect(Object.keys(state.matches)).toHaveLength(0);
    });
  });

  it("「試合結果を削除」→「やめる」でキャンセルされ試合が残る", async () => {
    seedStore({
      tournaments: {
        t1: makeTournament({ id: "t1", name: "春季大会", date: "2026-01-01" }),
      },
      matches: {
        m1: makeMatch({ id: "m1", tournamentId: "t1" }),
      },
    });
    renderSettings();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "試合結果を削除" }));

    // "やめる" も 2 つ存在する（reset + delete modal）。最初のモーダル（reset）を選ぶ
    const cancelButtons = screen.getAllByRole("button", { name: "やめる" });
    await user.click(cancelButtons[0]);

    // 試合は残っている
    const state = useAppStore.getState();
    expect(state.matches["m1"]).toBeDefined();
  });

  it("「大会を削除」→「削除する」で大会がストアから消える", async () => {
    renderSettings();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "大会を削除" }));

    // delete modal の「削除する」は 2 番目
    const deleteButtons = screen.getAllByRole("button", { name: "削除する" });
    await user.click(deleteButtons.at(-1)!);

    await waitFor(() => {
      const state = useAppStore.getState();
      expect(state.tournaments["t1"]).toBeUndefined();
    });
  });

  it("「大会を削除」→「やめる」で大会が残る", async () => {
    renderSettings();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "大会を削除" }));

    const cancelButtons = screen.getAllByRole("button", { name: "やめる" });
    await user.click(cancelButtons.at(-1)!);

    const state = useAppStore.getState();
    expect(state.tournaments["t1"]).toBeDefined();
  });

  it("開催日を変更して保存するとストアが更新される", async () => {
    renderSettings();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "編集" }));

    const dateInput = screen.getByLabelText("開催日");
    await user.clear(dateInput);
    await user.type(dateInput, "2026-12-31");

    const saveBtn = screen.getByRole("button", { name: "保存" });
    await waitFor(() => {
      expect(saveBtn).not.toBeDisabled();
    });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(useAppStore.getState().tournaments["t1"]?.date).toBe("2026-12-31");
    });
  });

  it("ビューに形式・参加者数・試合数が表示される", () => {
    seedStore({
      tournaments: {
        t1: makeTournament({
          id: "t1",
          name: "春季大会",
          date: "2026-01-01",
          participantIds: ["p1", "p2"],
        }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", tournamentId: "t1" }),
        p2: makeParticipant({ id: "p2", tournamentId: "t1" }),
      },
      matches: {
        m1: makeMatch({ id: "m1", tournamentId: "t1" }),
        m2: makeMatch({ id: "m2", tournamentId: "t1" }),
      },
    });
    renderSettings();

    // FORMAT.SINGLES → "シングルス"
    expect(screen.getByText("シングルス")).toBeInTheDocument();
    // 参加者 2 人
    expect(screen.getByText("2 人")).toBeInTheDocument();
    // 試合 2 試合
    expect(screen.getByText("2 試合")).toBeInTheDocument();
  });
});
