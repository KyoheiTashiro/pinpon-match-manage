import type { Meta, StoryObj } from "@storybook/react-vite";

import { MatchMatrix, type MatrixPlayer, type MatrixResult } from "./MatchMatrix";

const PLAYERS: MatrixPlayer[] = [
  { id: "p1", name: "田中 太郎" },
  { id: "p2", name: "鈴木 花子" },
  { id: "p3", name: "佐藤 健" },
  { id: "p4", name: "高橋 美咲" },
];

const RESULTS: MatrixResult[] = [
  { playerAId: "p1", playerBId: "p2", winsA: 3, winsB: 1, finished: true },
  { playerAId: "p1", playerBId: "p3", winsA: 1, winsB: 3, finished: true },
  { playerAId: "p2", playerBId: "p4", winsA: 1, winsB: 1, finished: false },
];

const MANY_PLAYERS: MatrixPlayer[] = [
  { id: "p1", name: "田中 太郎" },
  { id: "p2", name: "鈴木 花子" },
  { id: "p3", name: "佐藤 健" },
  { id: "p4", name: "高橋 美咲" },
  { id: "p5", name: "伊藤 誠" },
  { id: "p6", name: "渡辺 陽子" },
  { id: "p7", name: "山本 次郎" },
  { id: "p8", name: "中村 直樹" },
];

const buildManyResults = (): MatrixResult[] => {
  const results: MatrixResult[] = [];
  for (let rowIndex = 0; rowIndex < MANY_PLAYERS.length; rowIndex++) {
    for (let columnIndex = rowIndex + 1; columnIndex < MANY_PLAYERS.length; columnIndex++) {
      const playerA = MANY_PLAYERS[rowIndex];
      const playerB = MANY_PLAYERS[columnIndex];
      const finished = (rowIndex + columnIndex) % 3 !== 0;
      results.push({
        playerAId: playerA.id,
        playerBId: playerB.id,
        winsA: finished ? ((rowIndex + columnIndex) % 2 === 0 ? 3 : 1) : 1,
        winsB: finished ? ((rowIndex + columnIndex) % 2 === 0 ? 1 : 3) : 0,
        finished,
      });
    }
  }
  return results;
};

const MANY_RESULTS = buildManyResults();

const meta = {
  title: "Tournament/MatchMatrix",
  component: MatchMatrix,
  parameters: { layout: "padded" },
  args: {
    players: PLAYERS,
    results: RESULTS,
    onSelectCell: () => {},
  },
} satisfies Meta<typeof MatchMatrix>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllUnplayed: Story = {
  args: {
    results: [],
  },
};

export const ManyPlayers: Story = {
  args: {
    players: MANY_PLAYERS,
    results: MANY_RESULTS,
  },
};

export const TooFewPlayers: Story = {
  args: {
    players: [{ id: "p1", name: "田中 太郎" }],
    results: [],
  },
};
