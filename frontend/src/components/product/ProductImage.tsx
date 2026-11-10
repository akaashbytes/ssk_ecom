import React, { useState } from 'react';
import { HeartIcon } from '../common/Icons';

export interface ProductImageProps {
  src?: string;
  alt: string;
  badge?: React.ReactNode;
  isOutOfStock?: boolean;
  outOfStockLabel?: string;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
  className?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  badge,
  isOutOfStock = false,
  outOfStockLabel = 'Out of Stock',
  isWishlisted = false,
  onToggleWishlist,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={`relative bg-gradient-to-b from-amber-50/40 via-surface-subtle to-slate-50 p-4 sm:p-6 flex items-center justify-center overflow-hidden h-64 sm:h-80 border-b border-surface-border select-none ${className}`}
    >
      {/* Badge Overlay */}
      {badge && <div className="absolute top-3 left-3 z-10">{badge}</div>}

      {/* Wishlist Button */}
      {onToggleWishlist && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist();
          }}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-xs border border-surface-border flex items-center justify-center transition shadow-subtle cursor-pointer ${
            isWishlisted
              ? 'text-rose-500 border-rose-200'
              : 'text-slate-400 hover:text-rose-500 hover:border-slate-300'
          }`}
        >
          <HeartIcon
            size={16}
            fill={isWishlisted ? 'currentColor' : 'none'}
            className="transition-colors"
          />
        </button>
      )}

      {/* Product Image / Fallback */}
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className={`h-56 sm:h-72 w-auto max-w-full object-contain transition-transform duration-300 drop-shadow-md group-hover:scale-105 ${
            isOutOfStock ? 'opacity-60 grayscale-[30%]' : ''
          }`}
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-slate-400 gap-2 h-44">
          <span className="text-3xl sm:text-4xl">🫙</span>
          <span className="text-xs font-medium text-slate-400">Authentic Cold-Pressed Oil</span>
        </div>
      )}

      {/* Out of Stock Scrim Overlay */}
      {isOutOfStock && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-4">
          <span className="bg-white text-functional-error font-extrabold text-[11px] sm:text-xs px-3 sm:px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-card">
            {outOfStockLabel}
          </span>
        </div>
      )}
    </div>
  );
};
