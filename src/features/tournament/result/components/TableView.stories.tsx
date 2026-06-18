import { SIDE } from "@/domain/match";
import type { MatchResultRow } from "@/features/tournament/result/hooks";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { TableView } from "./TableView";

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
];

const matchResults: MatchResultRow[] = [
  {
    id: "m1",
    leftName: "田中 太郎",
    rightName: "鈴木 花子",
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
    leftName: "田中 太郎",
    rightName: "佐藤 健",
    games: [
      { leftScore: 11, rightScore: 5 },
      { leftScore: 11, rightScore: 9 },
    ],
    leftWins: 2,
    rightWins: 0,
    winner: SIDE.LEFT,
    firstServer: SIDE.RIGHT,
  },
];

const meta = {
  title: "Tournament/TableView",
  component: TableView,
  parameters: { layout: "padded" },
  args: { rows, matchResults, bestOf: 3 },
} satisfies Meta<typeof TableView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RankingOnly: Story = {
  args: { matchResults: [] },
};
