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

const meta = {
  title: "Tournament/PersonalMatchResults",
  component: PersonalMatchResults,
  parameters: { layout: "padded" },
  args: { matches, bestOf: 5 },
} satisfies Meta<typeof PersonalMatchResults>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleMatch: Story = {
  args: { matches: matches.slice(0, 1), bestOf: 5 },
};

export const Empty: Story = {
  args: { matches: [] },
};
