import type { HTMLAttributes, ReactNode } from "react";

export type BadgeTone = "primary" | "success" | "warning" | "danger" | "neutral";
type Appearance = "solid" | "soft" | "outline";
type Size = "sm" | "md";

type Props = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  appearance?: Appearance;
  size?: Size;
  children: ReactNode;
};

const sizes: Record<Size, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
};

const styles: Record<Appearance, Record<BadgeTone, string>> = {
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
  size = "md",
  className = "",
  children,
  ...rest
}: Props) => (
  <span
    {...rest}
    className={`inline-flex items-center justify-center rounded-full font-bold whitespace-nowrap ${sizes[size]} ${styles[appearance][tone]} ${className}`}
  >
    {children}
  </span>
);
