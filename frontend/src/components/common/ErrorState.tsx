import React, { useState } from 'react';
import { Button } from './Button';
import { AlertTriangleIcon } from './Icons';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  technicalError?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something Went Wrong',
  message = 'We encountered an error loading this information. Please try again.',
  technicalError,
  onRetry,
  className = '',
}) => {
  const [showTechnical, setShowTechnical] = useState(false);

  return (
    <div
      className={`bg-white border border-rose-200 rounded-2xl p-6 sm:p-8 shadow-subtle text-center flex flex-col items-center justify-center w-full max-w-lg mx-auto ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-rose-50 text-functional-error flex items-center justify-center mb-4 border border-rose-200">
        <AlertTriangleIcon size={28} />
      </div>

      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">{message}</p>

      {onRetry && (
        <Button variant="amber" size="sm" onClick={onRetry} className="mt-5">
          Try Again
        </Button>
      )}

      {technicalError && (
        <div className="mt-4 w-full text-left">
          <button
            type="button"
            onClick={() => setShowTechnical(!showTechnical)}
            className="text-[11px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
          >
            {showTechnical ? 'Hide Technical Details' : 'View Technical Details'}
          </button>
          {showTechnical && (
            <pre className="mt-2 p-3 bg-slate-100 rounded-lg text-[10px] text-slate-700 overflow-x-auto font-mono">
              {technicalError}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};
