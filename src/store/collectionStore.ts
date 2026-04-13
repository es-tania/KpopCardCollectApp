import { collectionService } from "@/src/services/collectionService";
import { create } from "zustand";

interface CollectionState {
  collectionIds: Set<string>;
  favoriteIds: Set<string>;
  wishlistIds: Set<string>;
  loading: boolean;
  initialized: boolean;

  init: (userId: string) => Promise<void>;
  toggleCollection: (userId: string, photocardId: string) => Promise<void>;
  toggleFavorite: (userId: string, photocardId: string) => Promise<void>;
  toggleWishlist: (userId: string, photocardId: string) => Promise<void>;
  reset: () => void;
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
  collectionIds: new Set(),
  favoriteIds: new Set(),
  wishlistIds: new Set(),
  loading: false,
  initialized: false,

  // ── Init — charge une seule fois ──────────────────────────────────────
  init: async (userId: string) => {
    if (get().initialized) return;
    set({ loading: true });
    try {
      const [collection, favorites, wishlist] = await Promise.all([
        collectionService.getCollection(userId),
        collectionService.getFavorites(userId),
        collectionService.getWishlist(userId),
      ]);
      set({
        collectionIds: new Set(collection.map((c) => c.id)),
        favoriteIds: new Set(favorites.map((c) => c.id)),
        wishlistIds: new Set(wishlist.map((c) => c.id)),
        initialized: true,
      });
    } finally {
      set({ loading: false });
    }
  },

  // ── Toggles ───────────────────────────────────────────────────────────
  toggleCollection: async (userId, photocardId) => {
    const isIn = get().collectionIds.has(photocardId);

    // Optimistic update
    set((state) => {
      const next = new Set(state.collectionIds);
      isIn ? next.delete(photocardId) : next.add(photocardId);
      return { collectionIds: next };
    });

    try {
      if (isIn) {
        await collectionService.removeFromCollection(userId, photocardId);
      } else {
        await collectionService.addToCollection(userId, photocardId);
      }
    } catch {
      // Rollback
      set((state) => {
        const next = new Set(state.collectionIds);
        isIn ? next.add(photocardId) : next.delete(photocardId);
        return { collectionIds: next };
      });
    }
  },

  toggleFavorite: async (userId, photocardId) => {
    const isIn = get().favoriteIds.has(photocardId);

    set((state) => {
      const next = new Set(state.favoriteIds);
      isIn ? next.delete(photocardId) : next.add(photocardId);
      return { favoriteIds: next };
    });

    try {
      await collectionService.toggleFavorite(userId, photocardId, isIn);
    } catch {
      set((state) => {
        const next = new Set(state.favoriteIds);
        isIn ? next.add(photocardId) : next.delete(photocardId);
        return { favoriteIds: next };
      });
    }
  },

  toggleWishlist: async (userId, photocardId) => {
    const isIn = get().wishlistIds.has(photocardId);

    set((state) => {
      const next = new Set(state.wishlistIds);
      isIn ? next.delete(photocardId) : next.add(photocardId);
      return { wishlistIds: next };
    });

    try {
      await collectionService.toggleWishlist(userId, photocardId, isIn);
    } catch {
      set((state) => {
        const next = new Set(state.wishlistIds);
        isIn ? next.add(photocardId) : next.delete(photocardId);
        return { wishlistIds: next };
      });
    }
  },

  reset: () =>
    set({
      collectionIds: new Set(),
      favoriteIds: new Set(),
      wishlistIds: new Set(),
      initialized: false,
    }),
}));
