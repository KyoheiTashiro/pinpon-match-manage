import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { ConfirmModal } from "./ConfirmModal";

const meta = {
  title: "UI/ConfirmModal",
  component: ConfirmModal,
  // 固定オーバーレイ（fixed inset-0）のため全画面表示で確認する。
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    title: "削除しますか？",
    message: "この操作は取り消せません。",
    onConfirm: fn(),
    onCancel: fn(),
  },
  argTypes: {
    destructive: { control: "boolean" },
  },
} satisfies Meta<typeof ConfirmModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Destructive: Story = {
  args: {
    destructive: true,
    title: "プレイヤーを削除",
    message: "関連する対戦記録も削除されます。",
    confirmLabel: "削除する",
  },
};

export const CustomLabels: Story = {
  args: {
    title: "保存しますか？",
    message: "入力内容を保存します。",
    confirmLabel: "保存",
    cancelLabel: "やめる",
  },
};
