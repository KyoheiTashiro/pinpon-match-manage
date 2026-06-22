import { TrophyIcon } from "@/components/icons/TrophyIcon";

// サイズバリアント: 各コンポーネントの既存クラスを完全維持
const SIZE_CLASS = {
  // MatchResultsTable 用: p-0.5 text-xs + shrink-0
  xs: "inline-flex shrink-0 rounded-full bg-yellow-400 p-0.5 text-xs text-white",
  // MatchScoreChart 対戦ヘッダ用: p-1 text-sm
  sm: "inline-flex rounded-full bg-yellow-400 p-1 text-sm text-white",
  // MatchScoreChart ゲーム内用: p-1 text-xs
  "sm-xs": "inline-flex rounded-full bg-yellow-400 p-1 text-xs text-white",
  // PersonalMatchResults 用: p-1.5 text-lg（div ラッパ・ブロック表示を維持）
  lg: "rounded-full bg-yellow-400 p-1.5 text-lg text-white",
} as const;

type Size = keyof typeof SIZE_CLASS;

type Props = {
  size: Size;
};

/**
 * トロフィーアイコンを黄色丸バッジで包む共通コンポーネント。
 * lg サイズのみ元コードが div だったためブロック表示を維持する。
 */
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
