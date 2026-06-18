import type { Meta, StoryObj } from "@storybook/react-vite";

import { RankingTable } from "./RankingTable";

const rows = [
  {
    participantId: "p1",
    name: "田中 太郎",
    played: 3,
    wins: 3,
    losses: 0,
    gamesWon: 9,
    gamesLost: 2,
    gameDiff: 7,
    pointsFor: 121,
    pointsAgainst: 78,
    pointDiff: 43,
    rank: 1,
  },
  {
    participantId: "p2",
    name: "鈴木 花子",
    played: 3,
    wins: 2,
    losses: 1,
    gamesWon: 7,
    gamesLost: 5,
    gameDiff: 2,
    pointsFor: 110,
    pointsAgainst: 99,
    pointDiff: 11,
    rank: 2,
  },
  {
    participantId: "p3",
    name: "佐藤 健",
    played: 3,
    wins: 1,
    losses: 2,
    gamesWon: 4,
    gamesLost: 7,
    gameDiff: -3,
    pointsFor: 92,
    pointsAgainst: 105,
    pointDiff: -13,
    rank: 3,
  },
  {
    participantId: "p4",
    name: "高橋 美咲",
    played: 3,
    wins: 0,
    losses: 3,
    gamesWon: 1,
    gamesLost: 9,
    gameDiff: -8,
    pointsFor: 70,
    pointsAgainst: 111,
    pointDiff: -41,
    rank: 4,
  },
];

const meta = {
  title: "Tournament/RankingTable",
  component: RankingTable,
  parameters: { layout: "padded" },
  args: { rows },
} satisfies Meta<typeof RankingTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TwoPlayers: Story = {
  args: { rows: rows.slice(0, 2) },
};

export const Empty: Story = {
  args: { rows: [] },
};
