import type { Meta, StoryObj } from "@storybook/react-vite";

import { MatchResultBoard } from "./MatchResultBoard";

const meta = {
  title: "Domain/MatchResultBoard",
  component: MatchResultBoard,
  tags: ["autodocs"],
} satisfies Meta<typeof MatchResultBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

// 一覧カード（明背景・小フォント・勝者バッジ）用の枠デコレータ。
const cardDecorator: Story["decorators"] = [
  (Story) => (
    <div className="border-line overflow-hidden rounded-2xl border-2 py-4">
      <Story />
    </div>
  ),
];

// 全画面スコアボード（青背景・特大フォント）用の枠デコレータ。
const scoreboardDecorator: Story["decorators"] = [
  (Story) => (
    <div className="flex min-h-screen flex-col bg-blue-800 text-white">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-auto px-4 py-6">
        <Story />
      </div>
    </div>
  ),
];

const games = [
  { leftScore: 11, rightScore: 5, leftWon: true, rightWon: false },
  { leftScore: 9, rightScore: 11, leftWon: false, rightWon: true },
  { leftScore: 11, rightScore: 8, leftWon: true, rightWon: false },
];

// 左（自分）勝ち
export const LeftWin: Story = {
  decorators: cardDecorator,
  args: {
    left: { name: "山田", wins: 2, isWinner: true },
    right: { name: "佐藤", wins: 1, isWinner: false },
    games,
  },
};

// 右（相手）勝ち
export const RightWin: Story = {
  decorators: cardDecorator,
  args: {
    left: { name: "山田", wins: 1, isWinner: false },
    right: { name: "佐藤", wins: 2, isWinner: true },
    games: [
      { leftScore: 5, rightScore: 11, leftWon: false, rightWon: true },
      { leftScore: 11, rightScore: 9, leftWon: true, rightWon: false },
      { leftScore: 8, rightScore: 11, leftWon: false, rightWon: true },
    ],
  },
};

// ゲーム未消化（空games）
export const NoGames: Story = {
  decorators: cardDecorator,
  args: {
    left: { name: "山田", wins: 0, isWinner: false },
    right: { name: "佐藤", wins: 0, isWinner: false },
    games: [],
  },
};

// 全画面スコアボード: 左勝ち
export const ScoreboardLeftWins: Story = {
  decorators: scoreboardDecorator,
  parameters: { layout: "fullscreen" },
  args: {
    variant: "scoreboard",
    left: { name: "田中 太郎", wins: 2, isWinner: true },
    right: { name: "鈴木 花子", wins: 1, isWinner: false },
    games,
  },
};

// 全画面スコアボード: 右勝ち
export const ScoreboardRightWins: Story = {
  decorators: scoreboardDecorator,
  parameters: { layout: "fullscreen" },
  args: {
    variant: "scoreboard",
    left: { name: "田中 太郎", wins: 1, isWinner: false },
    right: { name: "鈴木 花子", wins: 3, isWinner: true },
    games: [
      { leftScore: 11, rightScore: 9, leftWon: true, rightWon: false },
      { leftScore: 6, rightScore: 11, leftWon: false, rightWon: true },
      { leftScore: 8, rightScore: 11, leftWon: false, rightWon: true },
      { leftScore: 9, rightScore: 11, leftWon: false, rightWon: true },
    ],
  },
};
