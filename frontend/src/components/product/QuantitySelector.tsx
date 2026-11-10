import React from 'react';
import { MinusIcon, PlusIcon } from '../common/Icons';

export interface QuantitySelectorProps {
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  disabled = false,
  className = '',
}) => {
  const handleDecrement = () => {
    if (value > min && !disabled) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max && !disabled) {
      onChange(value + 1);
    }
  };

  const sizeStyles = {
    sm: 'h-8 px-1 text-xs',
    md: 'h-10 px-2 text-sm',
  };

  const btnSizes = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7 sm:w-8 sm:h-8',
  };

  return (
    <div
      role="group"
      aria-label="Quantity selector"
      className={`inline-flex items-center justify-between border border-surface-border rounded-lg bg-surface-subtle shadow-subtle ${sizeStyles[size]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        className={`${btnSizes[size]} flex items-center justify-center text-slate-500 hover:text-brand-slate hover:bg-white rounded transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer`}
      >
        <MinusIcon size={14} />
      </button>

      <span
        className="w-8 sm:w-10 text-center font-bold text-brand-slate select-none tnum"
        aria-live="polite"
      >
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className={`${btnSizes[size]} flex items-center justify-center text-slate-500 hover:text-brand-slate hover:bg-white rounded transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer`}
      >
        <PlusIcon size={14} />
      </button>
    </div>
  );
};
