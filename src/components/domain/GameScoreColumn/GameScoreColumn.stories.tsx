import type { Meta, StoryObj } from "@storybook/react-vite";

import { GameScoreColumn } from "./GameScoreColumn";

const meta = {
  title: "Domain/GameScoreColumn",
  component: GameScoreColumn,
  tags: ["autodocs"],
} satisfies Meta<typeof GameScoreColumn>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleGames = [
  { leftScore: 11, rightScore: 5, leftWon: true, rightWon: false },
  { leftScore: 9, rightScore: 11, leftWon: false, rightWon: true },
  { leftScore: 11, rightScore: 8, leftWon: true, rightWon: false },
];

// スコアボード(MatchResultBoard variant="scoreboard")用: 緑勝者色・白系区切り
export const Scoreboard: Story = {
  args: {
    games: sampleGames,
    className: "text-[clamp(1.75rem,4vw,3.5rem)] font-extrabold sm:gap-3",
    winClassName: "text-green-500",
    separatorClassName: "text-white/40",
  },
  decorators: [
    (Story) => (
      <div className="bg-black p-6">
        <Story />
      </div>
    ),
  ],
};

// 個人結果(PersonalMatchResults)用: success 色・sub 区切り
export const Personal: Story = {
  args: {
    games: sampleGames,
    className: "w-full min-w-0 px-4 text-lg",
    winClassName: "text-success",
    separatorClassName: "text-sub",
  },
};

// 空配列: 何も表示されない
export const Empty: Story = {
  args: {
    games: [],
    winClassName: "text-success",
    separatorClassName: "text-sub",
  },
};

// 勝者なし（同点・未確定）: 色なし
export const NoWinner: Story = {
  args: {
    games: [{ leftScore: 10, rightScore: 10, leftWon: false, rightWon: false }],
    winClassName: "text-success",
    separatorClassName: "text-sub",
  },
};
