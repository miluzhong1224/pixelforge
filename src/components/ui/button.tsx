import * as React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          {
            // Default (accent)
            'bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-600/20':
              variant === 'default',
            // Destructive
            'bg-red-600 text-white hover:bg-red-500': variant === 'destructive',
            // Outline
            'border border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800/50 hover:border-zinc-600':
              variant === 'outline',
            // Ghost
            'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50':
              variant === 'ghost',
            // Link
            'bg-transparent text-violet-400 hover:text-violet-300 underline-offset-4 hover:underline':
              variant === 'link',
          },
          {
            'h-9 px-3 text-sm': size === 'sm',
            'h-11 px-5 text-sm': size === 'md',
            'h-12 px-8 text-base': size === 'lg',
          },
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
export type { ButtonProps };
