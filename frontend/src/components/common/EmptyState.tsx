import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  tamilDescription?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  tamilDescription,
  icon,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`bg-white border border-surface-border rounded-2xl p-6 sm:p-8 md:p-10 shadow-subtle text-center flex flex-col items-center justify-center w-full max-w-lg mx-auto ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-amber-50 text-brand-amber flex items-center justify-center text-3xl mb-4 border border-amber-200/60 shadow-xs">
        {icon || '🧺'}
      </div>

      <h3 className="text-lg font-bold text-brand-slate tracking-tight">{title}</h3>

      <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">{description}</p>

      {tamilDescription && (
        <p className="text-xs text-slate-500 mt-1 max-w-sm font-tamil leading-relaxed">
          {tamilDescription}
        </p>
      )}

      {(actionText || secondaryActionText) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {secondaryActionText && (
            <Button variant="secondary" size="sm" onClick={onSecondaryAction}>
              {secondaryActionText}
            </Button>
          )}
          {actionText && (
            <Button variant="amber" size="sm" onClick={onAction}>
              {actionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
