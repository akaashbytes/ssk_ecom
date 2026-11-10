import React, { useState } from 'react';
import { ProductImage } from './ProductImage';
import { PriceDisplay } from './PriceDisplay';
import { QuantitySelector } from './QuantitySelector';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ShoppingBagIcon } from '../common/Icons';

export interface PackSizeOption {
  id: string;
  label: string;
  tamilLabel?: string;
  price: number;
  originalPrice?: number;
  isAvailable?: boolean;
}

export interface ProductCardProps {
  id: string;
  title: string;
  tamilTitle?: string;
  subtitle?: string;
  batchId?: string;
  description?: string;
  imageUrl?: string;
  badgeText?: string;
  badgeVariant?: 'green' | 'amber' | 'slate';
  packSizes: PackSizeOption[];
  initialPackSizeId?: string;
  isOutOfStock?: boolean;
  onAddToCart?: (productId: string, packSizeId: string, quantity: number) => void;
  onWishlistToggle?: (productId: string) => void;
  isWishlisted?: boolean;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  tamilTitle,
  subtitle,
  batchId,
  description,
  imageUrl,
  badgeText,
  badgeVariant = 'green',
  packSizes,
  initialPackSizeId,
  isOutOfStock = false,
  onAddToCart,
  onWishlistToggle,
  isWishlisted = false,
  className = '',
}) => {
  const [selectedPackId, setSelectedPackId] = useState<string>(
    initialPackSizeId || (packSizes[0] ? packSizes[0].id : '')
  );
  const [quantity, setQuantity] = useState<number>(0);

  const currentPack = packSizes.find((p) => p.id === selectedPackId) || packSizes[0];

  const handlePackSelect = (packId: string) => {
    setSelectedPackId(packId);
    setQuantity(0); // reset cart quantity on size switch
  };

  const handleAddClick = () => {
    const nextQty = 1;
    setQuantity(nextQty);
    if (onAddToCart && currentPack) {
      onAddToCart(id, currentPack.id, nextQty);
    }
  };

  const handleQuantityChange = (newQty: number) => {
    setQuantity(newQty);
    if (onAddToCart && currentPack) {
      onAddToCart(id, currentPack.id, newQty);
    }
  };

  const badgeElement = badgeText ? (
    <Badge
      variant={badgeVariant === 'green' ? 'green-solid' : badgeVariant}
      size="sm"
      pill
    >
      {badgeText}
    </Badge>
  ) : undefined;

  return (
    <article
      className={`bg-white border border-surface-border rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-200 flex flex-col justify-between group w-full ${className}`}
    >
      <div>
        {/* Media Frame */}
        <ProductImage
          src={imageUrl}
          alt={title}
          badge={badgeElement}
          isOutOfStock={isOutOfStock}
          outOfStockLabel="Out of Stock • விரைவில் வரும்"
          isWishlisted={isWishlisted}
          onToggleWishlist={onWishlistToggle ? () => onWishlistToggle(id) : undefined}
        />

        {/* Card Body */}
        <div className="p-4 sm:p-6">
          {/* Header Metadata */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 gap-2">
            {subtitle && (
              <span className="font-semibold text-brand-green font-tamil truncate text-[11px] sm:text-xs">
                {subtitle}
              </span>
            )}
            {batchId && (
              <span className="font-mono text-[10px] sm:text-[11px] text-slate-400 shrink-0">
                {batchId}
              </span>
            )}
          </div>

          {/* Titles */}
          <h3 className="text-base sm:text-lg font-bold text-brand-slate leading-snug tracking-tight">
            {title}
            {tamilTitle && (
              <span className="block text-xs sm:text-sm font-semibold text-slate-600 font-tamil mt-0.5">
                ({tamilTitle})
              </span>
            )}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}

          {/* Pack Size Selectors */}
          {packSizes.length > 0 && (
            <div className="mt-4">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Select Pack Size / அளவு:
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {packSizes.map((pack) => {
                  const isSelected = pack.id === selectedPackId;
                  return (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => handlePackSelect(pack.id)}
                      disabled={isOutOfStock || pack.isAvailable === false}
                      className={`py-1.5 px-1.5 sm:px-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer truncate ${
                        isSelected
                          ? 'border-2 border-brand-amber bg-amber-50 text-brand-amber shadow-xs'
                          : 'border border-surface-border bg-surface-subtle text-slate-600 hover:border-slate-300'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {pack.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price Section */}
          {currentPack && (
            <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between">
              <PriceDisplay
                price={currentPack.price}
                originalPrice={currentPack.originalPrice}
                size="card"
              />
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
        {isOutOfStock ? (
          <Button variant="secondary" fullWidth disabled>
            Currently Unavailable
          </Button>
        ) : quantity > 0 ? (
          <div className="flex items-center gap-2 sm:gap-3 w-full">
            <QuantitySelector
              value={quantity}
              onChange={handleQuantityChange}
              size="md"
              className="flex-1"
            />
            <span className="text-xs font-bold text-brand-green bg-emerald-50 border border-emerald-200 px-2.5 sm:px-3 py-2 rounded-lg shrink-0">
              In Basket
            </span>
          </div>
        ) : (
          <Button
            variant="amber"
            fullWidth
            onClick={handleAddClick}
            leftIcon={<ShoppingBagIcon size={16} />}
          >
            Add to Cart • வாங்கு
          </Button>
        )}
      </div>
    </article>
  );
};
