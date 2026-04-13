import { groupsService } from "@/src/services/groupsService";
import { Group } from "@/src/types";
import { useCallback, useEffect, useState } from "react";

export const useGroup = (groupId: string) => {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await groupsService.getById(groupId);
      setGroup(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { group, loading, error, refetch: fetch };
};
