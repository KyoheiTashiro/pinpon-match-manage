import type { Game } from "@/domain/match";
import { SCOREBOARD_ACTION } from "@/features/tournament/scoreboard/hooks";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { ScoreboardHeader } from "./ScoreboardHeader";

const games: Game[] = [
  { kind: "manual", leftScore: 11, rightScore: 8 },
  { kind: "manual", leftScore: 9, rightScore: 11 },
  { kind: "manual", leftScore: 5, rightScore: 3 },
  { kind: "manual", leftScore: 0, rightScore: 0 },
  { kind: "manual", leftScore: 0, rightScore: 0 },
];

const meta = {
  title: "Tournament/ScoreboardHeader",
  component: ScoreboardHeader,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
  decorators: [
    (Story) => (
      <div className="bg-blue-800 text-white">
        <Story />
      </div>
    ),
  ],
  args: {
    games,
    gameIndex: 2,
    setGameIndex: fn<(index: number) => void>(),
    isGameSelectable: (index: number) => index <= 2,
    showResult: false,
    action: null,
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
  args: { action: SCOREBOARD_ACTION.NEXT },
};

export const WithResultButton: Story = {
  args: { action: SCOREBOARD_ACTION.SHOW_RESULT },
};

export const ResultView: Story = {
  args: { showResult: true, action: SCOREBOARD_ACTION.CLOSE },
};
