import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { SegmentedContro } from "./SegmentedControl";

const options = [
  { value: "xsmall", label: "極小" },
  { value: "small", label: "小" },
  { value: "normal", label: "標準" },
  { value: "large", label: "大" },
  { value: "xlarge", label: "特大" },
];

const meta = {
  title: "UI/SegmentedControl",
  component: SegmentedControl,
  parameters: { layout: "padded" },
  args: { ariaLabel: "文字サイズ", options, value: "normal", onChange: () => {} },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <SegmentedControl {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NormalSelected: Story = {};
