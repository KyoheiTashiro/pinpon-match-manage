import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Tabs } from "./Tabs";

const options = [
  { value: "table", label: "点数表" },
  { value: "graph", label: "点数グラフ" },
];

const meta = {
  title: "UI/Tabs",
  component: Tabs,
  parameters: { layout: "padded" },
  args: { ariaLabel: "表示モード", options, value: "table", onChange: () => {} },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <Tabs {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TableSelected: Story = {};
export const GraphSelected: Story = {
  args: { value: "graph" },
};
