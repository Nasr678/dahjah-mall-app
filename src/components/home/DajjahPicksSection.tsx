import React, { useMemo, memo } from 'react';
import { Product, CurrencyCode } from '../../types';
import { ProductCard } from '../products/ProductCard';
import { ArrowLeft, Award } from 'lucide-react';
import { ProductGridSkeleton } from '../common/ProductSkeleton';

interface DajjahPicksSectionProps {
  products: Product[];
  currency: CurrencyCode;
  wishlist: string[];
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onViewAll?: () => void;
}

export const DajjahPicksSection: React.FC<DajjahPicksSectionProps> = memo(({
  products,
  currency,
  wishlist,
  onToggleFavorite,
  onAddToCart,
  onSelectProduct,
  onViewAll,
}) => {
  // Filter top boutique curated choices
  const picks = useMemo(() => {
    return products
      .filter((p) => p.rating >= 4.9 && p.reviewCount >= 50)
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

  if (picks.length === 0) return null;

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-black tracking-wider uppercase mb-1">
            <Award className="w-4 h-4 text-amber-400" />
            <span>انتقاء فريق التنسيق والأزياء</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            اختيارات ضَجّة
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            قطع استثنائية تم فحص خاماتها وجودتها بعناية فائقة لتضمن لك تجربة فاخرة
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

      {/* Grid of Dajjah Picks */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {picks.map((product) => (
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

DajjahPicksSection.displayName = 'DajjahPicksSection';

