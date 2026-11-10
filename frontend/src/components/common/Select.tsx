import React, { forwardRef } from 'react';
import { ChevronDownIcon } from './Icons';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      options,
      children,
      containerClassName = '',
      className = '',
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    const borderStyle = error
      ? 'border-functional-error bg-functional-error-light/20 text-rose-900 focus:border-functional-error focus:ring-functional-error-light'
      : 'border-surface-border bg-white text-brand-slate focus:border-brand-amber focus:ring-amber-100';

    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={selectId} className="block text-xs font-bold text-slate-700 tracking-wide">
            {label} {required && <span className="text-functional-error">*</span>}
          </label>
        )}

        <div className="relative rounded-lg shadow-subtle">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            className={`w-full h-10 pl-3.5 pr-10 text-sm rounded-lg border outline-none appearance-none transition-all duration-150 cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed ${borderStyle} ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
            <ChevronDownIcon size={16} />
          </span>
        </div>

        {error ? (
          <p className="text-[11px] font-medium text-functional-error flex items-center gap-1">
            <span>✕</span> {error}
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
