import React, { useState, useEffect, useRef, memo } from 'react';
import { getOptimizedImageUrl, getOptimizedImageSrcSet, ImageSizePreset } from '../../utils/imageOptimizer';
import { ShoppingBag } from 'lucide-react';

// In-memory cache of fully loaded image URLs to guarantee 0ms flash-free re-renders
const memoryImageCache = new Set<string>();

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | undefined | null;
  alt: string;
  preset?: ImageSizePreset;
  fallbackText?: string;
  className?: string;
  containerClassName?: string;
  aspectRatioClassName?: string;
  priority?: boolean;
}

export const CachedImage: React.FC<CachedImageProps> = memo(({
  src,
  alt,
  preset = 'card',
  fallbackText = 'ضَجّة مول',
  className = '',
  containerClassName = '',
  aspectRatioClassName = '',
  priority = false,
  onLoad,
  onError,
  ...restProps
}) => {
  const optimizedSrc = getOptimizedImageUrl(src, preset);
  const optimizedSrcSet = getOptimizedImageSrcSet(src, preset);

  // Instant cache hit check
  const isPrecached = Boolean(optimizedSrc && memoryImageCache.has(optimizedSrc));
  const [isLoaded, setIsLoaded] = useState<boolean>(isPrecached);
  const [hasError, setHasError] = useState<boolean>(!src);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!optimizedSrc) {
      setHasError(true);
      return;
    }

    if (memoryImageCache.has(optimizedSrc)) {
      setIsLoaded(true);
      setHasError(false);
      return;
    }

    // Check if the image element already completed before hook ran
    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalWidth > 0) {
        memoryImageCache.add(optimizedSrc);
        setIsLoaded(true);
        setHasError(false);
      } else {
        setHasError(true);
      }
    }

    // Background browser CacheStorage warm-up for persistent offline capability
    if (typeof window !== 'undefined' && 'caches' in window && optimizedSrc.startsWith('http')) {
      try {
        window.caches.open('dajjah-image-cache-v1').then((cache) => {
          cache.match(optimizedSrc).then((matched) => {
            if (!matched) {
              fetch(optimizedSrc, { mode: 'no-cors' })
                .then((res) => {
                  if (res) cache.put(optimizedSrc, res);
                })
                .catch(() => {});
            }
          }).catch(() => {});
        }).catch(() => {});
      } catch {
        // Safe fallback for environments with restricted CacheStorage
      }
    }
  }, [optimizedSrc]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (optimizedSrc) {
      memoryImageCache.add(optimizedSrc);
    }
    setIsLoaded(true);
    setHasError(false);
    if (onLoad) onLoad(e);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    setIsLoaded(false);
    if (onError) onError(e);
  };

  return (
    <div className={`relative overflow-hidden ${aspectRatioClassName} ${containerClassName}`}>
      {/* 60fps Shimmer Skeleton while image is loading */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 shimmer-wave bg-neutral-900 z-0 pointer-events-none" 
          aria-hidden="true"
        />
      )}

      {/* Fallback Placeholder when image fails to load */}
      {hasError ? (
        <div 
          className="absolute inset-0 bg-neutral-950 border border-neutral-850 flex flex-col items-center justify-center p-3 text-center select-none"
          role="img"
          aria-label={alt || fallbackText}
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-1.5 shadow-sm">
            <span className="font-cairo font-black text-lg sm:text-xl">ض</span>
          </div>
          <span className="text-[11px] sm:text-xs font-black text-neutral-300 truncate max-w-[90%]">
            {fallbackText}
          </span>
          <div className="flex items-center gap-1 text-[9px] text-amber-400/80 mt-0.5">
            <ShoppingBag className="w-2.5 h-2.5" />
            <span>ضَجّة في وجه الغلاء</span>
          </div>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={optimizedSrc}
          srcSet={optimizedSrcSet || undefined}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleImageLoad}
          onError={handleImageError}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          {...restProps}
        />
      )}
    </div>
  );
});

CachedImage.displayName = 'CachedImage';
