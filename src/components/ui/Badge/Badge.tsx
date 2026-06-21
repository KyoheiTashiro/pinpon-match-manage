import type { HTMLAttributes, ReactNode } from "react";

type Tone = "primary" | "success" | "warning" | "danger" | "neutral";
type Appearance = "solid" | "soft" | "outline";

type Props = HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
  appearance?: Appearance;
  children: ReactNode;
};

const styles: Record<Appearance, Record<Tone, string>> = {
  solid: {
    primary: "bg-primary text-white",
    success: "bg-success text-white",
    warning: "bg-warning text-ink",
    danger: "bg-danger text-white",
    neutral: "bg-sub text-white",
  },
  soft: {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
    neutral: "bg-sub/10 text-sub",
  },
  outline: {
    primary: "border border-primary text-primary",
    success: "border border-success text-success",
    warning: "border border-warning text-warning",
    danger: "border border-danger text-danger",
    neutral: "border border-line text-sub",
  },
};

export const Badge = ({
  tone = "primary",
  appearance = "soft",
  className = "",
  children,
  ...rest
}: Props) => (
  <span
    {...rest}
    className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-bold whitespace-nowrap ${styles[appearance][tone]} ${className}`}
  >
    {children}
  </span>
);
