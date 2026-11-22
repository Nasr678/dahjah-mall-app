import React, { useState, useMemo } from 'react';
import { Brand, Product, CurrencyCode } from '../../types';
import { ProductCard } from '../products/ProductCard';
import { Sparkles, ArrowRight, Layers, Search, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { CachedImage } from '../common/CachedImage';
import { ProductGridSkeleton } from '../common/ProductSkeleton';

interface BrandsScreenProps {
  brands: Brand[];
  products: Product[];
  currency: CurrencyCode;
  wishlist: string[];
  initialBrandId?: string | null;
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onBackToHome: () => void;
}

export const BrandsScreen: React.FC<BrandsScreenProps> = ({
  brands,
  products,
  currency,
  wishlist,
  initialBrandId = null,
  onToggleFavorite,
  onAddToCart,
  onSelectProduct,
  onBackToHome,
}) => {
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(initialBrandId);
  const [searchQuery, setSearchQuery] = useState('');

  // Active brands only
  const activeBrands = useMemo(() => {
    return brands.filter((b) => b.isActive);
  }, [brands]);

  // Filtered brands by search
  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return activeBrands;
    const q = searchQuery.toLowerCase().trim();
    return activeBrands.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.description && b.description.toLowerCase().includes(q))
    );
  }, [activeBrands, searchQuery]);

  // Selected brand object
  const selectedBrand = useMemo(() => {
    if (!selectedBrandId) return null;
    return brands.find((b) => b.id === selectedBrandId) || null;
  }, [brands, selectedBrandId]);

  // Products belonging strictly to selected brand (Independent from category)
  const brandProducts = useMemo(() => {
    if (!selectedBrand) return [];
    return products.filter(
      (p) => p.brandId === selectedBrand.id || (p.brandName && p.brandName.toLowerCase() === selectedBrand.name.toLowerCase())
    );
  }, [products, selectedBrand]);

  return (
    <div className="w-full space-y-6 pb-12 animate-fade-in" id="brands-screen-container">
      {/* 1. Top Navigation Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="brands-back-button"
            onClick={() => {
              if (selectedBrandId) {
                setSelectedBrandId(null);
              } else {
                onBackToHome();
              }
            }}
            className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:border-neutral-300 shadow-sm transition-colors cursor-pointer"
            title="الرجوع"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-950 flex items-center gap-2">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              <span>{selectedBrand ? selectedBrand.name : 'البراندات'}</span>
            </h1>
            <p className="text-xs text-neutral-600 mt-0.5">
              {selectedBrand
                ? `تصفح جميع المنتجات الأصلية المعتمدة لبراند ${selectedBrand.name}`
                : 'تسوق مباشرة من الماركات والبراندات المعتمدة المستقلة'}
            </p>
          </div>
        </div>

        {selectedBrandId && (
          <button
            type="button"
            onClick={() => setSelectedBrandId(null)}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-neutral-200 text-xs font-bold text-amber-700 hover:text-amber-800 hover:border-amber-300 shadow-sm transition-colors cursor-pointer"
          >
            جميع البراندات
          </button>
        )}
      </div>

      {/* 2. Brand Specific View vs Full Brands Grid */}
      {selectedBrand ? (
        /* ========================================================================= */
        /* VIEW A: SPECIFIC BRAND DETAIL & ITS PRODUCTS */
        /* ========================================================================= */
        <div className="space-y-6 animate-fade-in">
          {/* Brand Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-white border border-neutral-200 p-5 sm:p-7 shadow-sm">
            {selectedBrand.coverImage && (
              <div className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none" style={{ backgroundImage: `url(${selectedBrand.coverImage})` }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-l from-white/95 via-white/90 to-amber-50/40 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Brand Logo */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#F6F7F9] border border-neutral-200 p-2 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                <CachedImage
                  src={selectedBrand.logo}
                  alt={selectedBrand.name}
                  preset="thumb"
                  containerClassName="w-full h-full"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Brand Info */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">
                    {selectedBrand.name}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>براند رسمي معتمد</span>
                  </span>
                </div>

                {selectedBrand.description && (
                  <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl leading-relaxed">
                    {selectedBrand.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-neutral-600 pt-1">
                  <span className="flex items-center gap-1.5 tabular-nums">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <strong className="text-neutral-950">{brandProducts.length}</strong> منتج متوفر
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ضمان الأصالة 100%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Products of Selected Brand */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-neutral-950 flex items-center gap-2">
                <span>منتجات {selectedBrand.name}</span>
                <span className="text-xs text-neutral-500 font-normal tabular-nums">({brandProducts.length} منتج)</span>
              </h3>
            </div>

            {products.length === 0 ? (
              <ProductGridSkeleton count={6} />
            ) : brandProducts.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm">
                <Layers className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-neutral-950 mb-1">لا توجد منتجات مضافة لهذا البراند حالياً</h4>
                <p className="text-xs text-neutral-600 max-w-md mx-auto mb-4">
                  سيتم إضافة وتحديث تشكيلة منتجات براند {selectedBrand.name} في أقرب وقت.
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedBrandId(null)}
                  className="px-4 py-2 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-800 text-xs font-bold hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  استعراض باقي البراندات
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
                {brandProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    currency={currency}
                    isFavorite={wishlist.includes(product.id)}
                    onToggleFavorite={onToggleFavorite}
                    onAddToCart={onAddToCart}
                    onSelectProduct={onSelectProduct}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW B: ALL BRANDS DIRECT LISTING */
        /* ========================================================================= */
        <div className="space-y-4 sm:space-y-5 animate-fade-in">
          {/* Compact Brands Banner */}
          <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-l from-white via-white to-amber-50/70 border border-neutral-200 p-3.5 sm:p-5 shadow-sm flex items-center justify-between gap-3">
            <div className="relative z-10 space-y-1 max-w-[70%] text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] sm:text-xs font-black">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>براندات حصرية وأصلية</span>
              </span>
              <h2 className="text-sm sm:text-base font-black text-neutral-950 leading-tight">
                ماركات وتوكيلات عالمية معتمدة
              </h2>
              <p className="text-[10px] sm:text-xs text-neutral-600 line-clamp-1">
                تسوق مباشرة من كبرى العلامات التجارية مع ضمان الجودة 100%
              </p>
            </div>

            {/* Visual Icon */}
            <div className="relative z-10 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#F6F7F9] border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm shrink-0">
              <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>

            {/* Subtle Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Search Bar if brands exist */}
          {activeBrands.length > 0 && (
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث عن براند أو ماركة معتمدة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-2xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500 shadow-sm transition-all"
              />
            </div>
          )}

          {/* Empty State if No Brands Added Yet */}
          {activeBrands.length === 0 ? (
            <div className="py-24 text-center bg-white rounded-3xl border border-neutral-200 p-8 space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-lg sm:text-xl font-bold text-neutral-950">لا توجد براندات حاليًا</h3>
                <p className="text-xs sm:text-sm text-neutral-600">
                  لم يتم إضافة براندات إلى المتجر حتى الآن. يمكنك تصفح باقي المنتجات والعروض من الصفحة الرئيسية.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  id="brands-empty-home-btn"
                  onClick={onBackToHome}
                  className="px-6 py-2.5 rounded-2xl bg-amber-400 text-neutral-950 text-xs font-black hover:bg-amber-500 transition-all shadow-sm cursor-pointer"
                >
                  العودة للصفحة الرئيسية
                </button>
              </div>
            </div>
          ) : filteredBrands.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm">
              <p className="text-sm font-bold text-neutral-800">لم يتم العثور على أي براند يطابق بحثك</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-3 text-xs text-amber-700 font-bold hover:underline cursor-pointer"
              >
                مسح البحث
              </button>
            </div>
          ) : (
            /* Brands Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
              {filteredBrands.map((brand) => {
                const count = products.filter(
                  (p) => p.brandId === brand.id || (p.brandName && p.brandName.toLowerCase() === brand.name.toLowerCase())
                ).length;

                return (
                  <div
                    key={brand.id}
                    id={`brand-card-${brand.id}`}
                    onClick={() => {
                      setSelectedBrandId(brand.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group relative overflow-hidden rounded-2xl bg-white border border-neutral-200 hover:border-amber-400 transition-all duration-300 cursor-pointer p-4 flex flex-col items-center text-center hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                  >
                    {/* Brand Logo Container */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#F6F7F9] border border-neutral-200/80 group-hover:border-amber-300 p-3 flex items-center justify-center overflow-hidden transition-colors mb-3">
                      <CachedImage
                        src={brand.logo}
                        alt={brand.name}
                        preset="thumb"
                        containerClassName="w-full h-full"
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* Brand Details */}
                    <div className="space-y-1 w-full">
                      <h4 className="text-sm sm:text-base font-bold text-neutral-950 truncate group-hover:text-amber-700 transition-colors">
                        {brand.name}
                      </h4>
                      {brand.description && (
                        <p className="text-[11px] text-neutral-500 line-clamp-1">
                          {brand.description}
                        </p>
                      )}
                    </div>

                    {/* Badge */}
                    <div className="mt-3 w-full pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500 tabular-nums">
                      <span>{count} منتج</span>
                      <span className="text-amber-700 font-bold group-hover:translate-x-[-2px] transition-transform">تصفح &larr;</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
