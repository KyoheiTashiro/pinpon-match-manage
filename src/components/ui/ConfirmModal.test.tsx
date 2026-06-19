import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("ConfirmModal", () => {
  const defaultProps = {
    open: false,
    title: "確認タイトル",
    message: "本当に実行しますか？",
    onConfirm: vi.fn<() => void>(),
    onCancel: vi.fn<() => void>(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("open=false で dialog が非表示（dialog.open が false）", () => {
    render(<ConfirmModal {...defaultProps} open={false} />);
    const dialog = document.querySelector("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog?.open).toBe(false);
  });

  it("open=true で dialog が表示（dialog.open が true）、title と message が描画される", () => {
    render(<ConfirmModal {...defaultProps} open={true} />);
    const dialog = document.querySelector("dialog");
    expect(dialog?.open).toBe(true);
    expect(screen.getByText("確認タイトル")).toBeInTheDocument();
    expect(screen.getByText("本当に実行しますか？")).toBeInTheDocument();
  });

  it("確定ボタンクリックで onConfirm が呼ばれる", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn<() => void>();
    render(
      <ConfirmModal {...defaultProps} open={true} onConfirm={onConfirm} confirmLabel="はい" />,
    );
    await user.click(screen.getByRole("button", { name: "はい" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("キャンセルボタンクリックで onCancel が呼ばれる", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn<() => void>();
    render(<ConfirmModal {...defaultProps} open={true} onCancel={onCancel} cancelLabel="いいえ" />);
    await user.click(screen.getByRole("button", { name: "いいえ" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("confirmLabel/cancelLabel のデフォルト値が 'はい'/'いいえ'", () => {
    render(<ConfirmModal {...defaultProps} open={true} />);
    expect(screen.getByRole("button", { name: "はい" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "いいえ" })).toBeInTheDocument();
  });

  it("destructive=true で確定ボタンが danger variant のクラスを持つ（bg-danger を含む）", () => {
    render(<ConfirmModal {...defaultProps} open={true} destructive={true} />);
    const confirmBtn = screen.getByRole("button", { name: "はい" });
    expect(confirmBtn.className).toMatch(/bg-danger/u);
  });

  it("Esc で onCancel が呼ばれる", () => {
    const onCancel = vi.fn<() => void>();
    render(<ConfirmModal {...defaultProps} open={true} onCancel={onCancel} />);
    const dialog = document.querySelector("dialog")!;
    fireEvent(dialog, new Event("cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("open=true で cancelRef にフォーカスが当たる", () => {
    render(<ConfirmModal {...defaultProps} open={true} cancelLabel="いいえ" />);
    const cancelBtn = screen.getByRole("button", { name: "いいえ" });
    expect(cancelBtn).toHaveFocus();
  });

  it("open=true→false 遷移で dialog.close() が呼ばれる", () => {
    const { rerender } = render(<ConfirmModal {...defaultProps} open={true} />);
    const dialog = document.querySelector("dialog") as HTMLDialogElement;
    const closeSpy = vi.spyOn(dialog, "close");
    rerender(<ConfirmModal {...defaultProps} open={false} />);
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it("destructive=false のとき確定ボタンが primary クラスを持つ", () => {
    render(<ConfirmModal {...defaultProps} open={true} destructive={false} />);
    const confirmBtn = screen.getByRole("button", { name: "はい" });
    expect(confirmBtn.className).toMatch(/bg-primary/u);
  });

  it("dialog 要素自体クリック(backdrop)で onCancel が呼ばれる", () => {
    const onCancel = vi.fn<() => void>();
    render(<ConfirmModal {...defaultProps} open={true} onCancel={onCancel} />);
    const dialog = document.querySelector("dialog")!;
    fireEvent.click(dialog);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("aria-labelledby が h2 の id を指す", () => {
    render(<ConfirmModal {...defaultProps} open={true} />);
    const dialog = document.querySelector("dialog")!;
    const labelledById = dialog.getAttribute("aria-labelledby");
    expect(labelledById).toBeTruthy();
    const h2 = document.querySelector(`[id="${labelledById!}"]`);
    expect(h2?.tagName).toBe("H2");
    expect(h2?.textContent).toBe("確認タイトル");
  });

  it("モーダル内部コンテンツクリックでは onCancel が発火しない", () => {
    const onCancel = vi.fn<() => void>();
    render(<ConfirmModal {...defaultProps} open={true} onCancel={onCancel} />);
    const message = screen.getByText("本当に実行しますか？");
    fireEvent.click(message);
    expect(onCancel).not.toHaveBeenCalled();
  });
});
