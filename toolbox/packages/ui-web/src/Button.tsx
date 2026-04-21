import * as React from 'react';
import { cn } from './cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-accent-primary text-text-inverse hover:bg-accent-primaryHover active:bg-accent-primaryPressed shadow-glow',
  secondary:
    'bg-surface-2 text-text-primary hover:bg-surface-3 border border-border-default',
  ghost: 'text-text-primary hover:bg-surface-1',
  danger:
    'bg-semantic-danger text-text-primary hover:brightness-110 active:brightness-95',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-12 px-4 text-base',
  lg: 'min-h-tap px-6 text-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'lg', loading, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-bold transition-all duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <span className="animate-pulse">…</span> : children}
    </button>
  ),
);
Button.displayName = 'Button';
