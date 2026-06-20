import type { PersonalMatchRow } from "@/features/tournament/result/hooks";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { PersonalMatchResults } from "./PersonalMatchResults";

const matches: PersonalMatchRow[] = [
  {
    id: "m1",
    selfName: "田中 太郎",
    opponentName: "鈴木 花子",
    selfWins: 3,
    oppWins: 1,
    games: [
      { selfScore: 11, oppScore: 9 },
      { selfScore: 9, oppScore: 11 },
      { selfScore: 11, oppScore: 5 },
      { selfScore: 11, oppScore: 7 },
    ],
    result: "win",
  },
  {
    id: "m2",
    selfName: "田中 太郎",
    opponentName: "佐藤 健",
    selfWins: 1,
    oppWins: 3,
    games: [
      { selfScore: 11, oppScore: 8 },
      { selfScore: 7, oppScore: 11 },
      { selfScore: 9, oppScore: 11 },
      { selfScore: 5, oppScore: 11 },
    ],
    result: "lose",
  },
];

// ストレート勝ち (3-0)
const straightWin: PersonalMatchRow = {
  id: "m3",
  selfName: "田中 太郎",
  opponentName: "山田 次郎",
  selfWins: 3,
  oppWins: 0,
  games: [
    { selfScore: 11, oppScore: 4 },
    { selfScore: 11, oppScore: 2 },
    // { selfScore: 11, oppScore: 6 },
  ],
  result: "win",
};

// デュース接戦
const deuceMatch: PersonalMatchRow = {
  id: "m4",
  selfName: "田中 太郎",
  opponentName: "高橋 美咲",
  selfWins: 3,
  oppWins: 2,
  games: [
    { selfScore: 13, oppScore: 11 },
    { selfScore: 9, oppScore: 11 },
    { selfScore: 14, oppScore: 12 },
    { selfScore: 10, oppScore: 12 },
    { selfScore: 12, oppScore: 10 },
  ],
  result: "win",
};

// 未確定 (result: null)
const pending: PersonalMatchRow = {
  id: "m5",
  selfName: "田中 太郎",
  opponentName: "伊藤 大輔",
  selfWins: 1,
  oppWins: 1,
  games: [
    { selfScore: 11, oppScore: 8 },
    { selfScore: 6, oppScore: 11 },
  ],
  result: null,
};

const meta = {
  title: "Tournament/PersonalMatchResults",
  component: PersonalMatchResults,
  parameters: { layout: "padded" },
  args: { matches },
} satisfies Meta<typeof PersonalMatchResults>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleMatch: Story = {
  args: { matches: matches.slice(0, 1) },
};

export const Empty: Story = {
  args: { matches: [] },
};

export const StraightWin: Story = {
  args: { matches: [straightWin] },
};

export const DeuceMatch: Story = {
  args: { matches: [deuceMatch] },
};

export const Pending: Story = {
  args: { matches: [pending] },
};
