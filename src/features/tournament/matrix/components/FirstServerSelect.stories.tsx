import { SIDE } from "@/domain/match";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { FirstServerSelect } from "./FirstServerSelect";

const meta = {
  title: "Tournament/FirstServerSelect",
  component: FirstServerSelect,
  parameters: { layout: "padded" },
  args: {
    leftName: "田中 太郎",
    rightName: "鈴木 花子",
    value: SIDE.LEFT,
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <FirstServerSelect {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof FirstServerSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LeftSelected: Story = {};

export const RightSelected: Story = {
  args: { value: SIDE.RIGHT },
};

export const DoublesNames: Story = {
  args: {
    leftName: "田中 / 佐藤",
    rightName: "鈴木 / 高橋",
  },
};
