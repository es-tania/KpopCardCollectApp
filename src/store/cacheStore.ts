import { create } from "zustand";

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

interface CacheState {
  cache: Record<string, CacheEntry<any>>;
  set: (key: string, data: any, ttlMs?: number) => void;
  get: <T>(key: string, ttlMs?: number) => T | null;
  invalidate: (key: string) => void;
  invalidateAll: (prefix: string) => void;
  clear: () => void;
}

// TTL par défaut : 5 minutes
const DEFAULT_TTL = 5 * 60 * 1000;

export const useCacheStore = create<CacheState>((set, get) => ({
  cache: {},

  set: (key, data, ttlMs = DEFAULT_TTL) => {
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: { data, fetchedAt: Date.now() },
      },
    }));
  },

  get: <T>(key: string, ttlMs = DEFAULT_TTL): T | null => {
    const entry = get().cache[key];
    if (!entry) return null;
    const isExpired = Date.now() - entry.fetchedAt > ttlMs;
    if (isExpired) {
      // Supprime l'entrée expirée
      set((state) => {
        const next = { ...state.cache };
        delete next[key];
        return { cache: next };
      });
      return null;
    }
    return entry.data as T;
  },

  invalidate: (key) => {
    set((state) => {
      const next = { ...state.cache };
      delete next[key];
      return { cache: next };
    });
  },

  invalidateAll: (prefix) => {
    set((state) => {
      const next = { ...state.cache };
      Object.keys(next)
        .filter((k) => k.startsWith(prefix))
        .forEach((k) => delete next[k]);
      return { cache: next };
    });
  },

  clear: () => set({ cache: {} }),
}));
