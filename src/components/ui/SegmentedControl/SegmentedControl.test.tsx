import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

const options = [
  { value: "normal", label: "標準" },
  { value: "large", label: "大" },
  { value: "xlarge", label: "特大" },
];

describe("SegmentedControl", () => {
  it("role='radiogroup' に aria-label が設定される", () => {
    render(
      <SegmentedControl
        ariaLabel="文字サイズ"
        value="normal"
        options={options}
        onChange={vi.fn<(v: string) => void>()}
      />,
    );
    expect(screen.getByRole("radiogroup", { name: "文字サイズ" })).toBeInTheDocument();
  });

  it("各セグメントが role='radio' で描画される", () => {
    render(
      <SegmentedControl
        ariaLabel="文字サイズ"
        value="normal"
        options={options}
        onChange={vi.fn<(v: string) => void>()}
      />,
    );
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("選択中セグメントの aria-checked が true", () => {
    render(
      <SegmentedControl
        ariaLabel="文字サイズ"
        value="large"
        options={options}
        onChange={vi.fn<(v: string) => void>()}
      />,
    );
    expect(screen.getByRole("radio", { name: "標準" })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("radio", { name: "大" })).toHaveAttribute("aria-checked", "true");
  });

  it("クリックで onChange が正しい value で呼ばれる", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(v: string) => void>();
    render(
      <SegmentedControl
        ariaLabel="文字サイズ"
        value="normal"
        options={options}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole("radio", { name: "特大" }));
    expect(onChange).toHaveBeenCalledWith("xlarge");
  });

  it("選択中セグメントが bg-white text-ink スタイルを持つ", () => {
    render(
      <SegmentedControl
        ariaLabel="文字サイズ"
        value="large"
        options={options}
        onChange={vi.fn<(v: string) => void>()}
      />,
    );
    const active = screen.getByRole("radio", { name: "大" });
    expect(active.className).toMatch(/bg-white/u);
    expect(active.className).toMatch(/text-ink/u);
  });

  it("非選択セグメントが text-ink bg-transparent スタイルを持つ", () => {
    render(
      <SegmentedControl
        ariaLabel="文字サイズ"
        value="large"
        options={options}
        onChange={vi.fn<(v: string) => void>()}
      />,
    );
    const inactive = screen.getByRole("radio", { name: "標準" });
    expect(inactive.className).toMatch(/text-ink/u);
    expect(inactive.className).toMatch(/bg-transparent/u);
  });

  it("value が number 型でも動作する", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(v: number) => void>();
    const numOptions = [
      { value: 3, label: "3ゲーム" },
      { value: 5, label: "5ゲーム" },
    ];
    render(
      <SegmentedControl ariaLabel="ゲーム数" value={3} options={numOptions} onChange={onChange} />,
    );
    expect(screen.getByRole("radio", { name: "3ゲーム" })).toHaveAttribute("aria-checked", "true");
    await user.click(screen.getByRole("radio", { name: "5ゲーム" }));
    expect(onChange).toHaveBeenCalledWith(5);
  });
});
