import { albumsService } from "@/src/services/albumsService";
import { Album } from "@/src/types";
import { useCallback, useEffect, useState } from "react";

interface UseAlbumsResult {
  albums: Album[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAlbums = (groupId?: string): UseAlbumsResult => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = groupId
        ? await albumsService.getByGroup(groupId)
        : await albumsService.getAll();
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

  return { albums, loading, error, refetch: fetch };
};
