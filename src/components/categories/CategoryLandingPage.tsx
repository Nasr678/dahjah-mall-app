import React, { useState, useMemo, useEffect } from 'react';
import { Category, Product, CurrencyCode } from '../../types';
import { ProductCard } from '../products/ProductCard';
import { MAIN_CATEGORY_METAS, getSubcategoryImage } from '../../data/categoryImages';
import { ArrowRight, SlidersHorizontal, ArrowDownUp, X, Check, Sparkles, Search, ShoppingCart } from 'lucide-react';
import { CachedImage } from '../common/CachedImage';
import { ProductGridSkeleton } from '../common/ProductSkeleton';

interface CategoryLandingPageProps {
  category: Category;
  allCategories: Category[];
  products: Product[];
  currency: CurrencyCode;
  wishlist: string[];
  initialSubcategory?: string | null;
  onSelectCategory: (categoryId: string) => void;
  onBackToHome: () => void;
  onBackToMainCategories?: () => void;
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onOpenCart?: () => void;
  onOpenSearch?: () => void;
}

// Subcategory matching helper
function matchSubcategory(productSubcategory: string | undefined, selectedSub: string): boolean {
  if (!productSubcategory) return false;
  const s1 = productSubcategory.trim().toLowerCase();
  const s2 = selectedSub.trim().toLowerCase();
  if (s1 === s2) return true;
  if ((s1.includes('بناطيل') || s1.includes('بناطل')) && (s2.includes('بناطيل') || s2.includes('بناطل'))) return true;
  if ((s1.includes('تنورة') || s1.includes('تنانير') || s1.includes('تنورات')) && (s2.includes('تنورة') || s2.includes('تنانير') || s2.includes('تنورات'))) return true;
  if ((s1.includes('روب') || s1.includes('أرواب')) && (s2.includes('روب') || s2.includes('أرواب'))) return true;
  if ((s1.includes('فستان') || s1.includes('فساتين')) && (s2.includes('فستان') || s2.includes('فساتين'))) return true;
  if ((s1.includes('طقم') || s1.includes('أطقم')) && (s2.includes('طقم') || s2.includes('أطقم'))) return true;
  if ((s1.includes('بلوز') || s1.includes('بلوزات')) && (s2.includes('بلوز') || s2.includes('بلوزات'))) return true;
  if ((s1.includes('تيشيرت') || s1.includes('تيشرت')) && (s2.includes('تيشيرت') || s2.includes('تيشرت'))) return true;
  if ((s1.includes('قميص') || s1.includes('قمصان')) && (s2.includes('قميص') || s2.includes('قمصان'))) return true;
  if ((s1.includes('صندل') || s1.includes('صنادل')) && (s2.includes('صندل') || s2.includes('صنادل'))) return true;
  if ((s1.includes('شنط') || s1.includes('حقائب') || s1.includes('حقيبة')) && (s2.includes('شنط') || s2.includes('حقائب') || s2.includes('حقيبة'))) return true;
  return s1.includes(s2) || s2.includes(s1);
}

