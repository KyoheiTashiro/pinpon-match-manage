import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "./Badge";

const tones = ["primary", "success", "warning", "danger", "neutral"] as const;
const appearances = ["solid", "soft", "outline"] as const;
const sizes = ["sm", "md"] as const;

const meta = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: { children: "バッジ" },
  argTypes: {
    tone: { control: "select", options: tones },
    appearance: { control: "select", options: appearances },
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = { args: { tone: "success", appearance: "solid", children: "終了" } };
export const Warning: Story = { args: { tone: "warning", appearance: "soft", children: "途中" } };
export const Primary: Story = {
  args: { tone: "primary", appearance: "outline", children: "対戦" },
};

export const Small: Story = { args: { size: "sm", children: "小" } };
export const Medium: Story = { args: { size: "md", children: "中" } };

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {sizes.map((size) => (
        <Badge key={size} {...args} size={size}>
          {size}
        </Badge>
      ))}
    </div>
  ),
};

export const Matrix: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {appearances.map((appearance) => (
        <div key={appearance} className="flex flex-wrap items-center gap-3">
          {tones.map((tone) => (
            <Badge key={tone} {...args} tone={tone} appearance={appearance}>
              {tone}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  ),
};
