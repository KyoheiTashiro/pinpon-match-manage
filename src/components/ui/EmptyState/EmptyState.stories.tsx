import type { Meta, StoryObj } from "@storybook/react-vite";

import { EmptyState } from "./EmptyState";

const variants = ["card", "plain", "listItem"] as const;

const meta = {
  title: "UI/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: variants },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Card: Story = { args: { variant: "card" } };
export const Plain: Story = {
  args: { variant: "plain", message: "まだ大会がありません。上のボタンから作成してください。" },
};
export const ListItem: Story = {
  args: { variant: "listItem", message: "まだ試合がありません。" },
  // listItem は li 要素のため ul でラップする
  render: (args) => (
    <ul className="divide-line border-line divide-y-2 overflow-hidden rounded-2xl border-2">
      <EmptyState {...args} />
    </ul>
  ),
};
