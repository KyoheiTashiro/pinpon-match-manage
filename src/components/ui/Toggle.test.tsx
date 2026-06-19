import { Toggle } from "@/components/ui/Toggle";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

const options = [
  { value: "a", label: "オプションA" },
  { value: "b", label: "オプションB" },
  { value: "c", label: "オプションC" },
];

describe("Toggle", () => {
  it("role='radiogroup' に aria-label が設定される", () => {
    render(
      <Toggle
        ariaLabel="テストグループ"
        value="a"
        options={options}
        onChange={vi.fn<(v: string) => void>()}
      />,
    );
    expect(screen.getByRole("radiogroup", { name: "テストグループ" })).toBeInTheDocument();
  });

  it("各 option が role='radio' で描画される", () => {
    render(
      <Toggle
        ariaLabel="グループ"
        value="a"
        options={options}
        onChange={vi.fn<(v: string) => void>()}
      />,
    );
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
  });

  it("選択中の option の aria-checked が 'true' でそれ以外が 'false'", () => {
    render(
      <Toggle
        ariaLabel="グループ"
        value="b"
        options={options}
        onChange={vi.fn<(v: string) => void>()}
      />,
    );
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toHaveAttribute("aria-checked", "false");
    expect(radios[1]).toHaveAttribute("aria-checked", "true");
    expect(radios[2]).toHaveAttribute("aria-checked", "false");
  });

  it("label prop があるときテキストが表示される", () => {
    render(
      <Toggle
        label="表示ラベル"
        ariaLabel="グループ"
        value="a"
        options={options}
        onChange={vi.fn<(v: string) => void>()}
      />,
    );
    expect(screen.getByText("表示ラベル")).toBeInTheDocument();
  });

  it("クリックで onChange が正しい value で呼ばれる", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(v: string) => void>();
    render(<Toggle ariaLabel="グループ" value="a" options={options} onChange={onChange} />);
    await user.click(screen.getByRole("radio", { name: "オプションB" }));
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("label 未指定のとき span が描画されない", () => {
    render(
      <Toggle
        ariaLabel="グループ"
        value="a"
        options={options}
        onChange={vi.fn<(v: string) => void>()}
      />,
    );
    const spans = document.querySelectorAll("span");
    expect(spans).toHaveLength(0);
  });

  it("選択中 option が bg-white font-extrabold shadow-md スタイルを持つ", () => {
    render(
      <Toggle
        ariaLabel="グループ"
        value="b"
        options={options}
        onChange={vi.fn<(v: string) => void>()}
      />,
    );
    const activeBtn = screen.getByRole("radio", { name: "オプションB" });
    expect(activeBtn.className).toMatch(/bg-white/u);
    expect(activeBtn.className).toMatch(/font-extrabold/u);
    expect(activeBtn.className).toMatch(/shadow-md/u);
  });

  it("非選択 option が bg-transparent font-medium スタイルを持つ", () => {
    render(
      <Toggle
        ariaLabel="グループ"
        value="b"
        options={options}
        onChange={vi.fn<(v: string) => void>()}
      />,
    );
    const inactiveBtn = screen.getByRole("radio", { name: "オプションA" });
    expect(inactiveBtn.className).toMatch(/bg-transparent/u);
    expect(inactiveBtn.className).toMatch(/font-medium/u);
  });

  it("value が number 型でも動作する", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(v: number) => void>();
    const numOptions = [
      { value: 1, label: "一" },
      { value: 2, label: "二" },
    ];
    render(<Toggle ariaLabel="数字グループ" value={1} options={numOptions} onChange={onChange} />);
    expect(screen.getByRole("radio", { name: "一" })).toHaveAttribute("aria-checked", "true");
    await user.click(screen.getByRole("radio", { name: "二" }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("options 空配列のとき radio が描画されない", () => {
    render(
      <Toggle
        ariaLabel="グループ"
        value="a"
        options={[]}
        onChange={vi.fn<(v: string) => void>()}
      />,
    );
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
  });
});
