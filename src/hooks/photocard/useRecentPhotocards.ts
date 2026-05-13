import { photocardsService } from "@/src/services/photocardsService";
import { useAuthStore } from "@/src/store/authStore";
import { PhotocardWithDetails } from "@/src/types";
import { useCallback, useState } from "react";
import { useFetchOnFocus } from "../useFetchOnFocus";

export const useRecentPhotocards = (limit: number = 10) => {
  const { user } = useAuthStore();
  const [photocards, setPhotocards] = useState<PhotocardWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) {
      setPhotocards([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await photocardsService.getRecentByUser(user.id, limit);
      setPhotocards(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, limit]);

  useFetchOnFocus(fetch);

  return { photocards, loading, error, refetch: fetch };
};
