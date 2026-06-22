type Variant = "card" | "plain" | "listItem";

type Props = {
  /** 表示する文言。省略時は「データがありません」 */
  message?: string;
  /** 表示バリアント。省略時は card */
  variant?: Variant;
};

// 各バリアントは既存コンポーネントの class を完全維持
const VARIANT_CLASS: Record<Variant, string> = {
  // result 各テーブル由来: 枠線付きカード
  card: "border-line text-sub rounded-2xl border-2 p-4 text-center text-base",
  // home 大会一覧由来: 枠線なしの中央寄せテキスト
  plain: "text-sub py-8 text-center text-base",
  // doubles 試合一覧由来: ul 内の li 要素
  listItem: "text-sub p-4 text-base",
};

/** 空状態の共通表示コンポーネント。class は各コンポーネントの既存スタイルを完全維持。 */
export const EmptyState = ({ message = "データがありません", variant = "card" }: Props) => {
  if (variant === "plain") {
    return <p className={VARIANT_CLASS.plain}>{message}</p>;
  }
  if (variant === "listItem") {
    return <li className={VARIANT_CLASS.listItem}>{message}</li>;
  }
  return <div className={VARIANT_CLASS.card}>{message}</div>;
};
