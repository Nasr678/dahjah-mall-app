import React from 'react';
import { Flame, Truck, ArrowLeft, Coins, CheckCircle2 } from 'lucide-react';
import { CachedImage } from '../common/CachedImage';

interface FeaturedStoresProps {
  onSelectStore?: (storeId: string) => void;
  onExploreCategories?: () => void;
}

export const FeaturedStores: React.FC<FeaturedStoresProps> = React.memo(({ onSelectStore, onExploreCategories }) => {
  const handleAction = () => {
    if (onExploreCategories) {
      onExploreCategories();
    } else if (onSelectStore) {
      onSelectStore('women');
    }
  };

  return (
    <section className="w-full space-y-4 pt-4 pb-2">
      {/* 1. Editorial Dajjah Official Mall Banner */}
      <div 
        onClick={handleAction}
        className="group relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-200/90 hover:border-amber-400/80 transition-all duration-300 cursor-pointer shadow-[0_12px_34px_rgba(15,23,42,0.08)] p-5 sm:p-8 flex flex-col justify-between min-h-[200px] sm:min-h-[260px]"
      >
        <CachedImage
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b"
          alt="ضَجّة مول — الموضة والأناقة"
          preset="banner"
          containerClassName="absolute inset-0 w-full h-full"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-50 sm:opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/60 to-neutral-950/25" />

        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-400 text-neutral-950 font-black text-[11px] sm:text-xs shadow-sm flex items-center gap-1 whitespace-nowrap">
              <Flame className="w-3.5 h-3.5 fill-neutral-950" />
              <span>ضَجّة في وجه الغلاء</span>
            </span>
            <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-white/95 text-neutral-900 font-bold text-xs shadow-xs whitespace-nowrap">
              ضمان الجودة 100%
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-amber-300 whitespace-nowrap">
            <span>تسوق التشكيلة الكاملة</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Main Content Info */}
        <div className="relative z-10 space-y-2 max-w-xl my-4">
          <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight group-hover:text-amber-300 transition-colors">
            عالم الموضة والأناقة بأسعار لا تُنافس
          </h3>
          <p className="text-xs sm:text-sm text-neutral-100/90 font-medium leading-relaxed">
            أفخم التشكيلات من ملابس نسائية، أطفال، ولادي، بناتي، أحذية، وحقائب مع توصيل سريع لجميع المحافظات اليمنية ودفع آمن عند الاستلام.
          </p>
        </div>

        {/* Value Highlights Footer */}
        <div className="relative z-10 pt-3 border-t border-white/15 flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs text-neutral-100">
          <div className="flex items-center gap-1 text-amber-300 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>معاينة وفحص قبل الدفع</span>
          </div>
          <span className="hidden sm:inline text-white/40">•</span>
          <div className="flex items-center gap-1 text-neutral-100">
            <Truck className="w-3.5 h-3.5 text-amber-300" />
            <span>توصيل فوري لباب المنزل</span>
          </div>
          <span className="hidden sm:inline text-white/40">•</span>
          <div className="flex items-center gap-1 text-neutral-100">
            <Coins className="w-3.5 h-3.5 text-amber-300" />
            <span>دفع بمحفظتك (جيب، الكريمي، جوالي)</span>
          </div>
        </div>
      </div>
    </section>
  );
});

FeaturedStores.displayName = 'FeaturedStores';

