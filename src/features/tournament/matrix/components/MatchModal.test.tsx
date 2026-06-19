import { MatchModal } from "@/features/tournament/matrix/components/MatchModal";
import type { Participant } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";
import { makeTournament, makeParticipant, makeMatch } from "@/test/factories";
import { setupStoreIsolation, seedStore } from "@/test/renderWithStore";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";

// ScoreboardScreen が useSyncExternalStore + window.matchMedia を使うため polyfill
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn<(query: string) => MediaQueryList>().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn<() => void>(),
    removeListener: vi.fn<() => void>(),
    addEventListener: vi.fn<() => void>(),
    removeEventListener: vi.fn<() => void>(),
    dispatchEvent: vi.fn<() => boolean>(),
  })),
});

const participants: Record<string, Participant> = {
  p1: makeParticipant({ id: "p1", name: "選手A", tournamentId: "t1" }),
  p2: makeParticipant({ id: "p2", name: "選手B", tournamentId: "t1" }),
};

describe("MatchModal", () => {
  beforeEach(() => {
    setupStoreIsolation();
    seedStore({
      tournaments: { t1: makeTournament({ id: "t1", bestOf: 3 }) },
      participants,
      matches: {
        m1: makeMatch({ id: "m1", tournamentId: "t1" }),
      },
    });
  });

  it("試合の入力 見出しと選手名が表示される", () => {
    const onClose = vi.fn<() => void>();
    render(<MatchModal matchId="m1" participants={participants} onClose={onClose} />);

    expect(screen.getByRole("heading", { name: "試合の入力" })).toBeInTheDocument();
    expect(screen.getByText("選手A")).toBeInTheDocument();
    expect(screen.getByText("選手B")).toBeInTheDocument();
    expect(screen.getByText("対")).toBeInTheDocument();
  });

  it("スコアボードを開くボタンでScoreboardScreenが出る", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn<() => void>();
    render(<MatchModal matchId="m1" participants={participants} onClose={onClose} />);

    // 最初は1つの dialog (MatchModal 内の div[role=dialog])
    expect(screen.getAllByRole("dialog")).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "スコアボードを開く" }));

    // ScoreboardScreen が追加され dialog が2つになる
    await waitFor(() => {
      expect(screen.getAllByRole("dialog")).toHaveLength(2);
    });

    // ScoreboardHeader の "戻る" ボタンが表示される
    expect(screen.getByRole("button", { name: "戻る" })).toBeInTheDocument();
  });

  it("試合結果を削除 → ConfirmModal → 削除確定でmatchが消えonCloseが呼ばれる", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn<() => void>();
    render(<MatchModal matchId="m1" participants={participants} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "試合結果を削除" }));

    // ConfirmModal が表示される
    await waitFor(() => {
      expect(screen.getByText("この試合結果を削除します。取り消せません。")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "削除する" }));

    // match が store から削除される
    await waitFor(() => {
      const matches = useAppStore.getState().matches;
      expect(matches["m1"]).toBeUndefined();
    });

    // onClose が呼ばれる（削除後に useEffect でも呼ばれるため複数回可）
    expect(onClose).toHaveBeenCalled();
  });

  it("× ボタンクリックで onClose が呼ばれる", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn<() => void>();
    render(<MatchModal matchId="m1" participants={participants} onClose={onClose} />);

    // × ボタンは type="button" の <button> 要素。オーバーレイの div[role=button] ではなく
    // dialog 内部の button を取得する
    const dialog = screen.getByRole("dialog");
    const closeBtn = dialog.querySelector<HTMLButtonElement>("button[aria-label='閉じる']");
    expect(closeBtn).not.toBeNull();
    await user.click(closeBtn!);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("背景オーバーレイクリックで onClose が呼ばれる", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn<() => void>();
    render(<MatchModal matchId="m1" participants={participants} onClose={onClose} />);

    // オーバーレイ: div[role="button"][aria-label="閉じる"]（dialog の外側）
    // getAllByRole で取得し、dialog でない方（div）を選択する
    const allCloseButtons = screen.getAllByRole("button", { name: "閉じる" });
    const overlay = allCloseButtons.find((el) => el.tagName === "DIV")!;
    expect(overlay).toBeDefined();
    await user.click(overlay);

    expect(onClose).toHaveBeenCalled();
  });

  it("オーバーレイで Escape キーを押すと onClose が呼ばれる", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn<() => void>();
    render(<MatchModal matchId="m1" participants={participants} onClose={onClose} />);

    const allCloseButtons = screen.getAllByRole("button", { name: "閉じる" });
    const overlay = allCloseButtons.find((el) => el.tagName === "DIV")!;
    overlay.focus();
    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalled();
  });

  it("オーバーレイで Enter キーを押すと onClose が呼ばれる", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn<() => void>();
    render(<MatchModal matchId="m1" participants={participants} onClose={onClose} />);

    const allCloseButtons = screen.getAllByRole("button", { name: "閉じる" });
    const overlay = allCloseButtons.find((el) => el.tagName === "DIV")!;
    overlay.focus();
    await user.keyboard("{Enter}");

    expect(onClose).toHaveBeenCalled();
  });

  it("firstServer を変更すると updateMatch が { firstServer } で呼ばれる", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn<() => void>();
    render(<MatchModal matchId="m1" participants={participants} onClose={onClose} />);

    // デフォルト firstServer = "L"。右側(選手B)を選択
    const rightRadio = screen.getByRole("radio", { name: "最初のサーブ: 選手B" });
    await user.click(rightRadio);

    await waitFor(() => {
      const match = useAppStore.getState().matches["m1"];
      expect(match?.firstServer).toBe("R");
    });
  });

  it("bestOf=3 のとき ゲームリストに 3 行（ゲーム1〜3）が表示される", () => {
    const onClose = vi.fn<() => void>();
    render(<MatchModal matchId="m1" participants={participants} onClose={onClose} />);

    expect(screen.getByText("ゲーム1")).toBeInTheDocument();
    expect(screen.getByText("ゲーム2")).toBeInTheDocument();
    expect(screen.getByText("ゲーム3")).toBeInTheDocument();
  });

  it("空ゲームは「未入力」ラベルが表示される", () => {
    const onClose = vi.fn<() => void>();
    render(<MatchModal matchId="m1" participants={participants} onClose={onClose} />);

    // bestOf=3, games=[] なので全ゲーム空 → 全て「未入力」（ただし最初のゲームだけ入力可）
    // ゲーム1は locked でないので「未入力」
    const labels = screen.getAllByText("未入力");
    expect(labels.length).toBeGreaterThanOrEqual(1);
  });

  it("勝敗確定後のゲームには「入力不可」ラベルが表示される", () => {
    // bestOf=3, winsNeeded=2。ゲーム1・2 で左が勝利済み → ゲーム3 は locked
    const wonGame = {
      leftScore: 11,
      rightScore: 0,
      pointLog: Array.from({ length: 11 }, (): "L" | "R" => "L"),
    };
    useAppStore.getState().resetAll();
    seedStore({
      tournaments: { t1: makeTournament({ id: "t1", bestOf: 3 }) },
      participants,
      matches: {
        m1: makeMatch({
          id: "m1",
          tournamentId: "t1",
          games: [wonGame, wonGame],
          firstServer: "L",
        }),
      },
    });

    const onClose = vi.fn<() => void>();
    render(<MatchModal matchId="m1" participants={participants} onClose={onClose} />);

    // ゲーム3 は locked で空なので「入力不可」
    expect(screen.getByText("入力不可")).toBeInTheDocument();
  });

  it("進行中ゲームには数字スコアと「(進行中)」が表示される", () => {
    const inProgressGame = {
      leftScore: 5,
      rightScore: 3,
      pointLog: Array.from({ length: 8 }, (_, i): "L" | "R" => (i < 5 ? "L" : "R")),
    };
    useAppStore.getState().resetAll();
    seedStore({
      tournaments: { t1: makeTournament({ id: "t1", bestOf: 3 }) },
      participants,
      matches: {
        m1: makeMatch({
          id: "m1",
          tournamentId: "t1",
          games: [inProgressGame],
          firstServer: "L",
        }),
      },
    });

    const onClose = vi.fn<() => void>();
    render(<MatchModal matchId="m1" participants={participants} onClose={onClose} />);

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("(進行中)")).toBeInTheDocument();
  });

  it("スコアボードで「戻る」をクリックすると MatchModal 画面に戻る", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn<() => void>();
    render(<MatchModal matchId="m1" participants={participants} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "スコアボードを開く" }));
    await waitFor(() => {
      expect(screen.getAllByRole("dialog")).toHaveLength(2);
    });

    await user.click(screen.getByRole("button", { name: "戻る" }));

    await waitFor(() => {
      expect(screen.getAllByRole("dialog")).toHaveLength(1);
    });
    expect(screen.getByRole("heading", { name: "試合の入力" })).toBeInTheDocument();
  });

  it("削除 ConfirmModal のキャンセルで match が store に残る", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn<() => void>();
    render(<MatchModal matchId="m1" participants={participants} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "試合結果を削除" }));
    await waitFor(() => {
      expect(screen.getByText("この試合結果を削除します。取り消せません。")).toBeInTheDocument();
    });

    // やめる をクリック
    await user.click(screen.getByRole("button", { name: "やめる" }));

    // match が store に残っている（削除されていない）
    expect(useAppStore.getState().matches["m1"]).toBeDefined();
  });

  it("match が store から消えると useEffect が onClose を呼ぶ", async () => {
    const { act } = await import("react");
    const onClose = vi.fn<() => void>();
    render(<MatchModal matchId="m1" participants={participants} onClose={onClose} />);

    // store から match を削除
    act(() => {
      useAppStore.getState().deleteMatch("m1");
    });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });
});
