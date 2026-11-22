import React, { useState, memo, useCallback } from 'react';
import { Product, CurrencyCode } from '../../types';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Flame,
  Check 
} from 'lucide-react';
import { CachedImage } from '../common/CachedImage';
import { triggerFlyToCart } from '../cart/FlyToCartOverlay';

interface ProductCardProps {
  product: Product;
  currency: CurrencyCode;
  isFavorite: boolean;
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct?: (product: Product) => void;
  onSelect?: (product: Product) => void;
  onQuickBuy?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = memo(({
  product,
  currency,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onSelectProduct,
  onSelect,
  onQuickBuy,
}) => {
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
    if (onQuickBuy) {
      onQuickBuy(product);
    } else {
      triggerFlyToCart(product.images?.[0] || '', e.currentTarget as HTMLElement);
      onAddToCart(product);
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }, [onQuickBuy, onAddToCart, product]);

  const formatPrice = (priceYER: number) => {
    if (currency === 'USD') return `$${(priceYER / 530).toFixed(1)}`;
    if (currency === 'SAR') return `${(priceYER / 140).toFixed(0)} ر.س`;
    return `${priceYER.toLocaleString('ar-YE')} ر.ي`;
  };

  return (
    <div 
      onClick={handleSelect}
      className="group relative flex flex-col justify-between bg-white hover:bg-white border border-neutral-200/85 hover:border-amber-400/80 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 transition-all duration-200 hover:-translate-y-0.5 shadow-[0_2px_10px_rgba(15,23,42,0.03)] hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)] cursor-pointer overflow-hidden"
    >
      {/* Top Image & Floating Badges */}
      <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full rounded-2xl overflow-hidden bg-[#F3F4F6] mb-2.5 sm:mb-3">
        <CachedImage
          src={product.images?.[0]}
          alt={product.name}
          preset="card"
          fallbackText={product.name}
          containerClassName="w-full h-full"
          className="group-hover:scale-105 transition-transform duration-300"
        />

        {/* Subtle Top/Bottom Studio Vignette for badge legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-black/10 pointer-events-none" />

        {/* Badges on Top-Right */}
        <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 flex flex-col gap-1 z-10">
          {product.discountPercentage && (
            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] sm:text-[11px] font-black shadow-sm tabular-nums whitespace-nowrap">
              <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white" />
              <span>{product.discountPercentage}%-</span>
            </span>
          )}
          {!product.discountPercentage && product.isBestSeller && (
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 text-[9px] sm:text-[10px] font-black shadow-sm whitespace-nowrap">
              الأكثر مبيعاً
            </span>
          )}
          {!product.discountPercentage && product.isNewArrival && !product.isBestSeller && (
            <span className="px-2 py-0.5 rounded-full bg-neutral-900 text-amber-300 text-[9px] sm:text-[10px] font-bold shadow-sm whitespace-nowrap">
              جديد
            </span>
          )}
        </div>

        {/* Favorite Heart Button Top-Left */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className={`absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 p-2 rounded-full transition-transform duration-150 active:scale-90 z-10 cursor-pointer ${
            isFavorite
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
              : 'bg-white/95 border border-neutral-200 text-neutral-600 hover:text-rose-500 hover:bg-white shadow-xs'
          }`}
          aria-label="إضافة إلى المفضلة"
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? 'fill-white' : ''}`} />
        </button>

        {/* Low Stock Warning */}
        {product.stock <= 8 && (
          <div className="absolute bottom-1.5 inset-x-1.5 bg-amber-50/95 backdrop-blur-xs rounded-lg py-0.5 px-1.5 text-[9px] sm:text-[10px] font-bold text-amber-900 text-center border border-amber-300/80 truncate shadow-xs">
            متبقي {product.stock} قطع فقط!
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug mb-1.5 sm:mb-2">
            {product.name}
          </h3>

          <div className="flex items-center gap-1 mb-1.5 sm:mb-2.5">
            <div className="flex items-center gap-0.5 text-amber-600 text-[11px] sm:text-xs font-bold tabular-nums">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-neutral-400 tabular-nums">({product.reviewCount})</span>
          </div>
        </div>

        {/* Price & Add to Cart Footer */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-1.5 mt-auto">
          <div className="flex flex-col min-w-0">
            <div className="text-xs sm:text-base font-black text-neutral-950 whitespace-nowrap tabular-nums">
              {formatPrice(product.priceYER)}
            </div>
            {product.originalPriceYER && (
              <div className="text-[9px] sm:text-xs text-neutral-400 line-through whitespace-nowrap tabular-nums">
                {formatPrice(product.originalPriceYER)}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCartClick}
            className={`flex items-center justify-center min-h-[36px] min-w-[36px] p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold active:scale-95 transition-all shadow-xs flex-shrink-0 cursor-pointer whitespace-nowrap ${
              justAdded
                ? 'bg-emerald-600 text-white border border-emerald-600'
                : 'bg-amber-50 hover:bg-amber-400 border border-amber-300/80 text-amber-900 hover:text-neutral-950 group-hover:bg-amber-400 group-hover:text-neutral-950'
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

