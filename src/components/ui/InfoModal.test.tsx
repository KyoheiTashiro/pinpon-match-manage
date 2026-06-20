import { InfoModal } from "@/components/ui/InfoModal";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("InfoModal", () => {
  const defaultProps = {
    open: false,
    title: "情報タイトル",
    onClose: vi.fn<() => void>(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("open=false で dialog が非表示", () => {
    render(
      <InfoModal {...defaultProps} open={false}>
        <p>コンテンツ</p>
      </InfoModal>,
    );
    const dialog = document.querySelector("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog?.open).toBe(false);
  });

  it("open=true で title と children が表示", () => {
    render(
      <InfoModal {...defaultProps} open={true}>
        <p>モーダルの内容</p>
      </InfoModal>,
    );
    const dialog = document.querySelector("dialog");
    expect(dialog?.open).toBe(true);
    expect(screen.getByText("情報タイトル")).toBeInTheDocument();
    expect(screen.getByText("モーダルの内容")).toBeInTheDocument();
  });

  it("閉じるボタンクリックで onClose が呼ばれる", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn<() => void>();
    render(
      <InfoModal {...defaultProps} open={true} onClose={onClose} closeLabel="閉じる">
        <p>内容</p>
      </InfoModal>,
    );
    await user.click(screen.getByRole("button", { name: "閉じる" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closeLabel のデフォルト値が '閉じる'", () => {
    render(
      <InfoModal {...defaultProps} open={true}>
        <p>内容</p>
      </InfoModal>,
    );
    expect(screen.getByRole("button", { name: "閉じる" })).toBeInTheDocument();
  });

  it("Esc で onClose が呼ばれる", () => {
    const onClose = vi.fn<() => void>();
    render(
      <InfoModal {...defaultProps} open={true} onClose={onClose}>
        <p>内容</p>
      </InfoModal>,
    );
    const dialog = document.querySelector("dialog")!;
    fireEvent(dialog, new Event("cancel"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("open=true で closeRef にフォーカスが当たる", () => {
    render(
      <InfoModal {...defaultProps} open={true} closeLabel="閉じる">
        <p>内容</p>
      </InfoModal>,
    );
    const closeBtn = screen.getByRole("button", { name: "閉じる" });
    expect(closeBtn).toHaveFocus();
  });

  it("open=true→false 遷移で dialog.close() が呼ばれる", () => {
    const { rerender } = render(
      <InfoModal {...defaultProps} open={true}>
        <p>内容</p>
      </InfoModal>,
    );
    const dialog = document.querySelector<HTMLDialogElement>("dialog")!;
    const closeSpy = vi.spyOn(dialog, "close");
    rerender(
      <InfoModal {...defaultProps} open={false}>
        <p>内容</p>
      </InfoModal>,
    );
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it("dialog 要素自体クリック(backdrop)で onClose が呼ばれる", () => {
    const onClose = vi.fn<() => void>();
    render(
      <InfoModal {...defaultProps} open={true} onClose={onClose}>
        <p>内容</p>
      </InfoModal>,
    );
    const dialog = document.querySelector("dialog")!;
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("モーダル内部コンテンツクリックでは onClose が発火しない", () => {
    const onClose = vi.fn<() => void>();
    render(
      <InfoModal {...defaultProps} open={true} onClose={onClose}>
        <p>内部要素</p>
      </InfoModal>,
    );
    const content = screen.getByText("内部要素");
    fireEvent.click(content);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("aria-labelledby が h2 の id を指す", () => {
    render(
      <InfoModal {...defaultProps} open={true}>
        <p>内容</p>
      </InfoModal>,
    );
    const dialog = document.querySelector("dialog")!;
    const labelledById = dialog.getAttribute("aria-labelledby");
    expect(labelledById).toBeTruthy();
    const h2 = document.querySelector(`[id="${labelledById!}"]`);
    expect(h2?.tagName).toBe("H2");
    expect(h2?.textContent).toBe("情報タイトル");
  });

  it("閉じるボタンが primary variant のクラスを持つ", () => {
    render(
      <InfoModal {...defaultProps} open={true} closeLabel="閉じる">
        <p>内容</p>
      </InfoModal>,
    );
    const closeBtn = screen.getByRole("button", { name: "閉じる" });
    expect(closeBtn.className).toMatch(/bg-primary/u);
  });
});
