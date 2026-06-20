import { SIDE } from "@/domain/match";
import type { MatchResultRow } from "@/features/tournament/result/hooks";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MatchResultsTable } from "./MatchResultsTable";

const matchResults: MatchResultRow[] = [
  {
    id: "m1",
    leftName: "田中 太郎",
    rightName: "鈴木 花子",
    leftMembers: ["a"],
    rightMembers: ["b"],
    games: [
      { leftScore: 11, rightScore: 8 },
      { leftScore: 9, rightScore: 11 },
      { leftScore: 11, rightScore: 6 },
    ],
    leftWins: 2,
    rightWins: 1,
    winner: SIDE.LEFT,
    firstServer: SIDE.LEFT,
  },
  {
    id: "m2",
    leftName: "佐藤 健",
    rightName: "高橋 美咲",
    leftMembers: ["c"],
    rightMembers: ["d"],
    games: [
      { leftScore: 7, rightScore: 11 },
      { leftScore: 5, rightScore: 11 },
    ],
    leftWins: 0,
    rightWins: 2,
    winner: SIDE.RIGHT,
    firstServer: SIDE.RIGHT,
  },
];

const meta = {
  title: "Tournament/MatchResultsTable",
  component: MatchResultsTable,
  parameters: { layout: "padded" },
  args: { matchResults, bestOf: 3 },
} satisfies Meta<typeof MatchResultsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const BestOf5: Story = {
  args: {
    bestOf: 5,
    matchResults: [
      {
        id: "m1",
        leftName: "田中 太郎",
        rightName: "鈴木 花子",
        leftMembers: ["a"],
        rightMembers: ["b"],
        games: [
          { leftScore: 11, rightScore: 8 },
          { leftScore: 9, rightScore: 11 },
          { leftScore: 11, rightScore: 6 },
          { leftScore: 8, rightScore: 11 },
          { leftScore: 12, rightScore: 10 },
        ],
        leftWins: 3,
        rightWins: 2,
        winner: SIDE.LEFT,
        firstServer: SIDE.LEFT,
      },
    ],
  },
};

export const SingleMatch: Story = {
  args: { matchResults: matchResults.slice(0, 1) },
};

// 空配列のとき「データがありません」を表示する（RankingTable と挙動を統一）。
export const Empty: Story = {
  args: { matchResults: [] },
  parameters: {
    docs: {
      description: {
        story: "対戦結果が0件のときは「データがありません」を表示する。",
      },
    },
  },
};
