import { supabase } from "@/src/lib/supabase";
import { mapPhotocard } from "@/src/services/photocardsService";
import { PhotocardWithDetails } from "@/src/types";
import { useCallback, useEffect, useState } from "react";

interface Filters {
  groupId?: string | null;
  albumId?: string | null;
  memberId?: string | null;
  query?: string;
  allowedGroupIds?: string[];
}

interface UseFilteredPhotocardsResult {
  photocards: PhotocardWithDetails[];
  loading: boolean;
  total: number;
  refetch: () => Promise<void>;
  removeById: (id: string) => void;
}

export const useFilteredPhotocards = (
  filters: Filters,
): UseFilteredPhotocardsResult => {
  const [photocards, setPhotocards] = useState<PhotocardWithDetails[]>([]);
  const [loading, setLoading] = useState(false);

  const { groupId, albumId, memberId, query = "", allowedGroupIds } = filters;

  const hasFilters = !!(groupId || albumId || memberId || query.trim());

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      let dbQuery = supabase
        .from("photocards_with_details")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (!hasFilters) {
        // ── Pas de filtre — affiche les 50 dernières cartes ajoutées ──
        dbQuery = dbQuery.limit(50);
      } else {
        // ── Avec filtre — jusqu'à 500 cartes ─────────────────────────
        dbQuery = dbQuery.limit(500);

        if (groupId) dbQuery = dbQuery.eq("group_id", groupId);
        if (albumId) dbQuery = dbQuery.eq("album_id", albumId);
        if (memberId) dbQuery = dbQuery.eq("member_id", memberId);

        if (query.trim()) {
          dbQuery = dbQuery.or(
            `member_name.ilike.%${query}%,` +
              `album_title.ilike.%${query}%,` +
              `group_name.ilike.%${query}%,` +
              `type.ilike.%${query}%,` +
              `version.ilike.%${query}%`,
          );
        }

        if (allowedGroupIds && allowedGroupIds.length > 0 && !groupId) {
          dbQuery = dbQuery.in("group_id", allowedGroupIds);
        }
      }

      const { data, error } = await dbQuery;
      if (error) throw error;
      setPhotocards((data ?? []).map(mapPhotocard));
    } catch (err: any) {
      console.error("useFilteredPhotocards:", err.message);
    } finally {
      setLoading(false);
    }
  }, [
    groupId,
    albumId,
    memberId,
    query,
    hasFilters,
    allowedGroupIds?.join(","),
  ]);

  useEffect(() => {
    const delay = query.trim() ? 400 : 0;
    const timer = setTimeout(fetch, delay);
    return () => clearTimeout(timer);
  }, [fetch]);

  const removeById = useCallback((id: string) => {
    setPhotocards((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return {
    photocards,
    loading,
    total: photocards.length,
    refetch: fetch,
    removeById,
  };
};
