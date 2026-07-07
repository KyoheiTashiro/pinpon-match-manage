import { TrophyIcon } from "@/components/icons/TrophyIcon";

const SIZE_CLASS = {
  xs: "inline-flex shrink-0 rounded-full bg-yellow-400 p-0.5 text-xs text-white",
  sm: "inline-flex rounded-full bg-yellow-400 p-1 text-sm text-white",
  "sm-xs": "inline-flex rounded-full bg-yellow-400 p-1 text-xs text-white",
  lg: "rounded-full bg-yellow-400 p-1.5 text-lg text-white",
} as const;

type Size = keyof typeof SIZE_CLASS;

type Props = {
  size: Size;
};

export const WinnerBadge = ({ size }: Props) => {
  // PersonalMatchResults の元コードが div だったため lg のみ div を使用
  if (size === "lg") {
    return (
      <div className={SIZE_CLASS[size]}>
        <TrophyIcon />
      </div>
    );
  }
  return (
    <span className={SIZE_CLASS[size]}>
      <TrophyIcon />
    </span>
  );
};
