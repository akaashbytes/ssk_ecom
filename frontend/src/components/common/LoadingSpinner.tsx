import React from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerColor = 'amber' | 'slate' | 'green' | 'white';

export interface LoadingSpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'amber',
  label,
  className = '',
}) => {
  const sizeMap: Record<SpinnerSize, string> = {
    sm: 'w-4 h-4 border-2',
    md: 'w-7 h-7 border-3',
    lg: 'w-10 h-10 border-4',
  };

  const colorMap: Record<SpinnerColor, string> = {
    amber: 'border-brand-amber/20 border-t-brand-amber',
    slate: 'border-brand-slate/20 border-t-brand-slate',
    green: 'border-brand-green/20 border-t-brand-green',
    white: 'border-white/25 border-t-white',
  };

  return (
    <div className={`inline-flex flex-col items-center justify-center gap-2 ${className}`}>
      <div
        className={`rounded-full animate-spin ${sizeMap[size]} ${colorMap[color]}`}
        role="status"
        aria-label={label || 'Loading...'}
      />
      {label && <span className="text-xs font-medium text-slate-500">{label}</span>}
    </div>
  );
};
