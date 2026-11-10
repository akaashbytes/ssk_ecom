import React from 'react';
import { useLanguageStore } from '../../stores/useLanguageStore';

export type StockLevel = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface StockStatusProps {
  status: StockLevel;
  stockCount?: number;
  customMessage?: string;
  tamilMessage?: string;
  className?: string;
}

export const StockStatus: React.FC<StockStatusProps> = ({
  status,
  stockCount,
  customMessage,
  tamilMessage,
  className = '',
}) => {
  const { language } = useLanguageStore();

  if (status === 'in_stock') {
    const text =
      language === 'ta'
        ? tamilMessage || 'கையிருப்பில் உள்ளது (புதிய உற்பத்தி)'
        : customMessage || 'In Stock (Fresh Mill)';

    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-bold text-functional-success ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-functional-success animate-pulse" />
        <span>{text}</span>
      </span>
    );
  }

  if (status === 'low_stock') {
    const text =
      language === 'ta'
        ? tamilMessage || (stockCount ? `${stockCount} மட்டுமே மீதமுள்ளது` : 'குறைந்த இருப்பு')
        : customMessage || (stockCount ? `Only ${stockCount} left in stock` : 'Low Stock');

    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-bold text-functional-warning ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-functional-warning" />
        <span>{text}</span>
      </span>
    );
  }

  // Out of stock
  const text =
    language === 'ta'
      ? tamilMessage || 'தற்போது இருப்பு இல்லை'
      : customMessage || 'Out of Stock';

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold text-functional-error ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-functional-error" />
      <span>{text}</span>
    </span>
  );
};
