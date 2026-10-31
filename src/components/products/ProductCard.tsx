import React, { useState, memo, useCallback } from 'react';
import { Product, CurrencyCode } from '../../types';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Flame,
  Check 
} from 'lucide-react';
import { getOptimizedImageUrl, getOptimizedImageSrcSet } from '../../utils/imageOptimizer';

interface ProductCardProps {
  product: Product;
  currency: CurrencyCode;
  isFavorite: boolean;
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct?: (product: Product) => void;
  onSelect?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = memo(({
  product,
  currency,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onSelectProduct,
  onSelect,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleSelect = useCallback(() => {
    if (onSelectProduct) onSelectProduct(product);
    else if (onSelect) onSelect(product);
  }, [onSelectProduct, onSelect, product]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(product);
  }, [onToggleFavorite, product]);

  const handleAddToCartClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }, [onAddToCart, product]);

  const formatPrice = (priceYER: number) => {
    if (currency === 'USD') return `$${(priceYER / 530).toFixed(1)}`;
    if (currency === 'SAR') return `${(priceYER / 140).toFixed(0)} ر.س`;
    return `${priceYER.toLocaleString('ar-YE')} ر.ي`;
  };

  const optimizedSrc = getOptimizedImageUrl(product.images?.[0], 'card');
  const optimizedSrcSet = getOptimizedImageSrcSet(product.images?.[0], 'card');

  return (
    <div 
      onClick={handleSelect}
      className="group relative flex flex-col justify-between bg-neutral-900/90 hover:bg-neutral-900 border border-neutral-800/80 hover:border-amber-500/40 rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 transition-colors duration-200 hover:shadow-xl hover:shadow-amber-500/5 cursor-pointer overflow-hidden"
    >
      {/* Top Image & Floating Badges */}
      <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full rounded-2xl overflow-hidden bg-neutral-950 mb-2.5 sm:mb-3">
        {/* Placeholder skeleton while image loads */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-neutral-900 animate-pulse" />
        )}

        <img
          src={optimizedSrc}
          srcSet={optimizedSrcSet || undefined}
          sizes="(max-width: 640px) 48vw, (max-width: 1024px) 30vw, 240px"
          alt={product.name}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          referrerPolicy="no-referrer"
        />

        {/* Gradient Overlay for Top Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-black/30 pointer-events-none" />

        {/* Badges on Top-Right */}
        <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 flex flex-col gap-1 z-10">
          {product.discountPercentage && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-rose-600/95 text-white text-[9px] sm:text-xs font-black shadow-md">
              <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white" />
              <span>{product.discountPercentage}%-</span>
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-neutral-950 text-[9px] sm:text-[10px] font-black shadow-md">
              الأكثر مبيعاً
            </span>
          )}
          {product.isNewArrival && !product.isBestSeller && (
            <span className="px-1.5 py-0.5 rounded-full bg-purple-600 text-white text-[9px] sm:text-[10px] font-bold shadow-md">
              جديد
            </span>
          )}
        </div>

        {/* Favorite Heart Button Top-Left */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className={`absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 p-1.5 sm:p-2 rounded-full transition-transform duration-150 active:scale-90 z-10 ${
            isFavorite
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
              : 'bg-neutral-950/80 border border-neutral-700/40 text-neutral-300 hover:text-white hover:bg-neutral-900'
          }`}
          aria-label="Add to wishlist"
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? 'fill-white' : ''}`} />
        </button>

        {/* Low Stock Warning */}
        {product.stock <= 8 && (
          <div className="absolute bottom-1.5 inset-x-1.5 bg-neutral-950/90 rounded-lg py-0.5 px-1.5 text-[9px] sm:text-[10px] font-bold text-amber-300 text-center border border-amber-500/30 truncate">
            متبقي {product.stock} قطع فقط!
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug mb-1.5 sm:mb-2">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-1.5 sm:mb-2.5">
            <div className="flex items-center gap-0.5 text-amber-400 text-[11px] sm:text-xs font-bold">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" />
              <span>{product.rating}</span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-neutral-500">({product.reviewCount})</span>
          </div>
        </div>

        {/* Price & Add to Cart Footer */}
        <div className="pt-1.5 sm:pt-2 border-t border-neutral-800/80 flex items-center justify-between gap-1.5 mt-auto">
          <div className="flex flex-col min-w-0">
            <div className="text-xs sm:text-base font-black text-amber-400 whitespace-nowrap">
              {formatPrice(product.priceYER)}
            </div>
            {product.originalPriceYER && (
              <div className="text-[9px] sm:text-xs text-neutral-500 line-through whitespace-nowrap">
                {formatPrice(product.originalPriceYER)}
              </div>
            )}
          </div>

          {/* Add to Cart CTA */}
          <button
            type="button"
            onClick={handleAddToCartClick}
            className={`flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold active:scale-95 transition-all shadow-sm flex-shrink-0 cursor-pointer ${
              justAdded
                ? 'bg-emerald-500 text-neutral-950 border border-emerald-400'
                : 'bg-amber-500/15 hover:bg-amber-500 border border-amber-500/40 text-amber-300 hover:text-neutral-950 group-hover:bg-amber-500 group-hover:text-neutral-950'
            }`}
            title="أضف إلى السلة"
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline mr-1 font-black">تمت الإضافة</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline mr-1">أضف</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

