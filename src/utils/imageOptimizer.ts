/**
 * Ultra-Fast & Lightweight Image Optimization Helper for ضَجّة مول
 * Optimizes Unsplash, Cloudinary, Pexels, Google, and external images with smart resolution, webp formatting, and compression.
 */

export type ImageSizePreset = 'thumb' | 'card' | 'banner' | 'full';

const PRESET_CONFIG: Record<ImageSizePreset, { width: number; quality: number }> = {
  thumb: { width: 120, quality: 65 },
  card: { width: 280, quality: 70 },
  banner: { width: 720, quality: 75 },
  full: { width: 1080, quality: 80 },
};

// High-performance LRU-like memory map to eliminate regex/URL parsing on repeated renders
const urlCache = new Map<string, string>();
const srcSetCache = new Map<string, string>();
const MAX_CACHE_SIZE = 250;

export function getOptimizedImageUrl(
  url: string | undefined | null,
  preset: ImageSizePreset = 'card'
): string {
  if (!url || typeof url !== 'string') {
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=70&w=280&auto=format&fit=crop';
  }

  // Fast memory lookup
  const cacheKey = `${url}_${preset}`;
  const cached = urlCache.get(cacheKey);
  if (cached) return cached;

  const { width, quality } = PRESET_CONFIG[preset];
  let optimized = url;

  // 1. Optimize Unsplash images with target width, auto webp format, and quality compression
  if (url.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('fit', 'crop');
      urlObj.searchParams.set('w', String(width));
      urlObj.searchParams.set('q', String(quality));
      optimized = urlObj.toString();
    } catch {
      optimized = url.replace(/w=\d+/, `w=${width}`);
    }
  }
  // 2. Optimize Cloudinary images
  else if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    const transformation = `f_auto,q_auto:eco,w_${width},c_limit`;
    optimized = url.replace('/upload/', `/upload/${transformation}/`);
  }
  // 3. Optimize Pexels images
  else if (url.includes('pexels.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('auto', 'compress');
      urlObj.searchParams.set('cs', 'tinysrgb');
      urlObj.searchParams.set('w', String(width));
      optimized = urlObj.toString();
    } catch {
      optimized = url;
    }
  }
  // 4. Optimize Google user avatar images
  else if (url.includes('googleusercontent.com')) {
    optimized = url.replace(/=s\d+(-c)?/, `=s${width}-c`);
  }

  if (urlCache.size >= MAX_CACHE_SIZE) {
    urlCache.clear();
  }
  urlCache.set(cacheKey, optimized);

  return optimized;
}

/**
 * Generate standard responsive srcSet for high-DPI screens without downloading bloated images
 */
export function getOptimizedImageSrcSet(
  url: string | undefined | null,
  preset: ImageSizePreset = 'card'
): string {
  if (!url || typeof url !== 'string' || !url.includes('images.unsplash.com')) {
    return '';
  }

  const cacheKey = `srcset_${url}_${preset}`;
  const cached = srcSetCache.get(cacheKey);
  if (cached) return cached;

  const { width, quality } = PRESET_CONFIG[preset];
  const url1x = getOptimizedImageUrl(url, preset);
  
  let srcset = `${url1x} 1x`;
  try {
    const url2xObj = new URL(url);
    url2xObj.searchParams.set('auto', 'format');
    url2xObj.searchParams.set('fit', 'crop');
    url2xObj.searchParams.set('w', String(Math.min(width * 2, 800)));
    url2xObj.searchParams.set('q', String(Math.max(quality - 10, 55)));
    srcset = `${url1x} 1x, ${url2xObj.toString()} 2x`;
  } catch {
    srcset = `${url1x} 1x`;
  }

  if (srcSetCache.size >= MAX_CACHE_SIZE) {
    srcSetCache.clear();
  }
  srcSetCache.set(cacheKey, srcset);

  return srcset;
}

