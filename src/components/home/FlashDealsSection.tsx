import React, { useState, useEffect, useMemo, memo } from 'react';
import { Product, CurrencyCode } from '../../types';
import { ProductCard } from '../products/ProductCard';
import { Flame, Clock, ChevronLeft } from 'lucide-react';
import { ProductGridSkeleton } from '../common/ProductSkeleton';

function getSecondsUntilYemenMidnight(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const yemenTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const secondsPassed =
    yemenTime.getUTCHours() * 3600 +
    yemenTime.getUTCMinutes() * 60 +
    yemenTime.getUTCSeconds();
  const remaining = Math.max(60, 86400 - secondsPassed);
  return {
    hours: Math.floor(remaining / 3600),
    minutes: Math.floor((remaining % 3600) / 60),
    seconds: remaining % 60,
  };
}

const FlashCountdownTimer: React.FC = memo(() => {
  const [timeLeft, setTimeLeft] = useState(getSecondsUntilYemenMidnight);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const startTimer = () => {
      if (!timer) {
        timer = setInterval(() => {
          if (document.hidden) return; // Save CPU when tab is hidden
          setTimeLeft(getSecondsUntilYemenMidnight());
        }, 1000);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      } else {
        startTimer();
      }
    };

    startTimer();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="flex items-center justify-between sm:justify-start gap-2 bg-[#F6F7F9] border border-neutral-200/90 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl w-full sm:w-auto">
      <div className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
        <span className="text-[11px] sm:text-xs font-bold text-neutral-600">ينتهي خلال:</span>
      </div>
      <div className="flex items-center gap-1 font-mono tabular-nums text-xs sm:text-sm font-black text-neutral-900">
        <span className="bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border border-neutral-200 shadow-2xs">
          {String(timeLeft.hours).padStart(2, '0')}
        </span>
        <span className="text-neutral-400">:</span>
        <span className="bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border border-neutral-200 shadow-2xs">
          {String(timeLeft.minutes).padStart(2, '0')}
        </span>
        <span className="text-neutral-400">:</span>
        <span className="bg-rose-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border border-rose-200 text-rose-600 shadow-2xs">
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
});

FlashCountdownTimer.displayName = 'FlashCountdownTimer';

interface FlashDealsSectionProps {
  products: Product[];
  currency: CurrencyCode;
  wishlist: string[];
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onViewAllOffers?: () => void;
  onViewAll?: () => void;
}

export const FlashDealsSection: React.FC<FlashDealsSectionProps> = memo(({
  products,
  currency,
  wishlist,
  onToggleFavorite,
  onAddToCart,
  onSelectProduct,
  onViewAllOffers,
  onViewAll,
}) => {
  const flashProducts = useMemo(() => {
    return products
      .filter((p) => p.isFlashDeal || (p.discountPercentage && p.discountPercentage >= 40))
      .slice(0, 4);
  }, [products]);

  const wishlistSet = useMemo(() => new Set(wishlist), [wishlist]);

  if (products.length === 0) {
    return (
      <div className="w-full bg-white border border-neutral-200/80 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="h-6 w-36 rounded-xl shimmer-wave" />
          <div className="h-6 w-28 rounded-xl shimmer-wave" />
        </div>
        <ProductGridSkeleton count={4} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4" />
      </div>
    );
  }

  if (flashProducts.length === 0) return null;

  const handleViewAll = onViewAll || onViewAllOffers;

  return (
    <div className="w-full bg-white border border-amber-300/60 rounded-3xl p-3.5 sm:p-6 md:p-8 shadow-[0_8px_28px_rgba(15,23,42,0.05)] relative overflow-hidden">
      {/* Header Row with Countdown */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-neutral-200/80">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-md shadow-rose-500/20 flex-shrink-0">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-2xl font-black text-neutral-900">عروض ضَجّة الكبرى</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] sm:text-xs font-black">
                خصم حتى 70%
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">
              صفقات فلاش محدودة بأسعار استثنائية (ضَجّة في وجه الغلاء)
            </p>
          </div>
        </div>

        {/* Live Countdown Box (Isolated Component) */}
        <FlashCountdownTimer />
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 relative z-10">
        {flashProducts.map((product) => (
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

      {/* Footer Banner CTA */}
      {handleViewAll && (
        <div className="mt-6 pt-4 border-t border-neutral-200/80 flex items-center justify-between">
          <span className="text-xs text-neutral-500 hidden sm:inline">
            جميع العروض تخضع لضمان الجودة والاستبدال الفوري من ضَجّة مول
          </span>
          <button
            type="button"
            onClick={handleViewAll}
            className="mr-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-400 border border-amber-300/80 text-amber-900 hover:text-neutral-950 text-xs font-bold transition-all cursor-pointer"
          >
            <span>تصفح جميع عروض الفلاش</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
});

FlashDealsSection.displayName = 'FlashDealsSection';

