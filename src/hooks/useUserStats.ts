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

    let query = supabase
      .from("photocards")
      .select("id")
      .eq("status", "approved");

    if (filters.groupId) query = query.eq("group_id", filters.groupId);
    if (filters.albumId) query = query.eq("album_id", filters.albumId);
    if (filters.memberId) query = query.eq("member_id", filters.memberId);

    const { data } = await query;
    setCardIds(new Set((data ?? []).map((c: any) => c.id)));
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
