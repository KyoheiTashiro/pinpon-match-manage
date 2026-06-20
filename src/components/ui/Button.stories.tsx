import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./Button";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: "ボタン" },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "danger", "success", "ghost", "white", "outlineWhite"],
    },
    size: { control: "select", options: ["sm", "md"] },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Danger: Story = { args: { variant: "danger" } };
export const Success: Story = { args: { variant: "success" } };
export const Ghost: Story = { args: { variant: "ghost" } };

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="danger">
        Danger
      </Button>
      <Button {...args} variant="success">
        Success
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
    </div>
  ),
};

// primaryバー上で使う白系variant。背景を暗くして視認性を確保。
export const OnPrimaryBar: Story = {
  parameters: { backgrounds: { default: "primary" } },
  render: (args) => (
    <div className="bg-primary flex flex-wrap gap-3 rounded-xl p-4">
      <Button {...args} variant="white">
        White
      </Button>
      <Button {...args} variant="outlineWhite">
        OutlineWhite
      </Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
    </div>
  ),
};

export const Disabled: Story = { args: { disabled: true } };
