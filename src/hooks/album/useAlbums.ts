import { CACHE_TTL } from "@/src/constants/cacheTtl";
import { albumsService } from "@/src/services/albumsService";
import { Album } from "@/src/types";
import { useCallback, useEffect, useState } from "react";
import { useCache } from "../useCache";
import { useFetchOnFocus } from "../useFetchOnFocus";

interface UseAlbumsResult {
  albums: Album[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAlbums = (groupId?: string): UseAlbumsResult => {
  console.log(groupId);

  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchWithCache, invalidate } = useCache();

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `albums:${groupId}`;
      const data = await fetchWithCache(
        cacheKey,
        async () =>
          groupId
            ? await albumsService.getByGroup(groupId)
            : await albumsService.getAll(),
        CACHE_TTL.albums,
      );
      setAlbums(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useFetchOnFocus(fetch);

  const refetch = useCallback(async () => {
    const cacheKey = `albums:${groupId}`;
    invalidate(cacheKey);
    await fetch();
  }, [groupId, fetch, invalidate]);

  return { albums, loading, error, refetch };
};
