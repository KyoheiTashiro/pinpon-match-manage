import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Select } from "./Select";

const options = [
  { value: "singles", label: "シングルス" },
  { value: "doubles", label: "ダブルス" },
  { value: "mixed", label: "ミックス" },
];

const meta = {
  title: "UI/Select",
  component: Select,
  parameters: { layout: "padded" },
  args: { label: "対戦形式", options, value: "singles", onChange: () => {} },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <Select {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithPlaceholder: Story = {
  args: { value: "", placeholder: "選択してください" },
};
