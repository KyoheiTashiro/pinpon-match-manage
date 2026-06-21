import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { InfoModal } from "./InfoModal";

const meta = {
  title: "UI/InfoModal",
  component: InfoModal,
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    title: "ルール説明",
    children: "11点先取・2点差。デュースは無制限に続きます。",
    onClose: fn<() => void>(),
  },
} satisfies Meta<typeof InfoModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RichContent: Story = {
  args: {
    title: "対戦形式について",
    closeLabel: "わかった",
    children: (
      <ul className="list-disc space-y-1 pl-5">
        <li>シングルス：1対1</li>
        <li>ダブルス：2対2</li>
        <li>総当たり戦で順位を決定</li>
      </ul>
    ),
  },
};
