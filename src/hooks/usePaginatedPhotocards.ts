import { supabase } from "@/src/lib/supabase";
import {
  mapPhotocard,
  photocardsService,
} from "@/src/services/photocardsService";
import { PhotocardWithDetails } from "@/src/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFetchOnFocus } from "./useFetchOnFocus";

const PAGE_SIZE = 10;

interface Filters {
  memberId?: string;
  albumId?: string;
  groupId?: string;
  status?: string;
}

export const usePaginatedPhotocards = (filters: Filters = {}) => {
  const [photocards, setPhotocards] = useState<PhotocardWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const isFetching = useRef(false);

  const fetchAll = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    try {
      const f = filtersRef.current;

      // ── Cas memberId — utilise la fonction SQL ────────────────────
      if (f.memberId) {
        console.log("🔍 getByMember:", f.memberId, "albumId:", f.albumId);
        const data = await photocardsService.getByMember(f.memberId, f.albumId);
        console.log("📦 résultat:", data.length);
        setPhotocards(data);
        return;
      }

      // ── Cas général ───────────────────────────────────────────────
      let query = supabase
        .from("photocards_with_details")
        .select("*")
        .eq("status", f.status ?? "approved")
        .order("created_at", { ascending: false });

      if (f.groupId) query = query.eq("group_id", f.groupId);
      if (f.albumId) query = query.eq("album_id", f.albumId);

      const { data, error } = await query;
      if (error) throw error;
      setPhotocards((data ?? []).map(mapPhotocard));
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  const prevFiltersKey = useRef("");
  useEffect(() => {
    const key = [
      filters.groupId ?? "",
      filters.albumId ?? "",
      filters.memberId ?? "",
      filters.status ?? "",
    ].join("|");

    if (key === prevFiltersKey.current) return;
    prevFiltersKey.current = key;
    fetchAll();
  }, [filters.groupId, filters.albumId, filters.memberId, filters.status]);

  useFetchOnFocus(fetchAll);

  return {
    photocards,
    loading,
    error,
    refetch: fetchAll,
    refresh: fetchAll,
    loadingMore: false,
    hasMore: false,
    loadMore: () => {},
  };
};
