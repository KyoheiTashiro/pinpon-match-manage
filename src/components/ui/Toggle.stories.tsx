import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Toggle } from "./Toggle";

const meta = {
  title: "UI/Toggle",
  component: Toggle,
  parameters: { layout: "padded" },
  args: {
    label: "公開設定",
    ariaLabel: "公開設定",
    value: "public",
    options: [
      { value: "public", label: "公開" },
      { value: "private", label: "非公開" },
    ],
    onChange: () => {},
  },
  // 制御コンポーネントのため state を render 側で保持する。
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <Toggle {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutLabel: Story = {
  args: { label: undefined },
};

export const MatchType: Story = {
  args: {
    label: "対戦形式",
    ariaLabel: "対戦形式",
    value: "single",
    options: [
      { value: "single", label: "シングルス" },
      { value: "double", label: "ダブルス" },
    ],
  },
};
