// utils/cache.ts
// Centralized caching strategy for weather data using localStorage

// Default cache expiry duration: 6 hours in milliseconds
const DEFAULT_CACHE_EXPIRY_MS = 6 * 60 * 60 * 1000;

/**
 * Builds a unique cache key for weather forecast data.
 *
 * @param lat - Latitude coordinate
 * @param lon - Longitude coordinate
 * @param start - Start date string (YYYY-MM-DD)
 * @param end - End date string (YYYY-MM-DD)
 * @param tz - Optional timezone identifier, defaults to "auto"
 * @returns A unique string key for caching purposes
 */
export const cacheKey = (
  lat: number,
  lon: number,
  start: string,
  end: string,
  tz?: string
): string => {
  return `wx:v3:${lat},${lon}:${start}..${end}:${tz ?? "auto"}`;
};

/**
 * Saves data to localStorage cache with timestamp and TTL.
 *
 * @param key - The cache key under which to save data
 * @param data - The data payload to cache
 * @param ttlMs - Time to live in milliseconds (default 6 hours)
 */
export function saveCache(
  key: string,
  data: unknown,
  ttlMs: number = DEFAULT_CACHE_EXPIRY_MS
): void {
  try {
    const payload = {
      ts: Date.now(),
      ttl: ttlMs,
      data,
    };
    localStorage.setItem(key, JSON.stringify(payload));
    console.log("✅ Saved to cache:", key, payload);
  } catch (error) {
    console.warn("⚠️ Failed to save cache:", error);
  }
}

/**
 * Loads data from localStorage cache if not expired.
 *
 * @param key - The cache key to look up
 * @returns The cached data of type T, or null if not found/expired/parse failure
 */
export function loadCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      console.log("ℹ️ No cache found for key:", key);
      return null;
    }
    const { ts, ttl, data } = JSON.parse(raw);
    if (Date.now() - ts < (ttl ?? DEFAULT_CACHE_EXPIRY_MS)) {
      console.log("✅ Cache hit:", key, data);
      return data as T;
    }
    console.log("⏳ Cache expired:", key);
    return null;
  } catch (error) {
    console.warn("⚠️ Failed to load cache or parse:", error);
    return null;
  }
}

/**
 * Clears cache entries from localStorage matching a specified prefix.
 *
 * @param prefix - Prefix string to identify cache keys to remove (default "wx:")
 */
export function clearCache(prefix: string = "wx:"): void {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
    console.log("🧹 Cleared cache with prefix:", prefix);
  } catch (error) {
    console.warn("⚠️ Failed to clear cache:", error);
  }
}
