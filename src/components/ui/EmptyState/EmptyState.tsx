type Variant = "card" | "plain" | "listItem";

type Props = {
  message?: string;
  variant?: Variant;
};

const VARIANT_CLASS: Record<Variant, string> = {
  card: "border-line text-sub rounded-2xl border-2 p-4 text-center text-base",
  plain: "text-sub py-8 text-center text-base",
  listItem: "text-sub p-4 text-base",
};

export const EmptyState = ({ message = "データがありません", variant = "card" }: Props) => {
  if (variant === "plain") {
    return <p className={VARIANT_CLASS.plain}>{message}</p>;
  }
  if (variant === "listItem") {
    return <li className={VARIANT_CLASS.listItem}>{message}</li>;
  }
  return <div className={VARIANT_CLASS.card}>{message}</div>;
};
