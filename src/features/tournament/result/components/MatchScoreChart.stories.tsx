import type { Game, Side } from "@/domain/match";
import { SIDE, scoresFromLog } from "@/domain/match";
import type { MatchResultRow } from "@/features/tournament/result/hooks";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MatchScoreChart } from "./MatchScoreChart";

const { LEFT: L, RIGHT: R } = SIDE;

// 目標スコアに整合する pointLog を決定的に生成（ほぼ交互、不足側を先に消化）。
const buildLog = (left: number, right: number): Side[] => {
  const log: Side[] = [];
  let l = 0;
  let r = 0;
  while (l < left || r < right) {
    if (l < left && (l <= r || r >= right)) {
      log.push(L);
      l++;
    } else {
      log.push(R);
      r++;
    }
  }
  return log;
};

// pointLog とスコアを整合させた Game を作る。
const game = (left: number, right: number): Game => {
  const pointLog = buildLog(left, right);
  return { ...scoresFromLog(pointLog), pointLog };
};

const match: MatchResultRow = {
  id: "m1",
  leftName: "田中 太郎",
  rightName: "鈴木 花子",
  leftMembers: ["a"],
  rightMembers: ["b"],
  games: [game(11, 8), game(9, 11), game(11, 9)],
  leftWins: 2,
  rightWins: 1,
  winner: SIDE.LEFT,
  firstServer: SIDE.LEFT,
};

const meta = {
  title: "Tournament/MatchScoreChart",
  component: MatchScoreChart,
  parameters: { layout: "padded" },
  args: { match, selfSide: L },
} satisfies Meta<typeof MatchScoreChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleGame: Story = {
  args: {
    match: { ...match, games: [game(11, 6)], leftWins: 1, rightWins: 0 },
  },
};

// デュース（12-10）を含むゲーム。最終列の長い接戦を確認する。
export const Deuce: Story = {
  args: {
    match: {
      ...match,
      rightName: "佐藤 健",
      games: [game(12, 10), game(10, 12)],
      leftWins: 1,
      rightWins: 1,
      winner: null,
    },
  },
};

// pointLog の無いゲームのみ → 「得点記録なし」を表示する。
export const NoPointLog: Story = {
  args: {
    match: {
      ...match,
      games: [{ leftScore: 11, rightScore: 8 }],
    },
  },
};
