import React, { useMemo, memo } from 'react';
import { Product, CurrencyCode } from '../../types';
import { ProductCard } from '../products/ProductCard';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { ProductGridSkeleton } from '../common/ProductSkeleton';

interface NewArrivalsSectionProps {
  products: Product[];
  currency: CurrencyCode;
  wishlist: string[];
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onViewAll?: () => void;
}

export const NewArrivalsSection: React.FC<NewArrivalsSectionProps> = memo(({
  products,
  currency,
  wishlist,
  onToggleFavorite,
  onAddToCart,
  onSelectProduct,
  onViewAll,
}) => {
  // Filter new arrivals items
  const newArrivals = useMemo(() => {
    return products
      .filter((p) => p.isNewArrival)
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

  if (newArrivals.length === 0) return null;

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-700 text-xs font-black tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4 fill-amber-500 text-amber-600" />
            <span>أحدث الإضافات الحصرية</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            وصل حديثاً
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            إصدارات الموسم الجديد وتصاميم تواكب أحدث خطوط الموضة العالمية
          </p>
        </div>

        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors whitespace-nowrap group pb-1 cursor-pointer"
          >
            <span>عرض الكل</span>
            <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform" />
          </button>
        )}
      </div>

      {/* Grid of New Arrivals */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {newArrivals.map((product) => (
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

NewArrivalsSection.displayName = 'NewArrivalsSection';

