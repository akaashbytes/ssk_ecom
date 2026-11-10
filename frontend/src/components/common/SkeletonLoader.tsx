import React from 'react';

export type SkeletonVariant = 'text' | 'rectangular' | 'circular' | 'product-card';

export interface SkeletonLoaderProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'rectangular',
  width,
  height,
  className = '',
  count = 1,
}) => {
  const baseAnimation = 'animate-pulse bg-slate-200';

  if (variant === 'product-card') {
    return (
      <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-subtle space-y-4 w-full">
        <div className={`h-64 ${baseAnimation} rounded-xl w-full`} />
        <div className="space-y-2">
          <div className={`h-4 ${baseAnimation} rounded w-1/3`} />
          <div className={`h-6 ${baseAnimation} rounded w-3/4`} />
          <div className={`h-3 ${baseAnimation} rounded w-full`} />
        </div>
        <div className="flex gap-2 pt-2">
          <div className={`h-8 ${baseAnimation} rounded-lg flex-1`} />
          <div className={`h-8 ${baseAnimation} rounded-lg flex-1`} />
          <div className={`h-8 ${baseAnimation} rounded-lg flex-1`} />
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className={`h-8 ${baseAnimation} rounded w-24`} />
          <div className={`h-10 ${baseAnimation} rounded-lg w-28`} />
        </div>
      </div>
    );
  }

  const variantStyles: Record<'text' | 'rectangular' | 'circular', string> = {
    text: 'h-4 rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
  };

  const style: React.CSSProperties = {
    width: width !== undefined ? width : undefined,
    height: height !== undefined ? height : variant === 'text' ? '1rem' : undefined,
  };

  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`${baseAnimation} ${variantStyles[variant as 'text' | 'rectangular' | 'circular']} ${className}`}
          style={style}
        />
      ))}
    </>
  );
};
