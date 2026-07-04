import type { Game, Side } from "@/domain/match";
import { ScoreboardScreen } from "@/features/tournament/scoreboard";
import { makeGame, gameFromLog } from "@/test/factories";
import { installMatchMediaMock } from "@/test/matchMediaMock";
import { setupStoreIsolation } from "@/test/renderWithStore";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";

// ScoreboardScreen の useScoreboard が useSyncExternalStore + window.matchMedia を使うため polyfill
installMatchMediaMock();

type ScoreboardProps = {
  leftName: string;
  rightName: string;
  lockedFromIndex: number;
  initialGameIndex: number;
  winsNeeded: number;
  matchFirstServer: Side;
  onBack: () => void;
  onCloseAll?: () => void;
};

type WrapperProps = ScoreboardProps & { initialGames: Game[] };

const ScoreboardWrapper = ({ initialGames, ...props }: WrapperProps) => {
  const [games, setGames] = useState<Game[]>(initialGames);
  return <ScoreboardScreen {...props} games={games} setGames={setGames} />;
};

const defaultProps: ScoreboardProps = {
  leftName: "選手A",
  rightName: "選手B",
  lockedFromIndex: 1,
  initialGameIndex: 0,
  winsNeeded: 1,
  matchFirstServer: "L",
  onBack: vi.fn<() => void>(),
};

