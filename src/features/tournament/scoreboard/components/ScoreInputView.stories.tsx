import { SIDE } from "@/domain/match";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { ScoreInputView } from "./ScoreInputView";

const meta = {
  title: "Tournament/ScoreInputView",
  component: ScoreInputView,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
  decorators: [
    (Story) => (
      <div className="flex min-h-screen flex-col bg-black text-white">
        <Story />
      </div>
    ),
  ],
  args: {
    leftName: "田中 太郎",
    rightName: "鈴木 花子",
    leftScore: 8,
    rightScore: 6,
    leftWins: 1,
    rightWins: 0,
    winner: null,
    matchWinner: null,
    leftMatchPoint: false,
    rightMatchPoint: false,
    server: SIDE.LEFT,
    locked: false,
    swapped: false,
    onSwap: fn(),
    onAddLeft: fn(),
    onSubLeft: fn(),
    onAddRight: fn(),
    onSubRight: fn(),
    canSubLeft: true,
    canSubRight: true,
  },
} satisfies Meta<typeof ScoreInputView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress: Story = {};

export const LeftMatchPoint: Story = {
  args: {
    leftScore: 10,
    rightScore: 7,
    leftMatchPoint: true,
    server: SIDE.LEFT,
  },
};

export const GameWonByRight: Story = {
  args: {
    leftScore: 9,
    rightScore: 11,
    winner: SIDE.RIGHT,
    server: SIDE.RIGHT,
  },
};

export const Locked: Story = {
  args: {
    locked: true,
    leftScore: 11,
    rightScore: 8,
    leftWins: 3,
    rightWins: 1,
    matchWinner: SIDE.LEFT,
    winner: SIDE.LEFT,
    server: null,
    canSubLeft: false,
    canSubRight: false,
  },
};
