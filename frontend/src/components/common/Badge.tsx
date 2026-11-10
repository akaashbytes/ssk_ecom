import React from 'react';

export type BadgeVariant =
  | 'amber'
  | 'green'
  | 'green-solid'
  | 'slate'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  pill?: boolean;
  dot?: boolean;
  dotPulsing?: boolean;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  pill = true,
  dot = false,
  dotPulsing = false,
  icon,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-bold tracking-wide select-none';

  const sizeStyles: Record<BadgeSize, string> = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const radiusStyle = pill ? 'rounded-full' : 'rounded-md';

  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
    amber: {
      container: 'bg-amber-50 text-brand-amber border border-amber-200/60',
      dot: 'bg-brand-amber',
    },
    green: {
      container: 'bg-emerald-50 text-brand-green border border-emerald-200/60',
      dot: 'bg-brand-green',
    },
    'green-solid': {
      container: 'bg-brand-green text-white shadow-subtle',
      dot: 'bg-white',
    },
    slate: {
      container: 'bg-slate-100 text-slate-700 border border-slate-200',
      dot: 'bg-slate-500',
    },
    success: {
      container: 'bg-functional-success-light text-functional-success border border-functional-success-border',
      dot: 'bg-functional-success',
    },
    warning: {
      container: 'bg-functional-warning-light text-functional-warning border border-functional-warning-border',
      dot: 'bg-functional-warning',
    },
    error: {
      container: 'bg-functional-error-light text-functional-error border border-functional-error-border',
      dot: 'bg-functional-error',
    },
    info: {
      container: 'bg-functional-info-light text-functional-info border border-functional-info-border',
      dot: 'bg-functional-info',
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${radiusStyle} ${currentVariant.container} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${currentVariant.dot} ${
            dotPulsing ? 'animate-pulse' : ''
          }`}
        />
      )}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
