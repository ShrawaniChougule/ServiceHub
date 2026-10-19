import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { classNames } from '@/lib/utils';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

const variants = {
  primary: 'bg-brand-900 text-white hover:bg-brand-800 shadow-soft hover:shadow-glow',
  accent: 'bg-accent-500 text-white hover:bg-accent-600 shadow-soft',
  outline: 'border border-brand-200 bg-white text-brand-900 hover:border-brand-400 hover:bg-brand-50',
  ghost: 'text-brand-900 hover:bg-brand-50',
};

const sizes = {
  sm: 'px-3.5 py-2 text-sm rounded-lg gap-1.5',
  md: 'px-5 py-3 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3.5 text-base rounded-xl gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...rest
}: Props) {
  return (
    <button
      className={classNames(
        'inline-flex items-center justify-center font-semibold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
