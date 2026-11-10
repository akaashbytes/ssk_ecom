import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  isValid?: boolean;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      isValid = false,
      leftAddon,
      rightAddon,
      containerClassName = '',
      className = '',
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    const borderStyle = error
      ? 'border-functional-error bg-functional-error-light/20 text-rose-900 focus:border-functional-error focus:ring-functional-error-light'
      : isValid
      ? 'border-functional-success bg-functional-success-light/20 text-slate-900 focus:border-functional-success focus:ring-functional-success-light'
      : 'border-surface-border bg-white text-brand-slate focus:border-brand-amber focus:ring-amber-100';

    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-slate-700 tracking-wide">
            {label} {required && <span className="text-functional-error">*</span>}
          </label>
        )}

        <div className="relative flex rounded-lg shadow-subtle overflow-hidden">
          {leftAddon && (
            <span className="inline-flex items-center px-3.5 bg-slate-50 border border-r-0 border-surface-border text-slate-600 text-xs font-semibold select-none">
              {leftAddon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            className={`w-full h-10 px-3.5 text-sm rounded-lg border outline-none transition-all duration-150 disabled:bg-slate-100 disabled:cursor-not-allowed ${
              leftAddon ? 'rounded-l-none' : ''
            } ${rightAddon ? 'pr-10' : ''} ${borderStyle} ${className}`}
            {...props}
          />

          {rightAddon && (
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              {rightAddon}
            </span>
          )}
        </div>

        {error ? (
          <p className="text-[11px] font-medium text-functional-error flex items-start gap-1 leading-tight break-words text-left">
            <span className="shrink-0 mt-0.5">✕</span> <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-slate-400 leading-tight break-words text-left">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
