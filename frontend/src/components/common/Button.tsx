import React from 'react';

export type ButtonVariant = 'primary' | 'amber' | 'green' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  type = 'button',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]';

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'h-9 px-3 text-xs gap-1.5 min-h-[36px]',
    md: 'h-10 px-4 text-sm gap-2 min-h-[40px] sm:min-h-[44px]',
    lg: 'h-12 px-6 text-base gap-2.5 min-h-[48px]',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-brand-slate text-white hover:bg-brand-slate-dark shadow-subtle disabled:bg-slate-200 disabled:text-slate-400',
    amber:
      'bg-brand-amber text-white hover:bg-brand-amber-dark shadow-subtle disabled:bg-amber-100 disabled:text-amber-400',
    green:
      'bg-brand-green text-white hover:bg-brand-green-dark shadow-subtle disabled:bg-emerald-100 disabled:text-emerald-400',
    secondary:
      'border border-surface-border bg-white text-brand-slate hover:bg-surface-subtle hover:border-surface-border-dark disabled:bg-slate-50 disabled:text-slate-400',
    ghost:
      'bg-transparent text-brand-slate hover:bg-slate-100 disabled:bg-transparent disabled:text-slate-400',
    danger:
      'bg-functional-error text-white hover:bg-red-700 shadow-subtle disabled:bg-rose-100 disabled:text-rose-400',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
