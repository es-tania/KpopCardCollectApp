import { albumsService } from "@/src/services/albumsService";
import { Album } from "@/src/types";
import { useCallback, useEffect, useState } from "react";

export const useAlbum = (albumId: string) => {
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!albumId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await albumsService.getById(albumId);
      setAlbum(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [albumId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { album, loading, error, refetch: fetch };
};
