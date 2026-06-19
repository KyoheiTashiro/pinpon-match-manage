import { RadioGroup } from "@/components/ui/RadioGroup";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

const options = [
  { value: "x", label: "選択肢X" },
  { value: "y", label: "選択肢Y" },
  { value: "z", label: "選択肢Z" },
];

describe("RadioGroup", () => {
  it("legend テキストが描画される", () => {
    render(
      <RadioGroup
        legend="テスト凡例"
        name="test"
        value="x"
        options={options}
        onChange={vi.fn<(v: string) => void>()}
      />,
    );
    expect(screen.getByText("テスト凡例")).toBeInTheDocument();
  });

  it("各 option が radio input として描画される", () => {
    render(
      <RadioGroup
        legend="凡例"
        name="test"
        value="x"
        options={options}
        onChange={vi.fn<(v: string) => void>()}
      />,
    );
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
  });

  it("選択中の input が checked=true", () => {
    render(
      <RadioGroup
        legend="凡例"
        name="test"
        value="y"
        options={options}
        onChange={vi.fn<(v: string) => void>()}
      />,
    );
    expect(screen.getByLabelText("選択肢X")).not.toBeChecked();
    expect(screen.getByLabelText("選択肢Y")).toBeChecked();
    expect(screen.getByLabelText("選択肢Z")).not.toBeChecked();
  });

  it("変更で onChange が正しい value で呼ばれる", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(v: string) => void>();
    render(
      <RadioGroup legend="凡例" name="test" value="x" options={options} onChange={onChange} />,
    );
    await user.click(screen.getByLabelText("選択肢Z"));
    expect(onChange).toHaveBeenCalledWith("z");
  });

  it("value が number 型でも動作する", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(v: number) => void>();
    const numOptions = [
      { value: 1, label: "一" },
      { value: 2, label: "二" },
    ];
    render(
      <RadioGroup legend="数字" name="num" value={1} options={numOptions} onChange={onChange} />,
    );
    await user.click(screen.getByLabelText("二"));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("選択中 option の label 要素がアクティブスタイルを持つ", () => {
    render(
      <RadioGroup
        legend="凡例"
        name="test"
        value="y"
        options={options}
        onChange={vi.fn<(v: string) => void>()}
      />,
    );
    const yLabel = screen.getByLabelText("選択肢Y").closest("label")!;
    expect(yLabel.className).toMatch(/border-primary/u);
    expect(yLabel.className).toMatch(/bg-primary/u);
    expect(yLabel.className).toMatch(/text-white/u);
  });

  it("未選択 option の label 要素が非アクティブスタイルを持つ", () => {
    render(
      <RadioGroup
        legend="凡例"
        name="test"
        value="y"
        options={options}
        onChange={vi.fn<(v: string) => void>()}
      />,
    );
    const xLabel = screen.getByLabelText("選択肢X").closest("label")!;
    expect(xLabel.className).toMatch(/border-line/u);
    expect(xLabel.className).toMatch(/bg-white/u);
    expect(xLabel.className).toMatch(/text-ink/u);
  });

  it("options が空配列のとき何も描画されない", () => {
    render(
      <RadioGroup
        legend="凡例"
        name="test"
        value="x"
        options={[]}
        onChange={vi.fn<(v: string) => void>()}
      />,
    );
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
  });

  it("fieldset/legend で role='group' + name がアクセシブル", () => {
    render(
      <RadioGroup
        legend="テスト凡例"
        name="test"
        value="x"
        options={options}
        onChange={vi.fn<(v: string) => void>()}
      />,
    );
    expect(screen.getByRole("group", { name: "テスト凡例" })).toBeInTheDocument();
  });
});
