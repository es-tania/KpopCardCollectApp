import { supabase } from "@/src/lib/supabase";
import { useCollectionStore } from "@/src/store/collectionStore";
import { useCallback, useEffect, useMemo, useState } from "react";

interface Filters {
  groupId?: string;
  albumId?: string;
  memberId?: string;
}

export const useUserStats = (filters: Filters) => {
  const [cardIds, setCardIds] = useState<Set<string>>(new Set());

  const { collectionIds, favoriteIds, wishlistIds } = useCollectionStore();

  const fetchIds = useCallback(async () => {
    if (!filters.groupId && !filters.albumId && !filters.memberId) return;

    let allIds: string[] = [];
    let from = 0;
    const batchSize = 1000;

    while (true) {
      let query;

      if (filters.memberId) {
        query = supabase
          .from("photocard_members")
          .select(
            "photocard_id, photocards!inner(id, status, album_id, group_id)",
          )
          .eq("member_id", filters.memberId)
          .eq("photocards.status", "approved");

        if (filters.albumId) {
          query = query.eq("photocards.album_id", filters.albumId);
        }
        if (filters.groupId) {
          query = query.eq("photocards.group_id", filters.groupId);
        }

        query = query.range(from, from + batchSize - 1);

        const { data } = await query;
        if (!data || data.length === 0) break;

        allIds = [...allIds, ...data.map((c: any) => c.photocard_id)];
        if (data.length < batchSize) break;
        from += batchSize;
      } else {
        // ── Cas sans memberId — requête directe sur photocards ────────────
        let q = supabase
          .from("photocards")
          .select("id")
          .eq("status", "approved")
          .range(from, from + batchSize - 1);

        if (filters.groupId) q = q.eq("group_id", filters.groupId);
        if (filters.albumId) q = q.eq("album_id", filters.albumId);

        const { data } = await q;
        if (!data || data.length === 0) break;

        allIds = [...allIds, ...data.map((c: any) => c.id)];
        if (data.length < batchSize) break;
        from += batchSize;
      }
    }

    setCardIds(new Set(allIds));
  }, [filters.groupId, filters.albumId, filters.memberId]);

  useEffect(() => {
    fetchIds();
  }, [fetchIds]);

  const stats = useMemo(() => {
    const ids = [...cardIds];
    const total = ids.length;
    const owned = ids.filter((id) => collectionIds.has(id)).length;
    const wished = ids.filter((id) => wishlistIds.has(id)).length;
    const favorited = ids.filter((id) => favoriteIds.has(id)).length;

    return {
      totalPhotocards: total,
      ownedPhotocards: owned,
      wishlistPhotocards: wished,
      favoritePhotocards: favorited,
      completionPercentage: total > 0 ? Math.round((owned / total) * 100) : 0,
    };
  }, [cardIds, collectionIds, wishlistIds, favoriteIds]);

  return stats;
};
