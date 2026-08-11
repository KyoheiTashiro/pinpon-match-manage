import type { Tournament } from "@/store/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MatchesCard } from "./MatchesCard";

const TOURNAMENT: Tournament = {
  id: "t1",
  name: "春季シングルス大会",
  format: "singles",
  bestOf: 5,
  date: "2026-04-12",
  createdAt: "2026-04-01T00:00:00.000Z",
  participantIds: ["p1", "p2"],
};

const meta = {
  title: "Tournament/MatchesCard",
  component: MatchesCard,
  parameters: { layout: "padded" },
  args: {
    tournament: TOURNAMENT,
    children: <p className="text-base font-bold">ここに対戦表（リスト / マトリクス）が入る</p>,
  },
} satisfies Meta<typeof MatchesCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 長い大会名でもヘッダが折り返して読めることの確認 */
export const LongName: Story = {
  args: {
    tournament: { ...TOURNAMENT, name: "第12回 市民卓球選手権大会 シニアの部 予選リーグ" },
  },
};
