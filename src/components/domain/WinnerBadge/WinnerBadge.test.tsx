import { WinnerBadge } from "@/components/domain/WinnerBadge";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("WinnerBadge", () => {
  it("size='xs' を span 要素で描画する", () => {
    const { container } = render(<WinnerBadge size="xs" />);
    expect(container.firstElementChild?.tagName).toBe("SPAN");
  });

  it("size='sm' を span 要素で描画する", () => {
    const { container } = render(<WinnerBadge size="sm" />);
    expect(container.firstElementChild?.tagName).toBe("SPAN");
  });

  it("size='sm-xs' を span 要素で描画する", () => {
    const { container } = render(<WinnerBadge size="sm-xs" />);
    expect(container.firstElementChild?.tagName).toBe("SPAN");
  });

  it("size='lg' のみ div 要素で描画する", () => {
    const { container } = render(<WinnerBadge size="lg" />);
    expect(container.firstElementChild?.tagName).toBe("DIV");
  });
});
