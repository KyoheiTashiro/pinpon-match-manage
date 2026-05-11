import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

const styles: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:brightness-110 active:brightness-95',
  secondary: 'bg-bg text-ink border-2 border-line hover:bg-slate-200',
  danger: 'bg-danger text-white hover:brightness-110 active:brightness-95',
  success: 'bg-success text-white hover:brightness-110 active:brightness-95',
  ghost: 'bg-transparent text-ink underline underline-offset-4',
};

export const BigButton = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'primary', className = '', children, ...rest }, ref) => (
    <button
      ref={ref}
      {...rest}
      className={`min-h-btn min-w-btn px-6 rounded-xl text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  ),
);
BigButton.displayName = 'BigButton';
