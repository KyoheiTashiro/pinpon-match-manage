import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Calendar } from "./Calendar";

const meta = {
  title: "UI/Calendar",
  component: Calendar,
  parameters: { layout: "padded" },
  args: { value: "2026-06-21", onChange: () => {} },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return (
      <div className="max-w-xs">
        <Calendar {...args} value={value} onChange={setValue} />
      </div>
    );
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { value: "", placeholder: "日付を選択" },
};

export const Disabled: Story = {
  args: { disabled: true },
};
