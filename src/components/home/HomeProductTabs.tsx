import React, { useState, useMemo, memo } from 'react';
import { Product, CurrencyCode } from '../../types';
import { ProductCard } from '../products/ProductCard';
import { Sparkles, Tag, Crown, Heart, ArrowLeft } from 'lucide-react';
import { ProductGridSkeleton } from '../common/ProductSkeleton';

interface HomeProductTabsProps {
  products: Product[];
  currency: CurrencyCode;
  wishlist: string[];
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onOpenBrands?: () => void;
  onViewAll?: () => void;
}

type TabType = 'foryou' | 'brands' | 'new' | 'offers';

export const HomeProductTabs: React.FC<HomeProductTabsProps> = memo(({
  products,
  currency,
  wishlist,
  onToggleFavorite,
  onAddToCart,
  onSelectProduct,
  onOpenBrands,
  onViewAll,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('foryou');
  const [visibleLimit, setVisibleLimit] = useState(12);

  // Fast O(1) set for favorite lookups
  const wishlistSet = useMemo(() => new Set(wishlist), [wishlist]);

  // Filter products by tab (memoized)
  const allFilteredProducts = useMemo(() => {
    switch (activeTab) {
      case 'brands':
        return products.filter((p) => p.brandId || (p as any).brand || p.isFeatured);
      case 'offers':
        return products
          .filter((p) => p.discountPercentage && p.discountPercentage > 0)
          .sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
      case 'new':
        return products.filter((p) => p.isNewArrival || p.isFeatured);
      case 'foryou':
      default:
        return products;
    }
  }, [products, activeTab]);

  const displayedProducts = useMemo(
    () => allFilteredProducts.slice(0, visibleLimit),
    [allFilteredProducts, visibleLimit]
  );

  return (
    <section className="w-full space-y-3.5 pt-1">
      {/* Strip matching luxury mall tabs */}
      <div className="flex items-center justify-between border-b border-neutral-200/90 pb-2">
        <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto no-scrollbar py-0.5">
          {/* 1. For You Tab */}
          <button
            type="button"
            id="home-product-tab-foryou"
            onClick={() => setActiveTab('foryou')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'foryou'
                ? 'bg-neutral-900 text-amber-300 border border-neutral-900 shadow-xs'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:text-neutral-950 hover:border-amber-400/60'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${activeTab === 'foryou' ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>لك</span>
          </button>

          {/* 2. Brands Tab */}
          <button
            type="button"
            id="home-product-tab-brands"
            onClick={() => {
              setActiveTab('brands');
              if (onOpenBrands) onOpenBrands();
            }}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'brands'
                ? 'bg-neutral-900 text-amber-300 border border-neutral-900 shadow-xs'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:text-neutral-950 hover:border-amber-400/60'
            }`}
          >
            <Crown className={`w-3.5 h-3.5 ${activeTab === 'brands' ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>البراندات</span>
          </button>

          {/* 3. New Arrivals Tab */}
          <button
            type="button"
            id="home-product-tab-new"
            onClick={() => setActiveTab('new')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'new'
                ? 'bg-neutral-900 text-amber-300 border border-neutral-900 shadow-xs'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:text-neutral-950 hover:border-amber-400/60'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'new' ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>وصل حديثاً</span>
          </button>

          {/* 4. Offers Tab */}
          <button
            type="button"
            id="home-product-tab-offers"
            onClick={() => setActiveTab('offers')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'offers'
                ? 'bg-neutral-900 text-amber-300 border border-neutral-900 shadow-xs'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:text-neutral-950 hover:border-amber-400/60'
            }`}
          >
            <Tag className={`w-3.5 h-3.5 ${activeTab === 'offers' ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>العروض</span>
          </button>
        </div>

        {activeTab === 'brands' && onOpenBrands ? (
          <button
            type="button"
            id="home-product-tab-explore-brands"
            onClick={onOpenBrands}
            className="flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors whitespace-nowrap pl-1 cursor-pointer"
          >
            <span>كل الماركات</span>
            <ArrowLeft className="w-3 h-3" />
          </button>
        ) : onViewAll ? (
          <button
            type="button"
            id="home-product-tab-view-all"
            onClick={onViewAll}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors whitespace-nowrap pl-1 cursor-pointer"
          >
            عرض الكل
          </button>
        ) : null}
      </div>

      {/* Responsive Grid */}
      {products.length === 0 ? (
        <ProductGridSkeleton count={6} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5 sm:gap-4" />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5 sm:gap-4">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={currency}
                isFavorite={wishlistSet.has(product.id)}
                onToggleFavorite={onToggleFavorite}
                onAddToCart={onAddToCart}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
          {allFilteredProducts.length > visibleLimit && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setVisibleLimit((prev) => prev + 12)}
                className="px-6 py-2.5 rounded-xl bg-white hover:bg-amber-50 border border-neutral-200 hover:border-amber-400/60 text-neutral-900 hover:text-amber-900 text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                عرض المزيد ({Math.min(12, allFilteredProducts.length - visibleLimit)} منتجات إضافية)
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
});

HomeProductTabs.displayName = 'HomeProductTabs';
