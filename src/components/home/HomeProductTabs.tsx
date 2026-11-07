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

  // Fast O(1) set for favorite lookups
  const wishlistSet = useMemo(() => new Set(wishlist), [wishlist]);

  // Filter products by tab (memoized)
  const displayedProducts = useMemo(() => {
    switch (activeTab) {
      case 'brands':
        return products
          .filter((p) => p.brandId || (p as any).brand || p.isFeatured)
          .slice(0, 16);
      case 'offers':
        return products
          .filter((p) => p.discountPercentage && p.discountPercentage > 0)
          .sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0))
          .slice(0, 16);
      case 'new':
        return products
          .filter((p) => p.isNewArrival || p.isFeatured)
          .slice(0, 16);
      case 'foryou':
      default:
        return products.slice(0, 16);
    }
  }, [products, activeTab]);

  return (
    <section className="w-full space-y-3.5 pt-1">
      {/* Strip matching SHEIN Home tabs: [لك (For You)] [البراندات] [وصل حديثاً] [العروض] | [عرض الكل] */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-1.5">
        <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto no-scrollbar py-0.5">
          {/* 1. For You / لك Tab */}
          <button
            type="button"
            id="home-product-tab-foryou"
            onClick={() => setActiveTab('foryou')}
            className={`flex items-center gap-1 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'foryou'
                ? 'bg-neutral-800 text-amber-400 border border-amber-400/40 shadow-sm'
                : 'bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${activeTab === 'foryou' ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>لك</span>
          </button>

          {/* 2. Brands Tab (Replaces bestsellers/trending section) */}
          <button
            type="button"
            id="home-product-tab-brands"
            onClick={() => {
              setActiveTab('brands');
              if (onOpenBrands) onOpenBrands();
            }}
            className={`flex items-center gap-1 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'brands'
                ? 'bg-neutral-800 text-amber-400 border border-amber-400/40 shadow-sm'
                : 'bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-850'
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
            className={`flex items-center gap-1 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'new'
                ? 'bg-neutral-800 text-amber-400 border border-amber-400/40 shadow-sm'
                : 'bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-850'
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
            className={`flex items-center gap-1 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'offers'
                ? 'bg-neutral-800 text-amber-400 border border-amber-400/40 shadow-sm'
                : 'bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-850'
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
            className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap pl-1"
          >
            <span>كل الماركات</span>
            <ArrowLeft className="w-3 h-3" />
          </button>
        ) : onViewAll ? (
          <button
            type="button"
            id="home-product-tab-view-all"
            onClick={onViewAll}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap pl-1"
          >
            عرض الكل
          </button>
        ) : null}
      </div>

      {/* Responsive Grid */}
      {products.length === 0 ? (
        <ProductGridSkeleton count={6} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5 sm:gap-4" />
      ) : (
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
      )}
    </section>
  );
});

HomeProductTabs.displayName = 'HomeProductTabs';
