import React, { forwardRef } from 'react';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  containerClassName?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, containerClassName = '', className = '', id, disabled, ...props }, ref) => {
    const radioId = id || (label ? `radio-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <label
        htmlFor={radioId}
        className={`inline-flex items-start gap-2.5 cursor-pointer select-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${containerClassName}`}
      >
        <div className="relative flex items-center pt-0.5">
          <input
            ref={ref}
            type="radio"
            id={radioId}
            disabled={disabled}
            className={`w-4 h-4 text-brand-amber border-surface-border focus:ring-brand-amber focus:ring-offset-1 accent-[#D48817] cursor-pointer ${className}`}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="text-xs font-semibold text-slate-800 leading-snug">{label}</span>}
            {description && <span className="text-[11px] text-slate-500 leading-normal">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);

Radio.displayName = 'Radio';
