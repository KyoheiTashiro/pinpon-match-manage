import { InstallAppButton } from "@/features/home/components/InstallAppButton";
import { installMatchMediaMock } from "@/test/matchMediaMock";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// jsdom は HTMLDialogElement.showModal / close を実装していないため polyfill
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn<() => void>(function (this: HTMLDialogElement) {
    this.open = true;
  });
  HTMLDialogElement.prototype.close = vi.fn<() => void>(function (this: HTMLDialogElement) {
    this.open = false;
  });
});

const BUTTON = { name: "ホーム画面に追加" };

const setUserAgent = (userAgent: string) => {
  vi.spyOn(navigator, "userAgent", "get").mockReturnValue(userAgent);
};

/** beforeinstallprompt を発火し、prompt のモックと選択結果の確定関数を返す */
const fireBeforeInstallPrompt = () => {
  const prompt = vi.fn<() => Promise<void>>(() => Promise.resolve());
  const { promise: userChoice, resolve } = Promise.withResolvers<{
    outcome: "accepted" | "dismissed";
  }>();
  const choose = (outcome: "accepted" | "dismissed") => resolve({ outcome });
  act(() => {
    window.dispatchEvent(Object.assign(new Event("beforeinstallprompt"), { prompt, userChoice }));
  });
  return { prompt, choose };
};

describe("InstallAppButton", () => {
  beforeEach(() => {
    installMatchMediaMock();
    setUserAgent("Mozilla/5.0 (Windows NT 10.0)");
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("インストール済み(standalone)では描画しない", () => {
    installMatchMediaMock((query) => query.includes("standalone"));
    render(<InstallAppButton />);
    expect(screen.queryByRole("button", BUTTON)).not.toBeInTheDocument();
  });

  it("PC で beforeinstallprompt が来ない間は描画しない", () => {
    render(<InstallAppButton />);
    expect(screen.queryByRole("button", BUTTON)).not.toBeInTheDocument();
  });

  it("プロンプト可: 結果待ちの間は無効化され prompt は 1 回だけ。承諾で消える", async () => {
    const user = userEvent.setup();
    render(<InstallAppButton />);
    const { prompt, choose } = fireBeforeInstallPrompt();

    const button = screen.getByRole("button", BUTTON);
    await user.click(button);
    expect(button).toBeDisabled();
    await user.click(button);
    expect(prompt).toHaveBeenCalledOnce();

    choose("accepted");
    await waitFor(() => {
      expect(screen.queryByRole("button", BUTTON)).not.toBeInTheDocument();
    });
  });

  it("PC でプロンプトを拒否すると手段がなくなりボタンが消える", async () => {
    const user = userEvent.setup();
    render(<InstallAppButton />);
    const { choose } = fireBeforeInstallPrompt();

    await user.click(screen.getByRole("button", BUTTON));
    choose("dismissed");

    await waitFor(() => {
      expect(screen.queryByRole("button", BUTTON)).not.toBeInTheDocument();
    });
  });

  it("モバイルで prompt が失敗したら手順ガイドへ戻る", async () => {
    setUserAgent("Mozilla/5.0 (Linux; Android 14)");
    const user = userEvent.setup();
    render(<InstallAppButton />);
    const { prompt } = fireBeforeInstallPrompt();
    prompt.mockRejectedValueOnce(new Error("prompt 済み"));

    await user.click(screen.getByRole("button", BUTTON));

    await waitFor(() => {
      expect(screen.getByRole("button", BUTTON)).not.toBeDisabled();
    });
    await user.click(screen.getByRole("button", BUTTON));
    expect(screen.getByTitle("ホーム画面に追加 手順動画")).toBeInTheDocument();
  });

  it("モバイル: 手順ガイドを開閉できる。appinstalled で消える", async () => {
    setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)");
    const user = userEvent.setup();
    render(<InstallAppButton />);

    await user.click(screen.getByRole("button", BUTTON));
    expect(screen.getByTitle("ホーム画面に追加 手順動画")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "閉じる" }));
    expect(screen.queryByTitle("ホーム画面に追加 手順動画")).not.toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event("appinstalled"));
    });
    expect(screen.queryByRole("button", BUTTON)).not.toBeInTheDocument();
  });
});
