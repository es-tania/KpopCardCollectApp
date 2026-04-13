import { groupsService } from "@/src/services/groupsService";
import { useAuthStore } from "@/src/store/authStore";
import { Group } from "@/src/types";
import { useCallback, useEffect, useState } from "react";

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

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data =
        withUserStats && user
          ? await groupsService.getWithUserStats(user.id)
          : await groupsService.getAll();
      setGroups(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [withUserStats, user]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { groups, loading, error, refetch: fetch };
};
