import { EmptyState } from "@/components/ui/EmptyState";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("EmptyState", () => {
  it("省略時は「データがありません」を card (div) で描画する", () => {
    const { container } = render(<EmptyState />);
    const el = container.firstElementChild;
    expect(el?.tagName).toBe("DIV");
    expect(screen.getByText("データがありません")).toBeInTheDocument();
    expect(el?.className).toMatch(/rounded-2xl/u);
    expect(el?.className).toMatch(/border-2/u);
  });

  it("variant='plain' は p 要素で py-8 text-center を持つ", () => {
    const { container } = render(<EmptyState variant="plain" />);
    const el = container.firstElementChild;
    expect(el?.tagName).toBe("P");
    expect(el?.className).toMatch(/py-8/u);
    expect(el?.className).toMatch(/text-center/u);
  });

  it("variant='listItem' は li 要素で p-4 を持つ", () => {
    const { container } = render(<EmptyState variant="listItem" />);
    const el = container.firstElementChild;
    expect(el?.tagName).toBe("LI");
    expect(el?.className).toMatch(/p-4/u);
  });

  it("message で文言を上書きできる", () => {
    render(<EmptyState message="まだ試合がありません。" />);
    expect(screen.getByText("まだ試合がありません。")).toBeInTheDocument();
  });
});