export const CategoryLandingPage: React.FC<CategoryLandingPageProps> = React.memo(({
  category,
  products,
  currency,
  wishlist,
  initialSubcategory = null,
  onBackToHome,
  onBackToMainCategories,
  onToggleFavorite,
  onAddToCart,
  onSelectProduct,
  onOpenCart,
  onOpenSearch,
}) => {
  // Current active subcategory filter
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(initialSubcategory);

  // Sync state when initialSubcategory changes
  useEffect(() => {
    setSelectedSubcategory(initialSubcategory || null);
  }, [initialSubcategory, category.id]);

  // Filters & Sorting state
  const [sortBy, setSortBy] = useState<'featured' | 'priceLow' | 'priceHigh' | 'rating' | 'discount'>('featured');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Get category metadata
  const categoryMeta = MAIN_CATEGORY_METAS[category.id];
  const subcategoryList = categoryMeta?.subcategories?.map((s) => s.name) || category.subcategories || [];

  // Products belonging to this category
  const categoryProducts = useMemo(() => {
    return products.filter((p) => p.category === category.id);
  }, [products, category.id]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let list = [...categoryProducts];

    // Filter by subcategory
    if (selectedSubcategory) {
      list = list.filter((p) => matchSubcategory(p.subcategory, selectedSubcategory));
    }

    // Filter by discount
    if (discountOnly) {
      list = list.filter((p) => p.discountPercentage && p.discountPercentage > 0);
    }

    // Filter by stock
    if (inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }

    // Sort
    if (sortBy === 'priceLow') {
      list.sort((a, b) => a.priceYER - b.priceYER);
    } else if (sortBy === 'priceHigh') {
      list.sort((a, b) => b.priceYER - a.priceYER);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'discount') {
      list.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
    }

    return list;
  }, [categoryProducts, selectedSubcategory, discountOnly, inStockOnly, sortBy]);

  // Incremental pagination (16 items per page) to keep DOM ultra lightweight
  const [displayCount, setDisplayCount] = useState(16);

  useEffect(() => {
    setDisplayCount(16);
  }, [category.id, selectedSubcategory, sortBy, discountOnly, inStockOnly]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, displayCount);
  }, [filteredProducts, displayCount]);

  const wishlistSet = useMemo(() => new Set(wishlist), [wishlist]);

  // Handle Back Button
  const handleBack = () => {
    if (selectedSubcategory) {
      // Step: Subcategory -> Category Main Page
      setSelectedSubcategory(null);
    } else if (onBackToMainCategories) {
      // Step: Category Main Page -> Main Categories Screen
      onBackToMainCategories();
    } else {
      // Step: Main Categories -> Home
      onBackToHome();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-16">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER (Matching Screens 3 & 4 in Reference Design) */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between py-2 px-1 border-b border-neutral-800/80 sticky top-0 bg-neutral-950/95 backdrop-blur-md z-30">
        {/* Right side in RTL: Back Button */}
        <button
          type="button"
          id="btn-category-back"
          onClick={handleBack}
          className="p-2 -mr-2 rounded-full hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none"
          title="رجوع"
        >
          <ArrowRight className="w-5 h-5 text-neutral-200" />
        </button>

        {/* Center: Title (Category Name or Selected Subcategory Name) */}
        <div className="text-center">
          <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
            {selectedSubcategory || category.name}
          </h1>
          {selectedSubcategory && (
            <p className="text-[11px] text-neutral-400 font-medium">
              قسم {category.name}
            </p>
          )}
        </div>

        {/* Left side in RTL: Quick Action Icons */}
        <div className="flex items-center gap-1">
          {onOpenSearch && (
            <button
              type="button"
              onClick={onOpenSearch}
              className="p-2 rounded-full hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
              title="بحث"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
          {onOpenCart && (
            <button
              type="button"
              onClick={onOpenCart}
              className="p-2 rounded-full hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
              title="السلة"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CATEGORY EDITORIAL HERO BANNER (Shown when on Category Level) */}
      {/* ========================================================================= */}
      {!selectedSubcategory && (
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-xl min-h-[160px] sm:min-h-[220px] flex flex-col justify-end p-5 sm:p-7">
          <CachedImage
            src={categoryMeta?.bannerImage || category.bannerImage || category.image}
            alt={category.name}
            preset="banner"
            priority
            fallbackText={category.name}
            containerClassName="absolute inset-0 w-full h-full"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-1 sm:space-y-1.5 max-w-lg">
            <span className="text-[11px] sm:text-xs font-bold text-amber-400">
              قسم
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {category.name}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 font-medium">
              {category.subtitle || 'تشكيلة واسعة وموديلات حصرية تناسب ذوقك'}
            </p>
            <div className="pt-1 flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-950/80 text-neutral-300 border border-neutral-700/60 backdrop-blur-sm">
                {categoryMeta?.sectionCountText || `${subcategoryList.length} قسم فرعي`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUBCATEGORIES HORIZONTAL CIRCLE/PILL STRIP (Matches Reference Design) */}
      {/* ========================================================================= */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-neutral-400">
            {selectedSubcategory ? 'تصفح باقي الفئات الفرعية:' : 'الفئات الفرعية:'}
          </span>
          {selectedSubcategory && (
            <button
              type="button"
              onClick={() => setSelectedSubcategory(null)}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              عرض الكل ({categoryProducts.length})
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-2 pt-1 px-1 no-scrollbar scroll-smooth">
          {subcategoryList.map((subName) => {
            const isSelected = selectedSubcategory === subName;
            const subImage = getSubcategoryImage(category.id, subName);

            return (
              <button
                key={subName}
                type="button"
                id={`subcat-pill-${subName}`}
                onClick={() => {
                  if (selectedSubcategory === subName) {
                    setSelectedSubcategory(null);
                  } else {
                    setSelectedSubcategory(subName);
                  }
                }}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 group focus:outline-none transition-transform active:scale-95"
              >
                {/* Circular Subcategory Image Container */}
                <div
                  className={`relative w-13 h-13 sm:w-16 sm:h-16 rounded-full overflow-hidden p-0.5 transition-all duration-200 ${
                    isSelected
                      ? 'ring-2 ring-amber-400 bg-amber-500/20 shadow-md shadow-amber-500/20 scale-105'
                      : 'bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:scale-105'
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-neutral-950">
                    <CachedImage
                      src={subImage}
                      alt={subName}
                      preset="thumb"
                      fallbackText={subName}
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>

                {/* Subcategory Name Label */}
                <span
                  className={`text-[11px] sm:text-xs font-bold tracking-tight text-center transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'text-amber-400'
                      : 'text-neutral-300 group-hover:text-white'
                  }`}
                >
                  {subName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. PRODUCTS COUNT & FILTER / SORT BAR (Matches Screen 4 in Reference) */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between pt-3 pb-1 border-t border-neutral-800/80 px-1">
        {/* Product Count Badge */}
        <span className="text-xs sm:text-sm font-bold text-neutral-300">
          عدد {filteredProducts.length} منتج
        </span>

        {/* Filter and Sort Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSortModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs font-bold transition-colors"
          >
            <ArrowDownUp className="w-3.5 h-3.5 text-amber-400" />
            <span>الترتيب</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
              discountOnly || inStockOnly
                ? 'bg-amber-500/15 border-amber-400 text-amber-300'
                : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>التصفية</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. 2-COLUMN PRODUCT GRID (Matching Reference Design Product Grid) */}
      {/* ========================================================================= */}
      {products.length === 0 ? (
        <ProductGridSkeleton count={8} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5" />
      ) : filteredProducts.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
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

          {/* Load More Button for large catalogs */}
          {filteredProducts.length > displayCount && (
            <div className="text-center pt-2 pb-4">
              <button
                type="button"
                onClick={() => setDisplayCount((prev) => prev + 16)}
                className="px-6 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-amber-400 font-bold text-xs sm:text-sm transition-all shadow-lg active:scale-95"
              >
                عرض المزيد من المنتجات ({filteredProducts.length - displayCount} متبقي)
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 sm:p-12 rounded-3xl bg-neutral-900/60 border border-neutral-800 text-center space-y-3 my-6">
          <div className="w-12 h-12 rounded-2xl bg-neutral-800 mx-auto flex items-center justify-center text-neutral-400">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-base font-bold text-white">لا توجد منتجات مطابقة حالياً</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            لم نجد منتجات تطابق الفلاتر المحددة في هذا القسم. جرب إلغاء بعض الفلاتر لاستعراض باقي المنتجات.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedSubcategory(null);
              setDiscountOnly(false);
              setInStockOnly(false);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400 transition-colors"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SORT MODAL DRAWER */}
      {/* ========================================================================= */}
      {isSortModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-md bg-neutral-900 border-t sm:border border-neutral-800 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowDownUp className="w-4 h-4 text-amber-400" />
                <span>ترتيب المنتجات</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsSortModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {[
                { id: 'featured', label: 'المميزة والموصى بها' },
                { id: 'priceLow', label: 'السعر: من الأقل إلى الأعلى' },
                { id: 'priceHigh', label: 'السعر: من الأعلى إلى الأقل' },
                { id: 'rating', label: 'الأعلى تقييماً' },
                { id: 'discount', label: 'أعلى نسبة تخفيض' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSortBy(opt.id as any);
                    setIsSortModalOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-colors ${
                    sortBy === opt.id
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-neutral-950 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  <span>{opt.label}</span>
                  {sortBy === opt.id && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FILTER MODAL DRAWER */}
      {/* ========================================================================= */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-md bg-neutral-900 border-t sm:border border-neutral-800 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <span>تصفية النتائج</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 py-2">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950 border border-neutral-800 cursor-pointer">
                <span className="text-xs font-bold text-neutral-200">المنتجات المخفضة فقط</span>
                <input
                  type="checkbox"
                  checked={discountOnly}
                  onChange={(e) => setDiscountOnly(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950 border border-neutral-800 cursor-pointer">
                <span className="text-xs font-bold text-neutral-200">المتوفر في المخزن فقط</span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDiscountOnly(false);
                  setInStockOnly(false);
                  setIsFilterModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 font-bold text-xs hover:bg-neutral-700"
              >
                إلغاء التصفية
              </button>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400"
              >
                تطبيق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

CategoryLandingPage.displayName = 'CategoryLandingPage';

