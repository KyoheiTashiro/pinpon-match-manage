import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { RadioGroup } from "./RadioGroup";

const options = [
  { value: "single", label: "シングルス" },
  { value: "double", label: "ダブルス" },
  { value: "round", label: "総当たり" },
];

const meta = {
  title: "UI/RadioGroup",
  component: RadioGroup,
  parameters: { layout: "padded" },
  args: { legend: "対戦形式を選択", name: "matchType", options, value: "single" },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <RadioGroup {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const SetCount: Story = {
  args: {
    legend: "セット数",
    name: "setCount",
    value: "3",
    options: [
      { value: "1", label: "1セットマッチ" },
      { value: "3", label: "3セットマッチ" },
      { value: "5", label: "5セットマッチ" },
    ],
  },
};
