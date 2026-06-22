import { SIDE } from "@/domain/match";
import type { SideView } from "@/features/tournament/scoreboard/types";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { ScoreInputView } from "./ScoreInputView";

const baseLeft: SideView = {
  name: "田中 太郎",
  score: 8,
  isGameWinner: false,
  isMatchWinner: false,
  isMatchPoint: false,
  isServing: true,
  disabled: false,
  disableAdd: false,
  canSub: true,
  onAdd: fn<() => void>(),
  onSub: fn<() => void>(),
};

const baseRight: SideView = {
  ...baseLeft,
  name: "鈴木 花子",
  score: 6,
  isServing: false,
  onAdd: fn<() => void>(),
  onSub: fn<() => void>(),
};

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
    left: baseLeft,
    right: baseRight,
    leftWins: 1,
    rightWins: 0,
    matchWinner: null,
    locked: false,
    swapped: false,
    onSwap: fn<() => void>(),
  },
} satisfies Meta<typeof ScoreInputView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress: Story = {};

export const LeftMatchPoint: Story = {
  args: {
    left: { ...baseLeft, score: 10, isMatchPoint: true, isServing: true },
    right: { ...baseRight, score: 7 },
  },
};

export const GameWonByRight: Story = {
  args: {
    left: { ...baseLeft, score: 9, isServing: false },
    right: { ...baseRight, score: 11, isGameWinner: true, disableAdd: true, isServing: true },
  },
};

export const Locked: Story = {
  args: {
    left: {
      ...baseLeft,
      score: 11,
      isGameWinner: true,
      isMatchWinner: true,
      isServing: false,
      disabled: true,
      disableAdd: true,
      canSub: false,
    },
    right: { ...baseRight, score: 8, isServing: false, disabled: true, canSub: false },
    leftWins: 3,
    rightWins: 1,
    matchWinner: SIDE.LEFT,
    locked: true,
  },
};
