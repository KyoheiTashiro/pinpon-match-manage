import { Select } from "@/components/ui/Select";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeAll } from "vitest";

// jsdom は scrollIntoView を実装していないため polyfill
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn<() => void>();
});

const options = [
  { value: "1", label: "りんご" },
  { value: "2", label: "みかん" },
  { value: "3", label: "ぶどう" },
];

describe("Select", () => {
  it("未選択時に placeholder が表示される", () => {
    render(
      <Select
        options={options}
        value={null}
        onChange={vi.fn<(v: string) => void>()}
        placeholder="選んでね"
      />,
    );
    expect(screen.getByText("選んでね")).toBeInTheDocument();
  });

  it("初期クローズ状態では listbox が非表示", () => {
    render(<Select options={options} value={null} onChange={vi.fn<(v: string) => void>()} />);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("トリガークリックで listbox が表示される", async () => {
    const user = userEvent.setup();
    render(
      <Select
        options={options}
        value={null}
        onChange={vi.fn<(v: string) => void>()}
        ariaLabel="フルーツ選択"
      />,
    );
    await user.click(screen.getByRole("button", { name: /フルーツ選択/u }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("option クリックで onChange が発火し listbox が閉じる", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(v: string) => void>();
    render(<Select options={options} value={null} onChange={onChange} ariaLabel="フルーツ選択" />);
    await user.click(screen.getByRole("button", { name: /フルーツ選択/u }));
    await user.click(screen.getByRole("option", { name: "みかん" }));
    expect(onChange).toHaveBeenCalledWith("2");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("disabled のとき trigger button が disabled", () => {
    render(
      <Select
        options={options}
        value={null}
        onChange={vi.fn<(v: string) => void>()}
        ariaLabel="フルーツ選択"
        disabled
      />,
    );
    expect(screen.getByRole("button", { name: /フルーツ選択/u })).toBeDisabled();
  });

  it("label prop がある場合に表示される", () => {
    render(
      <Select
        options={options}
        value={null}
        onChange={vi.fn<(v: string) => void>()}
        label="フルーツ"
      />,
    );
    expect(screen.getByText("フルーツ")).toBeInTheDocument();
  });

  it("トリガーで Enter キーを押すと listbox が開く", async () => {
    const user = userEvent.setup();
    render(
      <Select
        options={options}
        value={null}
        onChange={vi.fn<(v: string) => void>()}
        ariaLabel="フルーツ選択"
      />,
    );
    const trigger = screen.getByRole("button", { name: /フルーツ選択/u });
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("トリガーで Space キーを押すと listbox が開く", async () => {
    const user = userEvent.setup();
    render(
      <Select
        options={options}
        value={null}
        onChange={vi.fn<(v: string) => void>()}
        ariaLabel="フルーツ選択"
      />,
    );
    const trigger = screen.getByRole("button", { name: /フルーツ選択/u });
    trigger.focus();
    await user.keyboard(" ");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("トリガーで ArrowDown キーを押すと listbox が開く", async () => {
    const user = userEvent.setup();
    render(
      <Select
        options={options}
        value={null}
        onChange={vi.fn<(v: string) => void>()}
        ariaLabel="フルーツ選択"
      />,
    );
    const trigger = screen.getByRole("button", { name: /フルーツ選択/u });
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("listbox 上で ArrowDown/Up を押すと aria-activedescendant が変わる", async () => {
    const user = userEvent.setup();
    render(
      <Select
        options={options}
        value={null}
        onChange={vi.fn<(v: string) => void>()}
        ariaLabel="フルーツ選択"
        id="sel"
      />,
    );
    await user.click(screen.getByRole("button", { name: /フルーツ選択/u }));
    const listbox = screen.getByRole("listbox");
    // focusedIndex starts at 0 (no value match → Math.max(-1,0)=0)
    expect(listbox).toHaveAttribute("aria-activedescendant", "sel-option-0");
    await user.keyboard("{ArrowDown}");
    expect(listbox).toHaveAttribute("aria-activedescendant", "sel-option-1");
    await user.keyboard("{ArrowUp}");
    expect(listbox).toHaveAttribute("aria-activedescendant", "sel-option-0");
  });

  it("listbox 上で Enter を押すと選択され閉じる", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(v: string) => void>();
    render(
      <Select
        options={options}
        value={null}
        onChange={onChange}
        ariaLabel="フルーツ選択"
        id="sel"
      />,
    );
    await user.click(screen.getByRole("button", { name: /フルーツ選択/u }));
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("1");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("listbox 上で Space を押すと選択され閉じる", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(v: string) => void>();
    render(
      <Select
        options={options}
        value={null}
        onChange={onChange}
        ariaLabel="フルーツ選択"
        id="sel"
      />,
    );
    await user.click(screen.getByRole("button", { name: /フルーツ選択/u }));
    await user.keyboard(" ");
    expect(onChange).toHaveBeenCalledWith("1");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("listbox 上で Escape を押すと閉じてトリガーにフォーカスが戻る", async () => {
    const user = userEvent.setup();
    render(
      <Select
        options={options}
        value={null}
        onChange={vi.fn<(v: string) => void>()}
        ariaLabel="フルーツ選択"
      />,
    );
    const trigger = screen.getByRole("button", { name: /フルーツ選択/u });
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("listbox 上で Tab を押すと閉じるがトリガーにはフォーカスが戻らない", async () => {
    const user = userEvent.setup();
    render(
      <Select
        options={options}
        value={null}
        onChange={vi.fn<(v: string) => void>()}
        ariaLabel="フルーツ選択"
      />,
    );
    const trigger = screen.getByRole("button", { name: /フルーツ選択/u });
    await user.click(trigger);
    await user.keyboard("{Tab}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).not.toHaveFocus();
  });

  it("外部 pointerdown で listbox が閉じる", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Select
          options={options}
          value={null}
          onChange={vi.fn<(v: string) => void>()}
          ariaLabel="フルーツ選択"
        />
        <button>外部ボタン</button>
      </div>,
    );
    await user.click(screen.getByRole("button", { name: /フルーツ選択/u }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByRole("button", { name: "外部ボタン" }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("トリガー再クリックで listbox が閉じる", async () => {
    const user = userEvent.setup();
    render(
      <Select
        options={options}
        value={null}
        onChange={vi.fn<(v: string) => void>()}
        ariaLabel="フルーツ選択"
      />,
    );
    const trigger = screen.getByRole("button", { name: /フルーツ選択/u });
    await user.click(trigger);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.click(trigger);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("value に一致する option が aria-selected=true", async () => {
    const user = userEvent.setup();
    render(
      <Select
        options={options}
        value="2"
        onChange={vi.fn<(v: string) => void>()}
        ariaLabel="フルーツ選択"
      />,
    );
    await user.click(screen.getByRole("button", { name: /フルーツ選択/u }));
    expect(screen.getByRole("option", { name: "みかん" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: "りんご" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("value=null のとき全 option が aria-selected=false", async () => {
    const user = userEvent.setup();
    render(
      <Select
        options={options}
        value={null}
        onChange={vi.fn<(v: string) => void>()}
        ariaLabel="フルーツ選択"
      />,
    );
    await user.click(screen.getByRole("button", { name: /フルーツ選択/u }));
    for (const opt of screen.getAllByRole("option")) {
      expect(opt).toHaveAttribute("aria-selected", "false");
    }
  });

  it("mouseEnter で aria-activedescendant が変わる", async () => {
    const user = userEvent.setup();
    render(
      <Select
        options={options}
        value={null}
        onChange={vi.fn<(v: string) => void>()}
        ariaLabel="フルーツ選択"
        id="sel"
      />,
    );
    await user.click(screen.getByRole("button", { name: /フルーツ選択/u }));
    const listbox = screen.getByRole("listbox");
    const grapeOption = screen.getByRole("option", { name: "ぶどう" });
    fireEvent.mouseEnter(grapeOption);
    expect(listbox).toHaveAttribute("aria-activedescendant", "sel-option-2");
  });

  it("トリガーが aria-haspopup='listbox' と aria-expanded を持つ", async () => {
    const user = userEvent.setup();
    render(
      <Select
        options={options}
        value={null}
        onChange={vi.fn<(v: string) => void>()}
        ariaLabel="フルーツ選択"
      />,
    );
    const trigger = screen.getByRole("button", { name: /フルーツ選択/u });
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("disabled のときクリックで listbox が開かない", async () => {
    const user = userEvent.setup();
    render(
      <Select
        options={options}
        value={null}
        onChange={vi.fn<(v: string) => void>()}
        ariaLabel="フルーツ選択"
        disabled
      />,
    );
    await user.click(screen.getByRole("button", { name: /フルーツ選択/u }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("label と ariaLabel 共存時、トリガーが aria-labelledby を持ちラベルテキストを含む", () => {
    render(
      <Select
        options={options}
        value={null}
        onChange={vi.fn<(v: string) => void>()}
        label="フルーツ"
        ariaLabel="フルーツ選択"
      />,
    );
    const trigger = screen.getByRole("button");
    const labelledById = trigger.getAttribute("aria-labelledby");
    expect(labelledById).toBeTruthy();
    const ids = (labelledById ?? "").split(" ");
    expect(ids).toHaveLength(2);
    const labelEl = document.querySelector(`[id="${ids[0]}"]`);
    expect(labelEl?.textContent).toBe("フルーツ");
  });

  it("options が空のとき listbox を開いても option が描画されない", async () => {
    const user = userEvent.setup();
    render(
      <Select
        options={[]}
        value={null}
        onChange={vi.fn<(v: string) => void>()}
        ariaLabel="空選択"
      />,
    );
    await user.click(screen.getByRole("button", { name: /空選択/u }));
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("value が number 型でも動作する", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(v: number) => void>();
    const numOptions = [
      { value: 1, label: "一" },
      { value: 2, label: "二" },
    ];
    render(<Select options={numOptions} value={1} onChange={onChange} ariaLabel="数字選択" />);
    await user.click(screen.getByRole("button", { name: /数字選択/u }));
    expect(screen.getByRole("option", { name: "一" })).toHaveAttribute("aria-selected", "true");
    await user.click(screen.getByRole("option", { name: "二" }));
    expect(onChange).toHaveBeenCalledWith(2);
  });
});
