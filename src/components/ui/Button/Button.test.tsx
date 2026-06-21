import { Button } from "@/components/ui/Button";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, it, expect, vi } from "vitest";

describe("Button", () => {
  it("children を表示する", () => {
    render(<Button>テスト</Button>);
    expect(screen.getByRole("button", { name: "テスト" })).toBeInTheDocument();
  });

  it("クリックで onClick が発火する", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn<() => void>();
    render(<Button onClick={onClick}>クリック</Button>);
    await user.click(screen.getByRole("button", { name: "クリック" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disabled のとき onClick が発火しない", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn<() => void>();
    render(
      <Button disabled onClick={onClick}>
        無効
      </Button>,
    );
    await user.click(screen.getByRole("button", { name: "無効" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("variant='danger' が適用されたボタンが描画される", () => {
    render(<Button variant="danger">削除</Button>);
    const btn = screen.getByRole("button", { name: "削除" });
    expect(btn).toBeInTheDocument();
    expect(btn.className).toMatch(/bg-danger/u);
  });

  it("ref 転送: ref に渡した RefObject が button DOM を指す", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>リファレンス</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.textContent).toBe("リファレンス");
  });

  it("variant='secondary' が描画されクラスに bg-bg が含まれる", () => {
    render(<Button variant="secondary">セカンダリ</Button>);
    const btn = screen.getByRole("button", { name: "セカンダリ" });
    expect(btn).toBeInTheDocument();
    expect(btn.className).toMatch(/bg-bg/u);
  });

  it("variant='success' が描画されクラスに bg-success が含まれる", () => {
    render(<Button variant="success">成功</Button>);
    const btn = screen.getByRole("button", { name: "成功" });
    expect(btn).toBeInTheDocument();
    expect(btn.className).toMatch(/bg-success/u);
  });

  it("variant='ghost' が描画されクラスに bg-transparent が含まれる", () => {
    render(<Button variant="ghost">ゴースト</Button>);
    const btn = screen.getByRole("button", { name: "ゴースト" });
    expect(btn).toBeInTheDocument();
    expect(btn.className).toMatch(/bg-transparent/u);
  });

  it("variant='white' が描画されクラスに bg-white が含まれる", () => {
    render(<Button variant="white">ホワイト</Button>);
    const btn = screen.getByRole("button", { name: "ホワイト" });
    expect(btn).toBeInTheDocument();
    expect(btn.className).toMatch(/bg-white/u);
  });

  it("variant='outlineWhite' が描画されクラスに bg-transparent と border-white が含まれる", () => {
    render(<Button variant="outlineWhite">アウトライン</Button>);
    const btn = screen.getByRole("button", { name: "アウトライン" });
    expect(btn).toBeInTheDocument();
    expect(btn.className).toMatch(/bg-transparent/u);
    expect(btn.className).toMatch(/border-white/u);
  });

  it("size='sm' のときクラスに px-4 が含まれる", () => {
    render(<Button size="sm">スモール</Button>);
    const btn = screen.getByRole("button", { name: "スモール" });
    expect(btn.className).toMatch(/px-4/u);
  });

  it("デフォルト variant=primary のときクラスに bg-primary が含まれる", () => {
    render(<Button>プライマリ</Button>);
    const btn = screen.getByRole("button", { name: "プライマリ" });
    expect(btn.className).toMatch(/bg-primary/u);
  });

  it("disabled のときクラスに disabled:opacity-50 と disabled:cursor-not-allowed が含まれる", () => {
    render(<Button disabled>無効ボタン</Button>);
    const btn = screen.getByRole("button", { name: "無効ボタン" });
    expect(btn.className).toMatch(/disabled:opacity-50/u);
    expect(btn.className).toMatch(/disabled:cursor-not-allowed/u);
  });

  it("カスタム className が追記されデフォルトクラスも維持される", () => {
    render(<Button className="my-custom-class">カスタム</Button>);
    const btn = screen.getByRole("button", { name: "カスタム" });
    expect(btn.className).toMatch(/my-custom-class/u);
    expect(btn.className).toMatch(/bg-primary/u);
  });

  it("HTML 属性 (type, data-*) がスプレッドで渡される", () => {
    render(
      <Button type="submit" data-testid="submit-btn">
        送信
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "送信" });
    expect(btn).toHaveAttribute("type", "submit");
    expect(btn).toHaveAttribute("data-testid", "submit-btn");
  });
});
