import { collectionService } from "@/src/services/collectionService";
import { useAuthStore } from "@/src/store/authStore";
import { useCallback, useState } from "react";
import { useFetchOnFocus } from "./useFetchOnFocus";

export const useUserCollection = () => {
  const { user } = useAuthStore();

  const [collectionIds, setCollectionIds] = useState<Set<string>>(new Set());
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [collection, favorites, wishlist] = await Promise.all([
        collectionService.getCollection(user.id),
        collectionService.getFavorites(user.id),
        collectionService.getWishlist(user.id),
      ]);

      setCollectionIds(new Set(collection.map((c) => c.id)));
      setFavoriteIds(new Set(favorites.map((c) => c.id)));
      setWishlistIds(new Set(wishlist.map((c) => c.id)));
    } catch (err: any) {
      console.error("useUserCollection error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFetchOnFocus(fetch);

  // ── Toggles ──────────────────────────────────────────────────────────

  const toggleCollection = useCallback(
    async (photocardId: string) => {
      if (!user) return;
      const isIn = collectionIds.has(photocardId);

      // Optimistic update
      setCollectionIds((prev) => {
        const next = new Set(prev);
        isIn ? next.delete(photocardId) : next.add(photocardId);
        return next;
      });

      try {
        if (isIn) {
          await collectionService.removeFromCollection(user.id, photocardId);
        } else {
          await collectionService.addToCollection(user.id, photocardId);
        }
      } catch (err: any) {
        // Rollback
        setCollectionIds((prev) => {
          const next = new Set(prev);
          isIn ? next.add(photocardId) : next.delete(photocardId);
          return next;
        });
      }
    },
    [user, collectionIds],
  );

  const toggleFavorite = useCallback(
    async (photocardId: string) => {
      if (!user) return;
      const isIn = favoriteIds.has(photocardId);

      setFavoriteIds((prev) => {
        const next = new Set(prev);
        isIn ? next.delete(photocardId) : next.add(photocardId);
        return next;
      });

      try {
        await collectionService.toggleFavorite(user.id, photocardId, isIn);
      } catch {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          isIn ? next.add(photocardId) : next.delete(photocardId);
          return next;
        });
      }
    },
    [user, favoriteIds],
  );

  const toggleWishlist = useCallback(
    async (photocardId: string) => {
      if (!user) return;
      const isIn = wishlistIds.has(photocardId);

      setWishlistIds((prev) => {
        const next = new Set(prev);
        isIn ? next.delete(photocardId) : next.add(photocardId);
        return next;
      });

      try {
        await collectionService.toggleWishlist(user.id, photocardId, isIn);
      } catch {
        setWishlistIds((prev) => {
          const next = new Set(prev);
          isIn ? next.add(photocardId) : next.delete(photocardId);
          return next;
        });
      }
    },
    [user, wishlistIds],
  );

  return {
    collectionIds,
    favoriteIds,
    wishlistIds,
    loading,
    refetch: fetch,
    toggleCollection,
    toggleFavorite,
    toggleWishlist,
  };
};