describe("ScoreboardScreen", () => {
  beforeEach(setupStoreIsolation);

  it("初期スコア 0-0 が表示される", () => {
    render(
      <ScoreboardWrapper
        {...defaultProps}
        initialGames={[makeGame()]}
        winsNeeded={3}
        lockedFromIndex={1}
      />,
    );

    // スコアが 0 で表示されること（両側）
    const scores = screen.getAllByText("0");
    expect(scores.length).toBeGreaterThanOrEqual(2);
  });

  it("左加点ボタンで左スコアがインクリメントされる", async () => {
    const user = userEvent.setup();
    render(
      <ScoreboardWrapper
        {...defaultProps}
        initialGames={[makeGame()]}
        winsNeeded={3}
        lockedFromIndex={1}
      />,
    );

    await user.click(screen.getByRole("button", { name: "選手A を1増やす" }));

    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  it("右加点後に減点できる", async () => {
    const user = userEvent.setup();
    render(
      <ScoreboardWrapper
        {...defaultProps}
        initialGames={[makeGame()]}
        winsNeeded={3}
        lockedFromIndex={1}
      />,
    );

    await user.click(screen.getByRole("button", { name: "選手B を1増やす" }));

    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "選手B を1減らす" }));

    await waitFor(() => {
      // 両方のスコアが 0 に戻る
      const scores = screen.getAllByText("0");
      expect(scores.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("10-0 → 左加点でゲーム勝者が決まり 結果を見るボタンが表示される", async () => {
    const user = userEvent.setup();
    const initialLog: Side[] = Array.from({ length: 10 }, (): Side => "L");
    render(
      <ScoreboardWrapper
        {...defaultProps}
        initialGames={[gameFromLog(initialLog)]}
        winsNeeded={1}
        lockedFromIndex={1}
        initialGameIndex={0}
      />,
    );

    await user.click(screen.getByRole("button", { name: "選手A を1増やす" }));

    await waitFor(() => {
      expect(screen.getByText("11")).toBeInTheDocument();
    });

    // match winner 決定 → "結果を見る" ボタンが表示される
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "結果を見る" })).toBeInTheDocument();
    });
  });

  it("locked 時に加点ボタンが disabled かつ 入力不可 が表示される", () => {
    render(
      <ScoreboardWrapper
        {...defaultProps}
        initialGames={[makeGame()]}
        winsNeeded={3}
        lockedFromIndex={0}
        initialGameIndex={0}
      />,
    );

    const addLeftBtn = screen.getByRole("button", { name: "選手A を1増やす" });
    const addRightBtn = screen.getByRole("button", { name: "選手B を1増やす" });
    expect(addLeftBtn).toBeDisabled();
    expect(addRightBtn).toBeDisabled();

    // "入力不可" テキストが表示される（ScoreColumn と ScoreInputView の両方から出る可能性がある）
    const locked = screen.getAllByText("入力不可");
    expect(locked.length).toBeGreaterThanOrEqual(1);
  });

  it("入替ボタンで左右スコアが反転表示される", async () => {
    const user = userEvent.setup();
    // 左3点、右1点の状態
    const log: Side[] = ["L", "L", "L", "R"];
    render(
      <ScoreboardWrapper
        {...defaultProps}
        initialGames={[gameFromLog(log)]}
        winsNeeded={3}
        lockedFromIndex={1}
        initialGameIndex={0}
      />,
    );

    // swap 前: 左=3, 右=1
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();

    const swapBtn = screen.getByRole("button", { name: "左右を入れ替える" });
    await user.click(swapBtn);

    // swap 後: swap ボタンが pressed 状態になる
    await waitFor(() => {
      expect(swapBtn).toHaveAttribute("aria-pressed", "true");
    });

    // スコア 3 と 1 が依然表示されているが配置が逆になる
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("matchWinner 確定 → 結果を見るボタン → MatchResultView 表示", async () => {
    const user = userEvent.setup();
    const initialLog: Side[] = Array.from({ length: 10 }, (): Side => "L");
    render(
      <ScoreboardWrapper
        {...defaultProps}
        leftName="選手A"
        rightName="選手B"
        initialGames={[gameFromLog(initialLog)]}
        winsNeeded={1}
        lockedFromIndex={1}
        initialGameIndex={0}
      />,
    );

    // 左に1点追加してゲーム終了
    await user.click(screen.getByRole("button", { name: "選手A を1増やす" }));

    // "結果を見る" ボタンが出現するまで待つ
    const resultBtn = await screen.findByRole("button", { name: "結果を見る" });
    await user.click(resultBtn);

    // MatchResultView が表示され選手名が見える
    await waitFor(() => {
      // MatchResultView には leftName と rightName が大きく表示される
      const playerAElements = screen.getAllByText("選手A");
      expect(playerAElements.length).toBeGreaterThanOrEqual(1);
      const playerBElements = screen.getAllByText("選手B");
      expect(playerBElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("サーブ表示: firstServer=LEFT のとき左にサーブ権あり", () => {
    render(
      <ScoreboardWrapper
        {...defaultProps}
        initialGames={[makeGame()]}
        matchFirstServer="L"
        winsNeeded={3}
        lockedFromIndex={1}
      />,
    );

    // スコア0-0、最初のサーブ権は左
    expect(screen.getByLabelText("サーブ権あり")).toBeInTheDocument();
  });

  it("winsNeeded=2 で1ゲーム目終了後に 次に進む ボタンが表示される", async () => {
    const user = userEvent.setup();
    const initialLog: Side[] = Array.from({ length: 10 }, (): Side => "L");
    render(
      <ScoreboardWrapper
        {...defaultProps}
        initialGames={[gameFromLog(initialLog), makeGame()]}
        winsNeeded={2}
        lockedFromIndex={2}
        initialGameIndex={0}
      />,
    );

    await user.click(screen.getByRole("button", { name: "選手A を1増やす" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "次に進む" })).toBeInTheDocument();
    });

    // "結果を見る" は出ない（まだ match winner が決まっていない）
    expect(screen.queryByRole("button", { name: "結果を見る" })).not.toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // 追加テスト
  // -----------------------------------------------------------------------

  it("スコア 0 で減点ボタンが disabled", () => {
    render(
      <ScoreboardWrapper
        {...defaultProps}
        initialGames={[makeGame()]}
        winsNeeded={3}
        lockedFromIndex={1}
      />,
    );
    expect(screen.getByRole("button", { name: "選手A を1減らす" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "選手B を1減らす" })).toBeDisabled();
  });

  it("直前得点が右なら左減点が disabled で右減点は enabled", async () => {
    const user = userEvent.setup();
    render(
      <ScoreboardWrapper
        {...defaultProps}
        initialGames={[makeGame()]}
        winsNeeded={3}
        lockedFromIndex={1}
      />,
    );

    await user.click(screen.getByRole("button", { name: "選手B を1増やす" }));
    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    // 直前得点が右(B) → canSubLeft=false → 左減点 disabled
    expect(screen.getByRole("button", { name: "選手A を1減らす" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "選手B を1減らす" })).not.toBeDisabled();
  });

  it("ゲーム winner 確定後に勝者側の加点ボタンが disabled になる", async () => {
    const user = userEvent.setup();
    const initialLog: Side[] = Array.from({ length: 10 }, (): Side => "L");
    render(
      <ScoreboardWrapper
        {...defaultProps}
        initialGames={[gameFromLog(initialLog), makeGame()]}
        winsNeeded={2}
        lockedFromIndex={2}
        initialGameIndex={0}
      />,
    );

    // 1点加点でゲーム勝利 (11-0)
    await user.click(screen.getByRole("button", { name: "選手A を1増やす" }));

    // ゲーム終了後: disableAdd=true → 勝者(左=選手A)の加点ボタンが disabled
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "選手A を1増やす" })).toBeDisabled();
    });
  });

  it("スコア 50(MAX_SCORE)到達で加点ボタンが disabled", () => {
    // MAX_SCORE=50: score >= MAX_SCORE で disabled
    const game: Game = { leftScore: 50, rightScore: 0 };
    render(
      <ScoreboardWrapper
        {...defaultProps}
        initialGames={[game]}
        winsNeeded={3}
        lockedFromIndex={1}
      />,
    );
    expect(screen.getByRole("button", { name: "選手A を1増やす" })).toBeDisabled();
  });

  it("マッチポイント時スコア表示色が text-yellow-400 になる", () => {
    // winsNeeded=1, 10-0 → isGamePoint(10, 0)=true → leftMatchPoint=true
    const game: Game = { leftScore: 10, rightScore: 0 };
    render(
      <ScoreboardWrapper
        {...defaultProps}
        initialGames={[game]}
        winsNeeded={1}
        lockedFromIndex={1}
      />,
    );
    const scoreEl = screen.getByText("10");
    expect(scoreEl.className).toMatch(/text-yellow-400/u);
  });

  it("isPortrait=true → 「端末を横向きにしてください」バナーが表示される", () => {
    // matchMedia を portrait=true に上書き
    installMatchMediaMock((query) => query.includes("portrait"));

    render(
      <ScoreboardWrapper
        {...defaultProps}
        initialGames={[makeGame()]}
        winsNeeded={3}
        lockedFromIndex={1}
      />,
    );
    expect(screen.getByText("端末を横向きにしてください")).toBeInTheDocument();

    // 元に戻す
    installMatchMediaMock();
  });

  it("swapped=true で表示左加点が実際の右スコアに入る", async () => {
    const user = userEvent.setup();
    render(
      <ScoreboardWrapper
        {...defaultProps}
        leftName="選手A"
        rightName="選手B"
        initialGames={[makeGame()]}
        winsNeeded={3}
        lockedFromIndex={1}
      />,
    );

    // swap する
    await user.click(screen.getByRole("button", { name: "左右を入れ替える" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "左右を入れ替える" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    // swap 後: display.leftName = rightName = "選手B"
    // "選手B を1増やす" クリック → toActual(SIDE.LEFT) = SIDE.RIGHT → 実際の右スコアがインクリメント
    await user.click(screen.getByRole("button", { name: "選手B を1増やす" }));
    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  it("「対戦表に戻る」クリックで onCloseAll が呼ばれる", async () => {
    const user = userEvent.setup();
    const onCloseAll = vi.fn<() => void>();
    const initialLog: Side[] = Array.from({ length: 10 }, (): Side => "L");
    render(
      <ScoreboardWrapper
        {...defaultProps}
        onCloseAll={onCloseAll}
        initialGames={[gameFromLog(initialLog)]}
        winsNeeded={1}
        lockedFromIndex={1}
      />,
    );

    // 1点加点で matchWinner 確定
    await user.click(screen.getByRole("button", { name: "選手A を1増やす" }));
    const resultBtn = await screen.findByRole("button", { name: "結果を見る" });
    await user.click(resultBtn);

    // MatchResultView 表示後に「対戦表に戻る」が出る
    const closeBtn = await screen.findByRole("button", { name: "対戦表に戻る" });
    await user.click(closeBtn);

    expect(onCloseAll).toHaveBeenCalledOnce();
  });

  it("G2 タブクリックでゲームが 2 ゲーム目に切り替わる", async () => {
    const user = userEvent.setup();
    // G1 は 10-0 の未終了状態、G2 は 0-0
    const game1 = gameFromLog(Array.from({ length: 10 }, (): Side => "L")); // 10-0
    render(
      <ScoreboardWrapper
        {...defaultProps}
        initialGames={[game1, makeGame()]}
        winsNeeded={2}
        lockedFromIndex={2}
        initialGameIndex={0}
      />,
    );

    // G1 のスコアが "10" と "0"
    expect(screen.getByText("10")).toBeInTheDocument();

    // G2 ボタンをクリック
    const g2Btn = screen.getByRole("button", { name: "G2" });
    await user.click(g2Btn);

    // G2 の 0-0 スコアが表示される
    await waitFor(() => {
      const zeros = screen.getAllByText("0");
      expect(zeros.length).toBeGreaterThanOrEqual(2);
    });
    // G1 のスコア "10" は消えている
    expect(screen.queryByText("10")).not.toBeInTheDocument();
  });

  it("デュース境界: 10-10 は未終了、11-10 も未終了、12-10 で終了", async () => {
    const user = userEvent.setup();
    // L を 10 点、R を 10 点 → 10-10
    const tenTenLog: Side[] = [
      ...Array.from({ length: 10 }, (): Side => "L"),
      ...Array.from({ length: 10 }, (): Side => "R"),
    ];
    render(
      <ScoreboardWrapper
        {...defaultProps}
        initialGames={[gameFromLog(tenTenLog)]}
        winsNeeded={1}
        lockedFromIndex={1}
      />,
    );

    // 10-10: 「結果を見る」なし
    expect(screen.queryByRole("button", { name: "結果を見る" })).not.toBeInTheDocument();

    // L 1点追加 → 11-10: まだ WIN_DIFF=2 が足りないので未終了
    await user.click(screen.getByRole("button", { name: "選手A を1増やす" }));
    await waitFor(() => {
      expect(screen.getByText("11")).toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: "結果を見る" })).not.toBeInTheDocument();

    // L もう1点 → 12-10: 2点差 → 終了
    await user.click(screen.getByRole("button", { name: "選手A を1増やす" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "結果を見る" })).toBeInTheDocument();
    });
  });
});
