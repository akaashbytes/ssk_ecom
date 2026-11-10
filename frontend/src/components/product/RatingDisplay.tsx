import React from 'react';
import { StarIcon } from '../common/Icons';

export interface RatingDisplayProps {
  rating?: number | null;
  reviewCount?: number;
  showCount?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * RatingDisplay: Strictly renders ONLY when verified real ratings exist.
 * Renders null when no rating is provided, adhering to P18 compliance guidelines.
 */
export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  reviewCount,
  showCount = true,
  size = 'sm',
  className = '',
}) => {
  // If no rating or invalid rating, do not render fake stars
  if (rating === undefined || rating === null || rating <= 0) {
    return null;
  }

  const iconSizes = {
    sm: 14,
    md: 18,
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm font-semibold',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center text-brand-amber">
        {[1, 2, 3, 4, 5].map((starIndex) => (
          <StarIcon
            key={starIndex}
            size={iconSizes[size]}
            filled={starIndex <= Math.round(rating)}
          />
        ))}
      </div>
      <span className={`font-bold text-slate-700 tnum ${textSizes[size]}`}>
        {rating.toFixed(1)}
      </span>
      {showCount && reviewCount !== undefined && reviewCount > 0 && (
        <span className="text-[11px] text-slate-400 tnum">
          ({reviewCount.toLocaleString('en-IN')})
        </span>
      )}
    </div>
  );
};
