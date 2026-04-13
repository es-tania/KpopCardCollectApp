import { collectionService } from "@/src/services/collectionService";
import { useAuthStore } from "@/src/store/authStore";
import { Group } from "@/src/types";
import { useCallback, useEffect, useState } from "react";

export const useFollowedGroups = () => {
  const { user } = useAuthStore();
  const [followedGroups, setFollowedGroups] = useState<Group[]>([]);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await collectionService.getFollowedGroups(user.id);
      setFollowedGroups(data);
      setFollowedIds(new Set(data.map((g: Group) => g.id)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const toggleFollow = useCallback(
    async (groupId: string) => {
      if (!user) return;
      const isFollowing = followedIds.has(groupId);
      try {
        // Optimistic update
        setFollowedIds((prev) => {
          const next = new Set(prev);
          isFollowing ? next.delete(groupId) : next.add(groupId);
          return next;
        });

        await collectionService.toggleFollowGroup(
          user.id,
          groupId,
          isFollowing,
        );
      } catch (err: any) {
        // Rollback
        setFollowedIds((prev) => {
          const next = new Set(prev);
          isFollowing ? next.add(groupId) : next.delete(groupId);
          return next;
        });
        setError(err.message);
      }
    },
    [user, followedIds],
  );

  return {
    followedGroups,
    followedIds,
    loading,
    error,
    toggleFollow,
    refetch: fetch,
  };
};
