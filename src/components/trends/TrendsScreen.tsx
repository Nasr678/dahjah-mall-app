import React, { useState, useMemo } from 'react';
import { Product, CurrencyCode } from '../../types';
import { ProductCard } from '../products/ProductCard';
import { 
  Flame, 
  Search, 
  ArrowRight, 
  Bot,
  ChevronLeft,
  Crown
} from 'lucide-react';
import { CachedImage } from '../common/CachedImage';
import { ProductGridSkeleton } from '../common/ProductSkeleton';

interface TrendsScreenProps {
  products: Product[];
  currency: CurrencyCode;
  wishlist: string[];
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onBackToHome: () => void;
  onOpenAI?: () => void;
  onOpenSearch?: () => void;
}

export const TrendsScreen: React.FC<TrendsScreenProps> = ({
  products,
  currency,
  wishlist,
  onToggleFavorite,
  onAddToCart,
  onSelectProduct,
  onBackToHome,
  onOpenAI,
  onOpenSearch,
}) => {
  const [activeMainSubTab, setActiveMainSubTab] = useState<'trends_store' | 'trending_picks'>('trending_picks');
  const [activeHashtag, setActiveHashtag] = useState<string>('for_you');
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);

  // Curated Trends Lookbooks matching SHEIN Image 2
  const lookbooks = [
    {
      id: 'lookbook-1',
      tag: 'AquaticPrints #',
      arabicTag: '#طبعات_صيفية_بحرية',
      description: 'أناقة بحرية ساحرة مستوحاة من روعة الصيف وعالم البحار',
      bgImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
      items: [
        {
          id: 'prev-1',
          brand: 'Swim Oasis',
          price: '$20.67',
          image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=400&auto=format&fit=crop',
        },
        {
          id: 'prev-2',
          brand: 'Just Fantastic',
          price: '$3.00',
          image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop',
        },
        {
          id: 'prev-3',
          brand: 'FEISTURE',
          price: '$10.80',
          image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop',
        },
      ],
    },
    {
      id: 'lookbook-2',
      tag: 'BowChic #',
      arabicTag: '#شياكة_الفخامة_والفيونكات',
      description: 'لمسات كلاسيكية فاخرة تناسب إطلالاتك الراقية والحفلات',
      bgImage: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1200&auto=format&fit=crop',
      items: [
        {
          id: 'prev-4',
          brand: 'Elegance Paris',
          price: '$36.50',
          image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop',
        },
        {
          id: 'prev-5',
          brand: 'Luxe Velvet',
          price: '$18.90',
          image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop',
        },
        {
          id: 'prev-6',
          brand: 'SHEIN MOD',
          price: '$24.00',
          image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=400&auto=format&fit=crop',
        },
      ],
    },
  ];

  const currentLookbook = lookbooks[activeCardIndex] || lookbooks[0];

  // Hashtag filters matching SHEIN reference
  const hashtags = [
    { id: 'for_you', label: 'For You', arabic: 'لك خصيصاً ✨' },
    { id: 'heart_obsessed', label: '#HeartObsessed', arabic: '#الأكثر_إعجاباً ❤️' },
    { id: 'elevated_basics', label: '#ElevatedBasics', arabic: '#أساسيات_أنيقة 💎' },
    { id: 'everyday_sandals', label: '#EverydaySandals', arabic: '#صنادل_وأحذية 👡' },
    { id: 'summer_dresses', label: '#SummerDresses', arabic: '#فساتين_صيفية 👗' },
  ];

  // Filter products by selected hashtag & tab
  const displayedProducts = useMemo(() => {
    let list = [...products];

    if (activeMainSubTab === 'trends_store') {
      list = list.filter((p) => p.brandId || (p as any).brand || p.isFeatured);
    } else {
      if (activeHashtag === 'heart_obsessed') {
        list = list.filter((p) => p.rating >= 4.8 || (p.reviewCount && p.reviewCount > 20));
      } else if (activeHashtag === 'elevated_basics') {
        list = list.filter((p) => p.category === 'women' || p.category === 'boys');
      } else if (activeHashtag === 'everyday_sandals') {
        list = list.filter((p) => p.category === 'shoes');
      } else if (activeHashtag === 'summer_dresses') {
        list = list.filter((p) => p.category === 'women' && p.name.includes('فستان'));
      }
    }

    return list.length > 0 ? list : products;
  }, [products, activeMainSubTab, activeHashtag]);

  return (
    <div className="w-full min-h-screen bg-[#F6F7F9] pb-24 text-neutral-900">
      {/* 1. Header with Icons */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-neutral-200 px-3.5 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToHome}
            className="p-1.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-700 hover:text-neutral-950 transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span className="text-sm font-black tracking-tight text-neutral-950">ترندات والبراندات</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSearch}
            className="p-2 rounded-full hover:bg-[#F6F7F9] text-neutral-700 hover:text-neutral-950 transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onOpenAI}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-amber-600" />
            <span>مساعد AI</span>
          </button>
        </div>
      </div>

      {/* 2. Top Editorial Lookbook Hero Banner */}
      <div className="relative w-full overflow-hidden">
        <div className="relative h-64 sm:h-72 w-full">
          <CachedImage
            src={currentLookbook.bgImage}
            alt={currentLookbook.tag}
            preset="banner"
            priority={true}
            containerClassName="w-full h-full"
            className="w-full h-full object-cover brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/65 via-neutral-950/20 to-transparent" />

          {/* Floating Frosted Light Lookbook Box */}
          <div className="absolute inset-x-3 bottom-3 sm:inset-x-6 sm:bottom-4 p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white shadow-xl space-y-3">
            {/* Header: Tag + Description + Counter */}
            <div className="flex items-start justify-between">
              <div className="space-y-0.5 text-right">
                <div className="flex items-center gap-1.5">
                  <ChevronLeft 
                    className="w-4 h-4 text-neutral-500 cursor-pointer hover:text-neutral-950"
                    onClick={() => setActiveCardIndex((prev) => (prev === 0 ? lookbooks.length - 1 : prev - 1))}
                  />
                  <h2 className="text-sm sm:text-base font-black text-neutral-950 tracking-wide">
                    {currentLookbook.arabicTag}
                  </h2>
                </div>
                <p className="text-[11px] sm:text-xs text-neutral-600 font-medium line-clamp-1">
                  {currentLookbook.description}
                </p>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F6F7F9] text-neutral-700 border border-neutral-200 tabular-nums">
                {activeCardIndex + 1} / {lookbooks.length}
              </span>
            </div>

            {/* 3 Floating Product Preview Cards */}
            <div className="grid grid-cols-3 gap-2">
              {currentLookbook.items.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-xl overflow-hidden bg-white p-1 border border-neutral-200 shadow-sm text-center flex flex-col items-center"
                >
                  <div className="w-full aspect-[4/5] rounded-lg overflow-hidden bg-[#F6F7F9]">
                    <CachedImage
                      src={item.image}
                      alt={item.brand}
                      preset="thumb"
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between w-full px-1">
                    <span className="text-[9px] font-bold text-neutral-700 truncate max-w-[50%]">
                      {item.brand}
                    </span>
                    <span className="text-[10px] font-black text-neutral-950 bg-amber-400 px-1.5 rounded-sm tabular-nums">
                      {item.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Subtabs Bar */}
      <div className="w-full bg-white border-b border-neutral-200 px-4 pt-3 flex items-center justify-around">
        <button
          type="button"
          onClick={() => setActiveMainSubTab('trends_store')}
          className={`relative pb-2.5 text-xs sm:text-sm font-black transition-all cursor-pointer ${
            activeMainSubTab === 'trends_store'
              ? 'text-neutral-950'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-600" />
            <span>متجر الماركات (Trends Store)</span>
          </div>
          {activeMainSubTab === 'trends_store' && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-amber-500 rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveMainSubTab('trending_picks')}
          className={`relative pb-2.5 text-xs sm:text-sm font-black transition-all cursor-pointer ${
            activeMainSubTab === 'trending_picks'
              ? 'text-neutral-950'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-rose-500" />
            <span>مختارات الترند (Trending Picks)</span>
          </div>
          {activeMainSubTab === 'trending_picks' && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-amber-500 rounded-full" />
          )}
        </button>
      </div>

      {/* 4. Hashtag Filter Pills */}
      <div className="px-3 sm:px-4 py-2.5 bg-[#F6F7F9] border-b border-neutral-200/60 overflow-x-auto no-scrollbar flex items-center gap-2">
        {hashtags.map((tag) => {
          const isSelected = activeHashtag === tag.id;
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => setActiveHashtag(tag.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-400 text-neutral-950 font-black shadow-sm'
                  : 'bg-white border border-neutral-200 text-neutral-700 hover:border-amber-300'
              }`}
            >
              {tag.arabic}
            </button>
          );
        })}
      </div>

      {/* 5. 2-Column Product Grid */}
      <div className="px-3 sm:px-4 pt-3">
        {products.length === 0 ? (
          <ProductGridSkeleton count={6} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5">
            {displayedProducts.map((product) => (
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
  );
};
