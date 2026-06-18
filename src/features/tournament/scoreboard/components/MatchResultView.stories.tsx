import { SIDE } from "@/domain/match";
import type { Game } from "@/domain/match";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MatchResultView } from "./MatchResultView";

const games: Game[] = [
  { leftScore: 11, rightScore: 8 },
  { leftScore: 9, rightScore: 11 },
  { leftScore: 11, rightScore: 6 },
];

const meta = {
  title: "Tournament/MatchResultView",
  component: MatchResultView,
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
    leftWins: 2,
    rightWins: 1,
    matchWinner: SIDE.LEFT,
    games,
    swapped: false,
  },
} satisfies Meta<typeof MatchResultView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LeftWins: Story = {};

export const RightWins: Story = {
  args: {
    leftWins: 1,
    rightWins: 3,
    matchWinner: SIDE.RIGHT,
    games: [
      { leftScore: 11, rightScore: 9 },
      { leftScore: 6, rightScore: 11 },
      { leftScore: 8, rightScore: 11 },
      { leftScore: 9, rightScore: 11 },
    ],
  },
};

export const Swapped: Story = {
  args: { swapped: true },
};
