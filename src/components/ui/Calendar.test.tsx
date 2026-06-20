import { Calendar } from "@/components/ui/Calendar";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

describe("Calendar", () => {
  it("value 未設定時に placeholder を表示", () => {
    render(<Calendar value="" onChange={vi.fn<() => void>()} placeholder="日付を選んで" />);
    expect(screen.getByText("日付を選んで")).toBeInTheDocument();
  });

  it("value を日本語フォーマットで表示", () => {
    render(<Calendar value="2026-06-21" onChange={vi.fn<() => void>()} />);
    // 2026-06-21 は日曜
    expect(screen.getByText("2026年6月21日（日）")).toBeInTheDocument();
  });

  it("初期クローズ状態では dialog 非表示", () => {
    render(<Calendar value="2026-06-21" onChange={vi.fn<() => void>()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("トリガークリックで dialog 表示", async () => {
    const user = userEvent.setup();
    render(<Calendar value="2026-06-21" onChange={vi.fn<() => void>()} ariaLabel="開催日" />);
    await user.click(screen.getByRole("button", { name: "開催日" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("選択中の月がヘッダーに表示される", async () => {
    const user = userEvent.setup();
    render(<Calendar value="2026-06-21" onChange={vi.fn<() => void>()} ariaLabel="開催日" />);
    await user.click(screen.getByRole("button", { name: "開催日" }));
    expect(screen.getByText("2026年6月")).toBeInTheDocument();
  });

  it("日付クリックで onChange が ISO 文字列で発火し閉じる", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(v: string) => void>();
    render(<Calendar value="2026-06-21" onChange={onChange} ariaLabel="開催日" />);
    await user.click(screen.getByRole("button", { name: "開催日" }));
    await user.click(screen.getByRole("button", { name: "2026年6月15日" }));
    expect(onChange).toHaveBeenCalledWith("2026-06-15");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("選択中の日が aria-pressed=true", async () => {
    const user = userEvent.setup();
    render(<Calendar value="2026-06-21" onChange={vi.fn<() => void>()} ariaLabel="開催日" />);
    await user.click(screen.getByRole("button", { name: "開催日" }));
    expect(screen.getByRole("button", { name: "2026年6月21日" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "2026年6月15日" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("「次の月」「前の月」でヘッダーの月が変わる", async () => {
    const user = userEvent.setup();
    render(<Calendar value="2026-06-21" onChange={vi.fn<() => void>()} ariaLabel="開催日" />);
    await user.click(screen.getByRole("button", { name: "開催日" }));
    await user.click(screen.getByRole("button", { name: "次の月" }));
    expect(screen.getByText("2026年7月")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "前の月" }));
    await user.click(screen.getByRole("button", { name: "前の月" }));
    expect(screen.getByText("2026年5月")).toBeInTheDocument();
  });

  it("12月で「次の月」を押すと翌年1月になる", async () => {
    const user = userEvent.setup();
    render(<Calendar value="2026-12-25" onChange={vi.fn<() => void>()} ariaLabel="開催日" />);
    await user.click(screen.getByRole("button", { name: "開催日" }));
    await user.click(screen.getByRole("button", { name: "次の月" }));
    expect(screen.getByText("2027年1月")).toBeInTheDocument();
  });

  it("ArrowRight + Enter で翌日が選択される", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(v: string) => void>();
    render(<Calendar value="2026-06-21" onChange={onChange} ariaLabel="開催日" />);
    await user.click(screen.getByRole("button", { name: "開催日" }));
    await user.keyboard("{ArrowRight}{Enter}");
    expect(onChange).toHaveBeenCalledWith("2026-06-22");
  });

  it("ArrowDown で 1 週間後へカーソル移動し Enter で選択", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(v: string) => void>();
    render(<Calendar value="2026-06-21" onChange={onChange} ariaLabel="開催日" />);
    await user.click(screen.getByRole("button", { name: "開催日" }));
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenCalledWith("2026-06-28");
  });

  it("Escape で閉じてトリガーにフォーカスが戻る", async () => {
    const user = userEvent.setup();
    render(<Calendar value="2026-06-21" onChange={vi.fn<() => void>()} ariaLabel="開催日" />);
    const trigger = screen.getByRole("button", { name: "開催日" });
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("外部 pointerdown で閉じる", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Calendar value="2026-06-21" onChange={vi.fn<() => void>()} ariaLabel="開催日" />
        <button>外部ボタン</button>
      </div>,
    );
    await user.click(screen.getByRole("button", { name: "開催日" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByRole("button", { name: "外部ボタン" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("トリガー再クリックで閉じる", async () => {
    const user = userEvent.setup();
    render(<Calendar value="2026-06-21" onChange={vi.fn<() => void>()} ariaLabel="開催日" />);
    const trigger = screen.getByRole("button", { name: "開催日" });
    await user.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(trigger);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("disabled のときトリガーが disabled でクリックしても開かない", async () => {
    const user = userEvent.setup();
    render(
      <Calendar value="2026-06-21" onChange={vi.fn<() => void>()} ariaLabel="開催日" disabled />,
    );
    const trigger = screen.getByRole("button", { name: "開催日" });
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("今日の日付が aria-current='date'", async () => {
    const user = userEvent.setup();
    const now = new Date();
    const todayLabel = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    render(<Calendar value="" onChange={vi.fn<() => void>()} ariaLabel="開催日" />);
    await user.click(screen.getByRole("button", { name: "開催日" }));
    expect(screen.getByRole("button", { name: todayLabel })).toHaveAttribute(
      "aria-current",
      "date",
    );
  });

  it("不正な value はトリガーに表示されず placeholder のまま", () => {
    render(
      <Calendar value="2026-02-30" onChange={vi.fn<() => void>()} placeholder="日付を選んで" />,
    );
    expect(screen.getByText("日付を選んで")).toBeInTheDocument();
  });
});
