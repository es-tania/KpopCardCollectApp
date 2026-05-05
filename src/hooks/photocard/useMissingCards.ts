// src/hooks/photocard/useMissingCards.ts
import { supabase } from "@/src/lib/supabase";
import { mapPhotocard } from "@/src/services/photocardsService";
import { useAuthStore } from "@/src/store/authStore";
import { useCollectionStore } from "@/src/store/collectionStore";
import { useDeletedCardsStore } from "@/src/store/deletedCardsStore";
import { PhotocardWithDetails } from "@/src/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFetchOnFocus } from "../useFetchOnFocus";

export const useMissingCards = () => {
  const { user } = useAuthStore();
  const { collectionIds, favoriteIds, wishlistIds } = useCollectionStore();
  const deletedIds = useDeletedCardsStore((s) => s.deletedIds);
  const [rawCards, setRawCards] = useState<PhotocardWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let allCards: PhotocardWithDetails[] = [];
      let from = 0;

      while (true) {
        const { data, error } = await supabase
          .rpc("get_missing_photocards", { p_user_id: user.id })
          .range(from, from + 999);

        if (error) throw error;
        if (!data?.length) break;

        allCards = [...allCards, ...data.map(mapPhotocard)];
        if (data.length < 1000) break;
        from += 1000;
      }

      setRawCards(allCards);
    } catch (err: any) {
      console.error("useMissingCards:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetch();
  }, [fetch]);
  useFetchOnFocus(fetch);

  const cards = useMemo(
    () =>
      rawCards
        .filter((c) => !deletedIds.has(c.id) && !collectionIds.has(c.id))
        .map((c) => ({
          ...c,
          isInCollection: false,
          isFavorite: favoriteIds.has(c.id),
          isWishlisted: wishlistIds.has(c.id),
        })),
    [rawCards, collectionIds, favoriteIds, wishlistIds, deletedIds],
  );

  return { cards, loading, refetch: fetch };
};
