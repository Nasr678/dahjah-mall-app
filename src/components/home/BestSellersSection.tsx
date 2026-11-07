import React, { useMemo, memo } from 'react';
import { Product, CurrencyCode } from '../../types';
import { ProductCard } from '../products/ProductCard';
import { Flame, ArrowLeft } from 'lucide-react';
import { ProductGridSkeleton } from '../common/ProductSkeleton';

interface BestSellersSectionProps {
  products: Product[];
  currency: CurrencyCode;
  wishlist: string[];
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onViewAll?: () => void;
}

export const BestSellersSection: React.FC<BestSellersSectionProps> = memo(({
  products,
  currency,
  wishlist,
  onToggleFavorite,
  onAddToCart,
  onSelectProduct,
  onViewAll,
}) => {
  // Filter best seller items
  const bestSellers = useMemo(() => {
    return products
      .filter((p) => p.isBestSeller || (p.rating >= 4.8 && p.reviewCount > 40))
      .slice(0, 6);
  }, [products]);

  const wishlistSet = useMemo(() => new Set(wishlist), [wishlist]);

  if (products.length === 0) {
    return (
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="h-4 w-28 rounded shimmer-wave" />
            <div className="h-7 w-44 rounded shimmer-wave" />
          </div>
        </div>
        <ProductGridSkeleton count={6} />
      </section>
    );
  }

  if (bestSellers.length === 0) return null;

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-black tracking-wider uppercase mb-1">
            <Flame className="w-4 h-4 fill-rose-400" />
            <span>الأعلى طلباً وإقبالاً</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            الأكثر مبيعاً
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            القطع التي نالت إعجاب وثقة آلاف المتسوقين في اليمن
          </p>
        </div>

        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap group pb-1"
          >
            <span>عرض الكل</span>
            <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform" />
          </button>
        )}
      </div>

      {/* Grid of Best Sellers */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {bestSellers.map((product) => (
          <div key={product.id}>
            <ProductCard
              product={product}
              currency={currency}
              isFavorite={wishlistSet.has(product.id)}
              onToggleFavorite={onToggleFavorite}
              onAddToCart={onAddToCart}
              onSelectProduct={onSelectProduct}
            />
          </div>
        ))}
      </div>
    </section>
  );
});

BestSellersSection.displayName = 'BestSellersSection';

