import React, { memo } from 'react';

/**
 * High-Performance Shimmer Skeletons for DAHJAH MALL
 * Runs with 60fps GPU acceleration (translateX) to avoid layout thrashing on Android phones.
 */

export const ProductCardSkeleton: React.FC = memo(() => {
  return (
    <div 
      className="flex flex-col justify-between bg-neutral-900/90 border border-neutral-800/80 rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Image Skeleton */}
      <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full rounded-2xl overflow-hidden shimmer-wave mb-2.5 sm:mb-3">
        {/* Top-Right Badge placeholder */}
        <div className="absolute top-2 right-2 w-10 h-4 rounded-full bg-neutral-800/80" />
        {/* Top-Left Wishlist heart placeholder */}
        <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-neutral-800/80" />
      </div>

      {/* Info Skeletons */}
      <div className="flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-1.5">
          {/* Title line 1 */}
          <div className="h-3.5 w-4/5 rounded-md shimmer-wave" />
          {/* Title line 2 */}
          <div className="h-3 w-3/5 rounded-md shimmer-wave" />

          {/* Rating stars placeholder */}
          <div className="flex items-center gap-1 pt-1">
            <div className="h-3 w-8 rounded-md shimmer-wave" />
            <div className="h-2.5 w-6 rounded-md shimmer-wave" />
          </div>
        </div>

        {/* Price & Button Footer */}
        <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between gap-2 mt-auto">
          <div className="space-y-1 min-w-0">
            <div className="h-4 w-16 rounded-md shimmer-wave" />
            <div className="h-2.5 w-10 rounded-md shimmer-wave" />
          </div>

          <div className="w-8 h-8 sm:w-16 sm:h-8 rounded-xl shimmer-wave flex-shrink-0" />
        </div>
      </div>
    </div>
  );
});

ProductCardSkeleton.displayName = 'ProductCardSkeleton';

interface ProductGridSkeletonProps {
  count?: number;
  className?: string;
}

export const ProductGridSkeleton: React.FC<ProductGridSkeletonProps> = memo(({
  count = 6,
  className = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4',
}) => {
  return (
    <div className={className} aria-busy="true" aria-label="جاري التحميل...">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={`product-skel-${index}`} />
      ))}
    </div>
  );
});

ProductGridSkeleton.displayName = 'ProductGridSkeleton';

export const CategorySliderSkeleton: React.FC = memo(() => {
  return (
    <div className="w-full space-y-4" aria-busy="true" aria-label="جاري تحميل الأقسام...">
      <div className="flex items-center justify-between">
        <div className="h-5 w-36 rounded-lg shimmer-wave" />
        <div className="h-4 w-16 rounded-md shimmer-wave" />
      </div>
      <div className="flex gap-2.5 sm:gap-4 overflow-hidden pb-3 pt-1 -mx-3 px-3 sm:mx-0 sm:px-0">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={`cat-skel-${idx}`}
            className="flex-shrink-0 flex flex-col items-center p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl border border-neutral-800 bg-neutral-900/60 w-[84px] sm:w-28 space-y-2 select-none"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl shimmer-wave" />
            <div className="h-3 w-12 rounded-md shimmer-wave" />
            <div className="h-2.5 w-8 rounded-md shimmer-wave" />
          </div>
        ))}
      </div>
    </div>
  );
});

CategorySliderSkeleton.displayName = 'CategorySliderSkeleton';

export const SectionSkeleton: React.FC = memo(() => {
  return (
    <div className="w-full space-y-4 py-4" aria-busy="true">
      <div className="flex items-center justify-between">
        <div className="h-6 w-44 rounded-xl shimmer-wave" />
        <div className="h-4 w-20 rounded-lg shimmer-wave" />
      </div>
      <ProductGridSkeleton count={4} />
    </div>
  );
});

SectionSkeleton.displayName = 'SectionSkeleton';

export const ProfileSkeleton: React.FC = memo(() => {
  return (
    <div className="w-full max-w-lg mx-auto space-y-4 pb-20 px-3 sm:px-4 select-none" aria-busy="true">
      <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full shimmer-wave" />
          <div className="space-y-1.5">
            <div className="h-4 w-28 rounded shimmer-wave" />
            <div className="h-3 w-36 rounded shimmer-wave" />
          </div>
        </div>
        <div className="w-8 h-8 rounded-xl shimmer-wave" />
      </div>
      <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-neutral-900 border border-neutral-800">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 py-1">
            <div className="h-4 w-8 rounded shimmer-wave" />
            <div className="h-3 w-12 rounded shimmer-wave" />
          </div>
        ))}
      </div>
      <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
        <div className="h-4 w-24 rounded shimmer-wave" />
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 rounded-xl shimmer-wave" />
          ))}
        </div>
      </div>
    </div>
  );
});

ProfileSkeleton.displayName = 'ProfileSkeleton';
