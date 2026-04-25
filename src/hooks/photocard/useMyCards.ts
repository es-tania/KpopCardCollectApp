import { supabase } from "@/src/lib/supabase";
import { mapPhotocard } from "@/src/services/photocardsService";
import { useAuthStore } from "@/src/store/authStore";
import { useCollectionStore } from "@/src/store/collectionStore";
import { useDeletedCardsStore } from "@/src/store/deletedCardsStore";
import { CardMode, PhotocardWithDetails } from "@/src/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFetchOnFocus } from "../useFetchOnFocus";

const TABLE_MAP: Record<CardMode, string> = {
  collection: "user_collection",
  favorites: "user_favorites",
  wishlist: "user_wishlist",
};

export const useMyCards = (mode: CardMode) => {
  const { user } = useAuthStore();
  const { collectionIds, favoriteIds, wishlistIds } = useCollectionStore();
  const deletedIds = useDeletedCardsStore((s) => s.deletedIds);

  const [rawCards, setRawCards] = useState<PhotocardWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(TABLE_MAP[mode])
        .select("photocard_id, photocards_with_details (*)")
        .eq("user_id", user.id);

      if (error) throw error;

      setRawCards(
        (data ?? [])
          .map((d: any) => d.photocards_with_details)
          .filter(Boolean)
          .map(mapPhotocard),
      );
    } catch (err: any) {
      console.error("useMyCards:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user, mode]);

  useEffect(() => {
    fetch();
  }, [fetch]);
  useFetchOnFocus(fetch);

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

  return { cards, loading, refetch: fetch };
};
