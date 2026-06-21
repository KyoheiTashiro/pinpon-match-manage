import { Tabs } from "@/components/ui/Tabs";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

const options = [
  { value: "tab1", label: "タブ1" },
  { value: "tab2", label: "タブ2" },
  { value: "tab3", label: "タブ3" },
];

describe("Tabs", () => {
  it("role='tablist' に aria-label が設定される", () => {
    render(
      <Tabs
        ariaLabel="メインタブ"
        value="tab1"
        options={options}
        onChange={vi.fn<(v: string) => void>()}
      />,
    );
    expect(screen.getByRole("tablist", { name: "メインタブ" })).toBeInTheDocument();
  });

  it("各タブが role='tab' で描画される", () => {
    render(
      <Tabs
        ariaLabel="タブ"
        value="tab1"
        options={options}
        onChange={vi.fn<(v: string) => void>()}
      />,
    );
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
  });

  it("選択中タブの aria-selected が 'true'", () => {
    render(
      <Tabs
        ariaLabel="タブ"
        value="tab2"
        options={options}
        onChange={vi.fn<(v: string) => void>()}
      />,
    );
    expect(screen.getByRole("tab", { name: "タブ1" })).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("tab", { name: "タブ2" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "タブ3" })).toHaveAttribute("aria-selected", "false");
  });

  it("クリックで onChange が正しい value で呼ばれる", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(v: string) => void>();
    render(<Tabs ariaLabel="タブ" value="tab1" options={options} onChange={onChange} />);
    await user.click(screen.getByRole("tab", { name: "タブ3" }));
    expect(onChange).toHaveBeenCalledWith("tab3");
  });

  it("選択中タブが border-primary bg-primary/10 text-primary スタイルを持つ", () => {
    render(
      <Tabs
        ariaLabel="タブ"
        value="tab2"
        options={options}
        onChange={vi.fn<(v: string) => void>()}
      />,
    );
    const activeTab = screen.getByRole("tab", { name: "タブ2" });
    expect(activeTab.className).toMatch(/border-primary/u);
    expect(activeTab.className).toMatch(/bg-primary\/10/u);
    expect(activeTab.className).toMatch(/text-primary/u);
  });

  it("非選択タブが border-transparent bg-white text-ink スタイルを持つ", () => {
    render(
      <Tabs
        ariaLabel="タブ"
        value="tab2"
        options={options}
        onChange={vi.fn<(v: string) => void>()}
      />,
    );
    const inactiveTab = screen.getByRole("tab", { name: "タブ1" });
    expect(inactiveTab.className).toMatch(/border-transparent/u);
    expect(inactiveTab.className).toMatch(/bg-white/u);
    expect(inactiveTab.className).toMatch(/text-ink/u);
  });

  it("value が number 型でも動作する", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(v: number) => void>();
    const numOptions = [
      { value: 1, label: "タブA" },
      { value: 2, label: "タブB" },
    ];
    render(<Tabs ariaLabel="数字タブ" value={1} options={numOptions} onChange={onChange} />);
    expect(screen.getByRole("tab", { name: "タブA" })).toHaveAttribute("aria-selected", "true");
    await user.click(screen.getByRole("tab", { name: "タブB" }));
    expect(onChange).toHaveBeenCalledWith(2);
  });
});
