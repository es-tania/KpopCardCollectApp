import { supabase } from "@/src/lib/supabase";
import { mapPhotocard } from "@/src/services/photocardsService";
import { useAuthStore } from "@/src/store/authStore";
import { useCollectionStore } from "@/src/store/collectionStore";
import { useDeletedCardsStore } from "@/src/store/deletedCardsStore";
import { CardMode, PhotocardWithDetails } from "@/src/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const TABLE_MAP: Record<CardMode, string> = {
  collection: "user_collection",
  favorites: "user_favorites",
  wishlist: "user_wishlist",
};

const PAGE_SIZE = 30;

export const useMyCards = (mode: CardMode, groupId?: string) => {
  const { user } = useAuthStore();
  const { collectionIds, favoriteIds, wishlistIds } = useCollectionStore();
  const deletedIds = useDeletedCardsStore((s) => s.deletedIds);

  const [rawCards, setRawCards] = useState<PhotocardWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);

  const fetchPage = useCallback(
    async (reset: boolean) => {
      if (!user) return;
      const offset = reset ? 0 : offsetRef.current;
      reset ? setLoading(true) : setLoadingMore(true);
      try {
        const { data, error } = await supabase.rpc("get_my_cards", {
          p_user_id: user.id,
          p_mode: mode,
          p_group_id: groupId ?? null,
          p_limit: PAGE_SIZE,
          p_offset: offset,
        });
        if (error) throw error;

        const mapped = (data ?? []).map(mapPhotocard);

        if (reset) {
          setRawCards(mapped);
          offsetRef.current = PAGE_SIZE;
        } else {
          setRawCards((prev) => [...prev, ...mapped]);
          offsetRef.current = offset + PAGE_SIZE;
        }
        setHasMore(mapped.length === PAGE_SIZE);
      } catch (err: any) {
        console.error("useMyCards:", err.message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [user, mode, groupId],
  );

  useEffect(() => {
    offsetRef.current = 0;
    setRawCards([]);
    setHasMore(true);
    fetchPage(true);
  }, [mode, groupId]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    fetchPage(false);
  }, [hasMore, loadingMore, loading, fetchPage]);

  // ── Enrichit depuis le store — toujours à jour sans refetch ──────────
  const cards = useMemo(
    () =>
      rawCards
        .filter((c) => {
          if (deletedIds.has(c.id)) return false;

          // ── Retire la carte si elle n'appartient plus au mode actif ──
          switch (mode) {
            case "collection":
              return collectionIds.has(c.id);
            case "favorites":
              return favoriteIds.has(c.id);
            case "wishlist":
              return wishlistIds.has(c.id);
            default:
              return true;
          }
        })
        .map((c) => ({
          ...c,
          isInCollection: collectionIds.has(c.id),
          isFavorite: favoriteIds.has(c.id),
          isWishlisted: wishlistIds.has(c.id),
        })),
    [rawCards, mode, collectionIds, favoriteIds, wishlistIds, deletedIds],
  );

  return { cards, loading, loadingMore, hasMore, loadMore };
};
