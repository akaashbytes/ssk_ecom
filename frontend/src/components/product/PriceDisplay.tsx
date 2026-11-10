import React from 'react';

export type PriceSize = 'sm' | 'card' | 'lg' | 'hero';

export interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  size?: PriceSize;
  showDiscountBadge?: boolean;
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  originalPrice,
  size = 'card',
  showDiscountBadge = true,
  className = '',
}) => {
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const sizeStyles: Record<
    PriceSize,
    { price: string; original: string; badge: string }
  > = {
    sm: {
      price: 'text-base font-bold',
      original: 'text-xs',
      badge: 'text-[10px] px-1.5 py-0.5',
    },
    card: {
      price: 'text-2xl font-black',
      original: 'text-sm',
      badge: 'text-xs px-2 py-0.5',
    },
    lg: {
      price: 'text-3xl font-extrabold',
      original: 'text-base',
      badge: 'text-xs px-2.5 py-1',
    },
    hero: {
      price: 'text-4xl font-black',
      original: 'text-lg',
      badge: 'text-sm px-3 py-1',
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <div className={`inline-flex flex-wrap items-baseline gap-1.5 sm:gap-2 tnum ${className}`}>
      <span
        className={`tracking-tight text-brand-slate leading-none ${currentSize.price}`}
      >
        ₹{price.toLocaleString('en-IN')}
      </span>

      {hasDiscount && (
        <span
          className={`line-through text-slate-400 font-normal leading-none ${currentSize.original}`}
        >
          ₹{originalPrice.toLocaleString('en-IN')}
        </span>
      )}

      {hasDiscount && showDiscountBadge && discountPercent > 0 && (
        <span
          className={`font-bold text-brand-green bg-emerald-50 border border-emerald-200/80 rounded-md leading-none ${currentSize.badge}`}
        >
          {discountPercent}% OFF
        </span>
      )}
    </div>
  );
};
