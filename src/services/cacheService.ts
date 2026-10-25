/**
 * Ultra-Fast Stale-While-Revalidate Memory & LocalStorage Cache for ضَجّة مول
 * Enables 0ms immediate startup, offline survival, and eliminates redundant network fetches.
 */

interface CacheEnvelope<T> {
  timestamp: number;
  data: T;
  version: number;
}

const CURRENT_CACHE_VERSION = 3;
const memoryStore = new Map<string, CacheEnvelope<any>>();

export const CacheKeys = {
  PRODUCTS: 'dajjah_cache_products_v3',
  CATEGORIES: 'dajjah_cache_categories_v3',
  BRANDS: 'dajjah_cache_brands_v3',
  SETTINGS: 'dajjah_cache_settings_v3',
  RATES: 'dajjah_cache_rates_v3',
  USER_DATA: 'dajjah_cache_user_v3',
} as const;

export const cacheService = {
  /**
   * Retrieves data from memory (0ms) or localStorage instantly.
   * In Stale-While-Revalidate mode, it returns the cached data immediately even if stale,
   * so the app shell and views render with zero delay while fresh data loads in the background.
   */
  get<T>(key: string, maxAgeMs?: number): T | null {
    // 1. Fast path: Memory Cache
    if (memoryStore.has(key)) {
      const cached = memoryStore.get(key) as CacheEnvelope<T>;
      if (cached) {
        if (!maxAgeMs || Date.now() - cached.timestamp < maxAgeMs) {
          return cached.data;
        }
        // Still return stale data to avoid white screens
        return cached.data;
      }
    }

    // 2. LocalStorage Cache
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed: CacheEnvelope<T> = JSON.parse(raw);
      if (parsed && (parsed.version === CURRENT_CACHE_VERSION || parsed.data)) {
        // Sync to memory cache for subsequent 0ms reads
        memoryStore.set(key, parsed);
        return parsed.data;
      }
    } catch {
      // Ignore JSON parse errors or quota issues
    }

    return null;
  },

  /**
   * Check if cache is stale
   */
  isStale(key: string, maxAgeMs: number = 1000 * 60 * 15): boolean {
    if (memoryStore.has(key)) {
      const cached = memoryStore.get(key);
      if (cached) return Date.now() - cached.timestamp > maxAgeMs;
    }
    return true;
  },

  /**
   * Saves data to both memory and localStorage with timestamp.
   */
  set<T>(key: string, data: T): void {
    const envelope: CacheEnvelope<T> = {
      timestamp: Date.now(),
      data,
      version: CURRENT_CACHE_VERSION,
    };

    memoryStore.set(key, envelope);

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, JSON.stringify(envelope));
      }
    } catch {
      // Storage quota or privacy mode fallback
    }
  },

  /**
   * Clear specific key or all caches
   */
  remove(key: string): void {
    memoryStore.delete(key);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch {}
  },
};

