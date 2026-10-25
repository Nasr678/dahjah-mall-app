import React, { useMemo, memo } from 'react';
import { Product, CurrencyCode } from '../../types';
import { ProductCard } from '../products/ProductCard';
import { ArrowLeft, Wand2 } from 'lucide-react';

interface PersonalizedForYouSectionProps {
  products: Product[];
  currency: CurrencyCode;
  wishlist: string[];
  userCity?: string;
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onViewAll?: () => void;
}

export const PersonalizedForYouSection: React.FC<PersonalizedForYouSectionProps> = memo(({
  products,
  currency,
  wishlist,
  userCity = 'صنعاء',
  onToggleFavorite,
  onAddToCart,
  onSelectProduct,
  onViewAll,
}) => {
  // Personalized picks based on varied categories and popularity
  const personalizedProducts = useMemo(() => {
    // Pick diverse items from different categories
    const categoriesSeen = new Set<string>();
    const selected: Product[] = [];

    for (const p of products) {
      if (!categoriesSeen.has(p.category)) {
        selected.push(p);
        categoriesSeen.add(p.category);
      }
      if (selected.length >= 6) break;
    }

    if (selected.length < 6) {
      for (const p of products) {
        if (!selected.some((item) => item.id === p.id)) {
          selected.push(p);
        }
        if (selected.length >= 6) break;
      }
    }

    return selected;
  }, [products]);

  const wishlistSet = useMemo(() => new Set(wishlist), [wishlist]);

  if (personalizedProducts.length === 0) return null;

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-black tracking-wider uppercase mb-1">
            <Wand2 className="w-4 h-4 text-purple-400" />
            <span>توصيات الذكاء الاصطناعي الذكية</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            مختارات لك
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            اقتراحات مخصصة تناسب ذوقك وتفضيلاتك في {userCity}
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

      {/* Grid of Personalized Items */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {personalizedProducts.map((product) => (
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

PersonalizedForYouSection.displayName = 'PersonalizedForYouSection';

