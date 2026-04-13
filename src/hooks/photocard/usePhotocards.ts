import { photocardsService } from "@/src/services/photocardsService";
import { PhotocardWithDetails } from "@/src/types";
import { useCallback, useEffect, useState } from "react";

interface UsePhotocardsResult {
  photocards: PhotocardWithDetails[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
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

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data: PhotocardWithDetails[];

      if (filters?.albumId) {
        data = await photocardsService.getByAlbum(filters.albumId);
      } else if (filters?.memberId) {
        data = await photocardsService.getByMember(filters.memberId);
      } else {
        data = await photocardsService.getAll();
      }

      setPhotocards(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters?.groupId, filters?.albumId, filters?.memberId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { photocards, loading, error, refetch: fetch };
};
