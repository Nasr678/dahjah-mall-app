import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { motion } from 'motion/react';
import { Tag, ArrowLeft, ArrowRight } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { BannerItem } from '../../types';
import { DEFAULT_BANNERS } from '../../data/mockData';
import { CachedImage } from '../common/CachedImage';

interface HeroCarouselProps {
  banners?: BannerItem[];
  onShopNow: (categoryId?: string) => void;
  onExploreOffers: () => void;
  onOpenAI: () => void;
  onSelectProduct?: (productId: string) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = memo(({ 
  banners: customBanners,
  onShopNow, 
  onExploreOffers,
  onSelectProduct,
}) => {
  const { appSettings } = useMarketplace();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Active banners from context or props or defaults
  const activeBanners: BannerItem[] = useMemo(() => {
    const list = customBanners || appSettings?.banners || DEFAULT_BANNERS;
    const filtered = list.filter((b) => b.isActive !== false);
    if (filtered.length === 0) return DEFAULT_BANNERS;
    return filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [customBanners, appSettings?.banners]);

  // Handle slide index bounds
  useEffect(() => {
    if (currentSlide >= activeBanners.length) {
      setCurrentSlide(0);
    }
  }, [activeBanners.length, currentSlide]);

  // Auto slide with Page Visibility check to preserve battery & CPU
  useEffect(() => {
    if (isPaused || activeBanners.length <= 1) return;

    let timer: NodeJS.Timeout | null = null;

    const startTimer = () => {
      if (!timer) {
        timer = setInterval(() => {
          if (document.hidden) return; // Battery saving
          setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
        }, 5000);
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
  }, [activeBanners.length, isPaused]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 40;

    if (distance > minSwipeDistance) {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    } else if (distance < -minSwipeDistance) {
      setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const currentBanner = activeBanners[currentSlide] || activeBanners[0];

  const handleBannerClick = () => {
    if (!currentBanner) return;
    if (currentBanner.linkType === 'category') {
      onShopNow(currentBanner.linkTarget || 'women');
    } else if (currentBanner.linkType === 'deals') {
      onExploreOffers();
    } else if (currentBanner.linkType === 'product' && onSelectProduct) {
      onSelectProduct(currentBanner.linkTarget);
    } else {
      onShopNow('women');
    }
  };

  const bannerImgSrc = currentBanner.imageUrl || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000&auto=format&fit=crop';

  return (
    <div 
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-neutral-200/90 shadow-[0_10px_30px_rgba(15,23,42,0.08)] group select-none touch-pan-y"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      id="main-hero-carousel"
    >
      {/* Responsive Editorial Hero Banner */}
      <div 
        onClick={handleBannerClick}
        className="relative w-full h-[155px] xs:h-[170px] sm:h-[205px] md:h-[235px] overflow-hidden cursor-pointer"
      >
        <motion.div
          key={currentBanner.id || currentSlide}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute inset-0 will-change-transform"
        >
          <CachedImage
            src={bannerImgSrc}
            alt={currentBanner.title}
            preset="banner"
            priority={true}
            containerClassName="w-full h-full"
            className="w-full h-full object-cover object-center"
          />

          {/* High-Contrast Editorial Gradient Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/35 to-neutral-950/15" />
          <div className="absolute inset-0 bg-gradient-to-l from-neutral-950/80 via-neutral-950/30 to-transparent" />

          {/* Slide Content Box */}
          <div className="absolute inset-0 flex items-center justify-between p-4 sm:p-7 z-10">
            <div className="flex flex-col items-end text-right max-w-[75%] sm:max-w-[60%] space-y-1.5">
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {currentBanner.discountPercentage ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-neutral-950 text-[10px] sm:text-xs font-black shadow-sm flex items-center gap-1 whitespace-nowrap">
                    <Tag className="w-3 h-3 stroke-[2.5]" />
                    <span>خصم {currentBanner.discountPercentage}%</span>
                  </span>
                ) : null}

                {currentBanner.badge ? (
                  <span className="px-2.5 py-0.5 rounded-md bg-white/90 text-neutral-900 text-[10px] font-bold shadow-sm whitespace-nowrap">
                    {currentBanner.badge}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-200 border border-amber-300/40 backdrop-blur-xs text-[10px] font-bold whitespace-nowrap">
                    ضَجّة في وجه الغلاء
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-xl md:text-2xl font-black text-white leading-tight drop-shadow-md line-clamp-1">
                {currentBanner.title}
              </h2>

              {(currentBanner.subtitle || currentBanner.description) && (
                <p className="text-[11px] sm:text-xs md:text-sm text-neutral-100/90 font-medium line-clamp-1">
                  {currentBanner.subtitle || currentBanner.description}
                </p>
              )}

              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400 text-neutral-950 text-[11px] sm:text-xs font-black shadow-md hover:bg-amber-300 transition-colors whitespace-nowrap">
                  <span>{currentBanner.ctaText || 'تسوق الآن'}</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Slide Navigation Arrows (Desktop Only) */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
            }}
            className="absolute top-1/2 -translate-y-1/2 right-3 p-2 rounded-full bg-white/95 border border-neutral-200 text-neutral-900 hover:bg-amber-400 hover:border-amber-400 opacity-0 group-hover:opacity-100 transition-all hidden sm:flex items-center justify-center cursor-pointer shadow-lg z-20"
            aria-label="السابق"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
            }}
            className="absolute top-1/2 -translate-y-1/2 left-3 p-2 rounded-full bg-white/95 border border-neutral-200 text-neutral-900 hover:bg-amber-400 hover:border-amber-400 opacity-0 group-hover:opacity-100 transition-all hidden sm:flex items-center justify-center cursor-pointer shadow-lg z-20"
            aria-label="التالي"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Indicator Dots */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-2.5 left-3 sm:bottom-3 sm:left-4 flex items-center gap-1.5 z-20 bg-neutral-950/35 backdrop-blur-xs px-2 py-1 rounded-full">
          {activeBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === idx ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/60 hover:bg-white'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
});

HeroCarousel.displayName = 'HeroCarousel';
