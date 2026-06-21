import {
  CalendarIcon,
  ChevronDownIcon,
  DownloadIcon,
  GearIcon,
  HelpIcon,
  type IconProps,
  PaddleIcon,
  TrophyIcon,
  UsersIcon,
} from "@/components/icons";
import type { Meta, StoryObj } from "@storybook/react-vite";

const icons = {
  UsersIcon,
  PaddleIcon,
  TrophyIcon,
  ChevronDownIcon,
  DownloadIcon,
  HelpIcon,
  CalendarIcon,
  GearIcon,
} as const;

const sizes = [16, 24, 32, 48] as const;

const Gallery = (props: IconProps) => (
  <div className="flex flex-col gap-4">
    {Object.entries(icons).map(([name, Icon]) => (
      <div key={name} className="flex items-center gap-3">
        <Icon {...props} />
        <span className="text-sm text-gray-600">{name}</span>
      </div>
    ))}
  </div>
);

const meta = {
  title: "Icons/Gallery",
  component: Gallery,
  tags: ["autodocs"],
  args: { width: "2em", height: "2em" },
  argTypes: {
    color: { control: "color" },
    strokeWidth: { control: { type: "range", min: 1, max: 4, step: 0.5 } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "全アイコン一覧。`IconProps`(SVGProps)で色・サイズ・strokeWidth等を上書き可能。色は`currentColor`継承。",
      },
    },
  },
} satisfies Meta<typeof Gallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-end gap-6">
      {sizes.map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <TrophyIcon {...args} width={size} height={size} />
          <span className="text-sm text-gray-600">{size}px</span>
        </div>
      ))}
    </div>
  ),
};

export const Colors: Story = {
  render: (args) => (
    <div className="flex items-center gap-6">
      <PaddleIcon {...args} className="text-blue-600" />
      <TrophyIcon {...args} className="text-amber-500" />
      <UsersIcon {...args} className="text-emerald-600" />
      <HelpIcon {...args} className="text-gray-400" />
    </div>
  ),
};
