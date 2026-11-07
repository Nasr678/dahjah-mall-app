import React, { useState, useEffect, useMemo, memo } from 'react';
import { Product, CurrencyCode } from '../../types';
import { ProductCard } from '../products/ProductCard';
import { Flame, Clock, ChevronLeft } from 'lucide-react';
import { ProductGridSkeleton } from '../common/ProductSkeleton';

const FlashCountdownTimer: React.FC = memo(() => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    const startTimer = () => {
      if (!timer) {
        timer = setInterval(() => {
          if (document.hidden) return; // Save CPU when tab is hidden
          setTimeLeft((prev) => {
            if (prev.seconds > 0) {
              return { ...prev, seconds: prev.seconds - 1 };
            } else if (prev.minutes > 0) {
              return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
            } else if (prev.hours > 0) {
              return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
            }
            return prev;
          });
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
    <div className="flex items-center justify-between sm:justify-start gap-2 bg-neutral-950/90 border border-neutral-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl w-full sm:w-auto">
      <div className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
        <span className="text-[11px] sm:text-xs font-bold text-neutral-400">ينتهي خلال:</span>
      </div>
      <div className="flex items-center gap-1 font-mono text-xs sm:text-sm font-black text-amber-400">
        <span className="bg-neutral-900 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border border-neutral-800">
          {String(timeLeft.hours).padStart(2, '0')}
        </span>
        <span>:</span>
        <span className="bg-neutral-900 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border border-neutral-800">
          {String(timeLeft.minutes).padStart(2, '0')}
        </span>
        <span>:</span>
        <span className="bg-neutral-900 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border border-neutral-800 text-rose-400">
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
      <div className="w-full bg-neutral-900/60 border border-neutral-800 rounded-3xl p-4 sm:p-6 space-y-4">
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
    <div className="w-full bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-purple-950/20 border border-amber-500/20 rounded-3xl p-3.5 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

      {/* Header Row with Countdown */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-lg shadow-rose-600/30 animate-pulse flex-shrink-0">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-2xl font-black text-white">عروض ضَجّة الكبرى</h3>
              <span className="px-2 py-0.5 rounded-full bg-rose-600/30 border border-rose-500/40 text-rose-300 text-[10px] sm:text-xs font-black">
                خصم حتى 70%
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">
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
        <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between">
          <span className="text-xs text-neutral-400 hidden sm:inline">
            جميع العروض تخضع لضمان الجودة والاستبدال الفوري من ضَجّة مول
          </span>
          <button
            type="button"
            onClick={handleViewAll}
            className="mr-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500 border border-amber-500/40 text-amber-300 hover:text-neutral-950 text-xs font-bold transition-all"
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

