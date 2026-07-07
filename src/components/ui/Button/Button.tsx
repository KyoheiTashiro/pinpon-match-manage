import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

type Variant =
  | "primary"
  | "secondary"
  | "danger"
  | "dangerOutline"
  | "success"
  | "ghost"
  | "white"
  | "outlineWhite";
type Size = "md" | "sm";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  ref?: Ref<HTMLButtonElement>;
};

const styles: Record<Variant, string> = {
  primary: "bg-primary text-white hover:brightness-110 active:brightness-95",
  secondary: "bg-bg text-ink border-2 border-slate-600 hover:bg-slate-200",
  danger: "bg-danger text-white hover:brightness-110 active:brightness-95",
  dangerOutline: "bg-white text-danger border-2 border-danger hover:bg-danger/10",
  success: "bg-success text-white hover:brightness-110 active:brightness-95",
  ghost: "bg-transparent text-ink underline underline-offset-4 [text-decoration-skip-ink:none]",
  white: "bg-white text-primary border-2 border-white hover:bg-slate-100 active:bg-slate-200",
  outlineWhite: "bg-transparent text-white border-2 border-white/60 hover:bg-white/10",
};

const sizes: Record<Size, string> = {
  md: "min-h-btn min-w-btn px-6 text-lg",
  sm: "min-h-[44px] px-4 text-base",
};

export const Button = ({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ref,
  ...rest
}: Props) => (
  <button
    ref={ref}
    {...rest}
    className={`${sizes[size]} cursor-pointer rounded-xl font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
  >
    {children}
  </button>
);
