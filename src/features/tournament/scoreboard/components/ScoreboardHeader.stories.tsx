import type { Game } from "@/domain/match";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { ScoreboardHeader } from "./ScoreboardHeader";

const games: Game[] = [
  { leftScore: 11, rightScore: 8 },
  { leftScore: 9, rightScore: 11 },
  { leftScore: 5, rightScore: 3 },
  { leftScore: 0, rightScore: 0 },
  { leftScore: 0, rightScore: 0 },
];

const meta = {
  title: "Tournament/ScoreboardHeader",
  component: ScoreboardHeader,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
  decorators: [
    (Story) => (
      <div className="bg-black text-white">
        <Story />
      </div>
    ),
  ],
  args: {
    games,
    gameIndex: 2,
    setGameIndex: fn<(index: number) => void>(),
    lockedFromIndex: 3,
    showResult: false,
    showNextGameBtn: false,
    showResultBtn: false,
    showBackBtn: false,
    nextGameIndex: 3,
    onBack: fn<() => void>(),
    onShowResult: fn<() => void>(),
    onCloseAll: fn<() => void>(),
  },
} satisfies Meta<typeof ScoreboardHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithNextGameButton: Story = {
  args: { showNextGameBtn: true },
};

export const WithResultButton: Story = {
  args: { showResultBtn: true },
};

export const ResultView: Story = {
  args: { showResult: true, showBackBtn: true },
};
