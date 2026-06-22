import type { Meta, StoryObj } from "@storybook/react-vite";

import { WinnerBadge } from "./WinnerBadge";

const sizes = ["xs", "sm", "sm-xs", "lg"] as const;

const meta = {
  title: "Domain/WinnerBadge",
  component: WinnerBadge,
  tags: ["autodocs"],
  args: { size: "sm" },
  argTypes: {
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof WinnerBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Xs: Story = { args: { size: "xs" } };
export const Sm: Story = { args: { size: "sm" } };
export const SmXs: Story = { args: { size: "sm-xs" } };
export const Lg: Story = { args: { size: "lg" } };

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {sizes.map((size) => (
        <WinnerBadge key={size} size={size} />
      ))}
    </div>
  ),
};
