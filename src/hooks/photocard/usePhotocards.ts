import { CACHE_TTL } from "@/src/constants/cacheTtl";
import { photocardsService } from "@/src/services/photocardsService";
import { useCacheStore } from "@/src/store/cacheStore";
import { PhotocardWithDetails } from "@/src/types";
import { useCallback, useState } from "react";
import { useCache } from "../useCache";
import { useFetchOnFocus } from "../useFetchOnFocus";

interface UsePhotocardsResult {
  photocards: PhotocardWithDetails[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  removeById: (id: string) => void;
}

export const usePhotocards = (filters?: {
  groupId?: string;
  albumId?: string;
  memberId?: string;
  status?: string;
}): UsePhotocardsResult => {
  const [photocards, setPhotocards] = useState<PhotocardWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchWithCache } = useCache();

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = [
        "photocards",
        filters?.groupId ?? "all",
        filters?.albumId ?? "all",
        filters?.memberId ?? "all",
        filters?.status ?? "approved",
      ].join(":");

      const data = await fetchWithCache<PhotocardWithDetails[]>(
        cacheKey,
        async () => {
          if (filters?.albumId) {
            return photocardsService.getByAlbum(filters.albumId);
          }
          if (filters?.memberId) {
            return photocardsService.getByMember(filters.memberId);
          }
          return photocardsService.getAll();
        },
        CACHE_TTL.photocards,
      );

      setPhotocards(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters?.groupId, filters?.albumId, filters?.memberId]);

  const removeById = useCallback((id: string) => {
    setPhotocards((prev) => prev.filter((c) => c.id !== id));
    // Invalide aussi le cache
    useCacheStore.getState().invalidateAll("photocards:");
  }, []);

  useFetchOnFocus(fetch);

  return { photocards, loading, error, refetch: fetch, removeById };
};
