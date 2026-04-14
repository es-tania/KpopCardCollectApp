import { useCacheStore } from "@/src/store/cacheStore";
import { useCallback } from "react";

export const useCache = () => {
  const { get, set, invalidate, invalidateAll } = useCacheStore();

  // Fetch avec cache — si les données sont en cache, les retourne
  // sinon fetch et met en cache
  const fetchWithCache = useCallback(
    async <T>(
      key: string,
      fetcher: () => Promise<T>,
      ttlMs?: number,
    ): Promise<T> => {
      const cached = get<T>(key, ttlMs);
      if (cached !== null) {
        console.log(`✅ CACHE HIT  — ${key}`);
        return cached;
      }
      console.log(`🌐 CACHE MISS — ${key}`);
      const data = await fetcher();
      set(key, data, ttlMs);
      console.log(
        `💾 CACHE SET  — ${key} (${Array.isArray(data) ? data.length + " items" : "1 item"})`,
      );

      return data;
    },
    [get, set],
  );

  return { fetchWithCache, invalidate, invalidateAll };
};
