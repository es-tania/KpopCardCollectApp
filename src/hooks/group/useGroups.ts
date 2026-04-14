import { CACHE_TTL } from "@/src/constants/cacheTtl";
import { groupsService } from "@/src/services/groupsService";
import { useAuthStore } from "@/src/store/authStore";
import { Group } from "@/src/types";
import { useCallback, useState } from "react";
import { useCache } from "../useCache";
import { useFetchOnFocus } from "../useFetchOnFocus";

interface UseGroupsResult {
  groups: Group[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useGroups = (withUserStats: boolean = false): UseGroupsResult => {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchWithCache } = useCache();

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey =
        withUserStats && user ? `groups:withStats:${user.id}` : "groups:all";
      const data = await fetchWithCache(
        cacheKey,
        () =>
          withUserStats && user
            ? groupsService.getWithUserStats(user.id)
            : groupsService.getAll(),
        CACHE_TTL.groups,
      );
      setGroups(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [withUserStats, user]);

  useFetchOnFocus(fetch);

  return { groups, loading, error, refetch: fetch };
};
