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
    <div className="w-full min-h-screen bg-neutral-950 pb-24 text-neutral-100">
      {/* 1. Transparent Header with Icons matching SHEIN Screen 2 */}
      <div className="sticky top-0 z-30 bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-850 px-3.5 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToHome}
            className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-850 text-neutral-300 hover:text-white"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-sm font-black tracking-tight text-white">ترندات والبراندات</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSearch}
            className="p-2 rounded-full hover:bg-neutral-900 text-neutral-300 hover:text-white transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onOpenAI}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition-colors"
          >
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            <span>مساعد AI</span>
          </button>
        </div>
      </div>

      {/* 2. Top Editorial Lookbook Hero Banner matching Image 2 */}
      <div className="relative w-full overflow-hidden">
        {/* Background Image with Blur */}
        <div className="relative h-64 sm:h-72 w-full">
          <CachedImage
            src={currentLookbook.bgImage}
            alt={currentLookbook.tag}
            preset="banner"
            priority={true}
            containerClassName="w-full h-full"
            className="w-full h-full object-cover brightness-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

          {/* Floating Frosted Glass Lookbook Box matching Image 2 */}
          <div className="absolute inset-x-3 bottom-3 sm:inset-x-6 sm:bottom-4 p-3.5 sm:p-4 rounded-2xl bg-neutral-900/85 backdrop-blur-md border border-neutral-750/80 shadow-2xl space-y-3">
            {/* Header: Tag + Description + Counter */}
            <div className="flex items-start justify-between">
              <div className="space-y-0.5 text-right">
                <div className="flex items-center gap-1.5">
                  <ChevronLeft 
                    className="w-4 h-4 text-neutral-400 cursor-pointer hover:text-white"
                    onClick={() => setActiveCardIndex((prev) => (prev === 0 ? lookbooks.length - 1 : prev - 1))}
                  />
                  <h2 className="text-sm sm:text-base font-black text-white tracking-wide">
                    {currentLookbook.arabicTag}
                  </h2>
                </div>
                <p className="text-[11px] sm:text-xs text-neutral-300 font-medium line-clamp-1">
                  {currentLookbook.description}
                </p>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
                {activeCardIndex + 1} / {lookbooks.length}
              </span>
            </div>

            {/* 3 Floating Product Preview Cards ($20.67, $3.00, $10.80) matching SHEIN */}
            <div className="grid grid-cols-3 gap-2">
              {currentLookbook.items.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-xl overflow-hidden bg-white/95 p-1 border border-white/80 shadow-md text-center flex flex-col items-center"
                >
                  <div className="w-full aspect-[4/5] rounded-lg overflow-hidden bg-neutral-100">
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
                    <span className="text-[10px] font-black text-neutral-950 bg-amber-400/90 px-1 rounded-sm">
                      {item.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Subtabs Bar: [Trends Store] | [Trending Picks] matching Image 2 */}
      <div className="w-full bg-neutral-950 border-b border-neutral-850 px-4 pt-3 flex items-center justify-around">
        <button
          type="button"
          onClick={() => setActiveMainSubTab('trends_store')}
          className={`relative pb-2.5 text-xs sm:text-sm font-black transition-all cursor-pointer ${
            activeMainSubTab === 'trends_store'
              ? 'text-white'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>متجر الماركات (Trends Store)</span>
          </div>
          {activeMainSubTab === 'trends_store' && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-amber-400 rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveMainSubTab('trending_picks')}
          className={`relative pb-2.5 text-xs sm:text-sm font-black transition-all cursor-pointer ${
            activeMainSubTab === 'trending_picks'
              ? 'text-white'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-rose-500" />
            <span>مختارات الترند (Trending Picks)</span>
          </div>
          {activeMainSubTab === 'trending_picks' && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-amber-400 rounded-full" />
          )}
        </button>
      </div>

      {/* 4. Hashtag Filter Pills matching Image 2 */}
      <div className="px-3 sm:px-4 py-2.5 bg-neutral-950 overflow-x-auto no-scrollbar flex items-center gap-2">
        {hashtags.map((tag) => {
          const isSelected = activeHashtag === tag.id;
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => setActiveHashtag(tag.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-neutral-950 font-black shadow-sm'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-700'
              }`}
            >
              {tag.arabic}
            </button>
          );
        })}
      </div>

      {/* 5. 2-Column Product Grid matching SHEIN */}
      <div className="px-3 sm:px-4 pt-2">
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
