import { Badge } from "@/components/ui/Badge";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("Badge", () => {
  it("children を表示する", () => {
    render(<Badge>テスト</Badge>);
    expect(screen.getByText("テスト")).toBeInTheDocument();
  });

  it("デフォルト (tone=primary, appearance=soft) のときクラスに bg-primary/10 が含まれる", () => {
    render(<Badge>プライマリ</Badge>);
    expect(screen.getByText("プライマリ").className).toMatch(/bg-primary\/10/u);
  });

  it("appearance='solid' で bg-{tone} text-white が描画される", () => {
    render(
      <Badge tone="success" appearance="solid">
        終了
      </Badge>,
    );
    const el = screen.getByText("終了");
    expect(el.className).toMatch(/bg-success/u);
    expect(el.className).toMatch(/text-white/u);
  });

  it("appearance='soft' で bg-{tone}/10 が描画される", () => {
    render(<Badge tone="warning">途中</Badge>);
    expect(screen.getByText("途中").className).toMatch(/bg-warning\/10/u);
  });

  it("appearance='outline' で border と text-{tone} が描画される", () => {
    render(
      <Badge tone="danger" appearance="outline">
        棄権
      </Badge>,
    );
    const el = screen.getByText("棄権");
    expect(el.className).toMatch(/border-danger/u);
    expect(el.className).toMatch(/text-danger/u);
  });

  it("カスタム className が追記されデフォルトクラスも維持される", () => {
    render(<Badge className="my-custom-class">カスタム</Badge>);
    const el = screen.getByText("カスタム");
    expect(el.className).toMatch(/my-custom-class/u);
    expect(el.className).toMatch(/bg-primary\/10/u);
  });

  it("HTML 属性 (data-*) がスプレッドで渡される", () => {
    render(<Badge data-testid="badge">属性</Badge>);
    expect(screen.getByText("属性")).toHaveAttribute("data-testid", "badge");
  });
});
