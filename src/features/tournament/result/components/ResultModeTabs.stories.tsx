import { DISPLAY_MODE } from "@/features/tournament/result/hooks";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { ResultModeTabs } from "./ResultModeTabs";

const meta = {
  title: "Tournament/ResultModeTabs",
  component: ResultModeTabs,
  parameters: { layout: "padded" },
  args: { mode: DISPLAY_MODE.TABLE },
  render: function Render(args) {
    const [mode, setMode] = useState(args.mode);
    return <ResultModeTabs {...args} mode={mode} setMode={setMode} />;
  },
} satisfies Meta<typeof ResultModeTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TableSelected: Story = {};

export const GraphSelected: Story = {
  args: { mode: DISPLAY_MODE.GRAPH },
};
