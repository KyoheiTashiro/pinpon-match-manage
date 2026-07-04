import { Home } from "@/features/home";
import { makeTournament } from "@/test/factories";
import { installMatchMediaMock } from "@/test/matchMediaMock";
import { renderWithStore, seedStore, setupStoreIsolation } from "@/test/renderWithStore";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";

// InstallAppButton が window.matchMedia を呼ぶが jsdom は未実装のため polyfill
installMatchMediaMock();

describe("Home", () => {
  beforeEach(setupStoreIsolation);

  it("大会名が空のまま submit できない", async () => {
    renderWithStore(<Home />);
    const user = userEvent.setup();

    // フォームを開く
    await user.click(screen.getByRole("button", { name: "＋ 新しい大会" }));

    // 大会名は空のまま — "作る" ボタンが disabled であることを確認
    const submitBtn = screen.getByRole("button", { name: "作る" });
    expect(submitBtn).toBeDisabled();
  });

  it("正常な大会を作成すると一覧に表示される", async () => {
    renderWithStore(<Home />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "＋ 新しい大会" }));

    await user.clear(screen.getByLabelText("大会名"));
    await user.type(screen.getByLabelText("大会名"), "テスト大会");

    // 開催日は defaultValues で当日が設定済み（Calendar コンポーネント）

    const submitBtn = screen.getByRole("button", { name: "作る" });
    expect(submitBtn).not.toBeDisabled();
    await user.click(submitBtn);

    // フォームが閉じられ、作成した大会名が一覧に表示される
    expect(await screen.findByText("テスト大会")).toBeInTheDocument();
  });

  it("既存大会が一覧に表示される", () => {
    seedStore({
      tournaments: {
        t1: makeTournament({ id: "t1", name: "春季大会" }),
        t2: makeTournament({ id: "t2", name: "夏季大会" }),
      },
    });

    renderWithStore(<Home />);

    expect(screen.getByText("春季大会")).toBeInTheDocument();
    expect(screen.getByText("夏季大会")).toBeInTheDocument();
  });

  it("データ初期化: モーダルキャンセルでデータが残る", async () => {
    seedStore({
      tournaments: {
        t1: makeTournament({ id: "t1", name: "春季大会" }),
      },
    });

    renderWithStore(<Home />);
    const user = userEvent.setup();

    expect(screen.getByText("春季大会")).toBeInTheDocument();

    // 設定モーダルを開く
    await user.click(screen.getByRole("button", { name: "設定" }));

    // モーダル内の「データ初期化」をクリック
    await user.click(await screen.findByRole("button", { name: "データ初期化" }));

    // インライン確認の「やめる」が現れるのを待つ
    const cancelBtn = await screen.findByRole("button", { name: "やめる" });

    // キャンセルをクリック
    await user.click(cancelBtn);

    // tournament が残っていることを確認
    expect(screen.getByText("春季大会")).toBeInTheDocument();
  });

  it("データ初期化: モーダル確定で全データが消える", async () => {
    seedStore({
      tournaments: {
        t1: makeTournament({ id: "t1", name: "春季大会" }),
      },
    });

    renderWithStore(<Home />);
    const user = userEvent.setup();

    expect(screen.getByText("春季大会")).toBeInTheDocument();

    // 設定モーダルを開く
    await user.click(screen.getByRole("button", { name: "設定" }));

    // モーダル内の「データ初期化」をクリック
    await user.click(await screen.findByRole("button", { name: "データ初期化" }));

    // インライン確認の「全て消す」が現れるのを待つ
    const confirmBtn = await screen.findByRole("button", { name: "全て消す" });

    // 確定をクリック
    await user.click(confirmBtn);

    // tournament が消えていることを確認
    await waitFor(() => {
      expect(screen.queryByText("春季大会")).not.toBeInTheDocument();
    });
  });

  it("キャンセルでフォームが閉じ、入力がリセットされる", async () => {
    renderWithStore(<Home />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "＋ 新しい大会" }));

    // フォームが開いていることを確認
    await user.type(screen.getByLabelText("大会名"), "テスト大会");
    expect(screen.getByLabelText("大会名")).toHaveValue("テスト大会");

    // キャンセルボタンでフォームを閉じる
    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    // フォームが閉じてボタンが表示されている
    expect(screen.getByRole("button", { name: "＋ 新しい大会" })).toBeInTheDocument();
    expect(screen.queryByLabelText("大会名")).not.toBeInTheDocument();

    // 再度フォームを開いたとき入力がリセットされている
    await user.click(screen.getByRole("button", { name: "＋ 新しい大会" }));
    expect(screen.getByLabelText("大会名")).toHaveValue("");
  });

  it("大会名20文字超でバリデーションエラーが表示される", async () => {
    renderWithStore(<Home />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "＋ 新しい大会" }));

    // 21文字入力
    await user.type(screen.getByLabelText("大会名"), "あ".repeat(21));

    await waitFor(() => {
      expect(screen.getByText("大会名は20文字以内で入力してください")).toBeInTheDocument();
    });

    // submitボタンがdisabled
    expect(screen.getByRole("button", { name: "作る" })).toBeDisabled();
  });

  it("format ダブルスを選択して作成すると format=doubles で保存される", async () => {
    const { useAppStore } = await import("@/store/useAppStore");
    renderWithStore(<Home />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "＋ 新しい大会" }));
    await user.type(screen.getByLabelText("大会名"), "ダブルス大会");

    // ダブルスを選択
    await user.click(screen.getByRole("radio", { name: "ダブルス" }));

    const submitBtn = screen.getByRole("button", { name: "作る" });
    await user.click(submitBtn);

    await waitFor(() => {
      const state = useAppStore.getState();
      const created = Object.values(state.tournaments).find((t) => t.name === "ダブルス大会");
      expect(created?.format).toBe("doubles");
    });
  });

  it("format シングルスを選択して作成すると format=singles で保存される", async () => {
    const { useAppStore } = await import("@/store/useAppStore");
    renderWithStore(<Home />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "＋ 新しい大会" }));
    await user.type(screen.getByLabelText("大会名"), "シングルス大会");

    // シングルスはデフォルト選択済みだが明示的に選択
    await user.click(screen.getByRole("radio", { name: "シングルス" }));

    const submitBtn = screen.getByRole("button", { name: "作る" });
    await user.click(submitBtn);

    await waitFor(() => {
      const state = useAppStore.getState();
      const created = Object.values(state.tournaments).find((t) => t.name === "シングルス大会");
      expect(created?.format).toBe("singles");
    });
  });

  it("bestOf=5 を選択して作成すると bestOf=5 で保存される", async () => {
    const { useAppStore } = await import("@/store/useAppStore");
    renderWithStore(<Home />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "＋ 新しい大会" }));
    await user.type(screen.getByLabelText("大会名"), "5ゲーム大会");

    // 5 を選択
    await user.click(screen.getByRole("radio", { name: "5" }));

    const submitBtn = screen.getByRole("button", { name: "作る" });
    await user.click(submitBtn);

    await waitFor(() => {
      const state = useAppStore.getState();
      const created = Object.values(state.tournaments).find((t) => t.name === "5ゲーム大会");
      expect(created?.bestOf).toBe(5);
    });
  });

  it("bestOf=7 を選択して作成すると bestOf=7 で保存される", async () => {
    const { useAppStore } = await import("@/store/useAppStore");
    renderWithStore(<Home />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "＋ 新しい大会" }));
    await user.type(screen.getByLabelText("大会名"), "7ゲーム大会");

    // 7 を選択
    await user.click(screen.getByRole("radio", { name: "7" }));

    const submitBtn = screen.getByRole("button", { name: "作る" });
    await user.click(submitBtn);

    await waitFor(() => {
      const state = useAppStore.getState();
      const created = Object.values(state.tournaments).find((t) => t.name === "7ゲーム大会");
      expect(created?.bestOf).toBe(7);
    });
  });

  it("大会一覧が日付降順でソートされて表示される", () => {
    seedStore({
      tournaments: {
        t1: makeTournament({
          id: "t1",
          name: "古い大会",
          date: "2025-01-01",
          createdAt: "2025-01-01T00:00:00.000Z",
        }),
        t2: makeTournament({
          id: "t2",
          name: "新しい大会",
          date: "2026-06-01",
          createdAt: "2026-06-01T00:00:00.000Z",
        }),
        t3: makeTournament({
          id: "t3",
          name: "中間大会",
          date: "2025-12-01",
          createdAt: "2025-12-01T00:00:00.000Z",
        }),
      },
    });

    renderWithStore(<Home />);

    // ul > li > button の順でリストアイテムを取得
    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(3);

    // 表示順: 新しい大会 > 中間大会 > 古い大会
    expect(listItems[0].textContent).toContain("新しい大会");
    expect(listItems[1].textContent).toContain("中間大会");
    expect(listItems[2].textContent).toContain("古い大会");
  });

  it("大会0件のとき空状態メッセージが表示される", () => {
    renderWithStore(<Home />);

    expect(
      screen.getByText("まだ大会がありません。上のボタンから作成してください。"),
    ).toBeInTheDocument();
  });

  it("リストアイテムクリックで詳細ページへナビゲートする", async () => {
    seedStore({
      tournaments: {
        t1: makeTournament({ id: "t1", name: "春季大会" }),
      },
    });

    // MemoryRouter + Routes でレンダリング。詳細 route は空の要素を描画。
    // クリック後に Home が消え、詳細プレースホルダが表示されることで navigate を確認。
    const { render: rtlRender } = await import("@testing-library/react");
    const { MemoryRouter, Routes, Route } = await import("react-router-dom");
    const { Home: HomeComp } = await import("@/features/home");

    rtlRender(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<HomeComp />} />
          <Route path="/tournaments/:id/*" element={<div>詳細ページ</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("春季大会")).toBeInTheDocument();

    const user = userEvent.setup();
    const btn = screen.getByRole("button", { name: /春季大会/u });
    await user.click(btn);

    // navigate 後、Home が unmount され詳細ページが表示される
    await waitFor(() => {
      expect(screen.getByText("詳細ページ")).toBeInTheDocument();
    });
    expect(screen.queryByText("春季大会")).not.toBeInTheDocument();
  });
});
