import { CACHE_TTL } from "@/src/constants/cacheTtl";
import { membersService } from "@/src/services/membersService";
import { useAuthStore } from "@/src/store/authStore";
import { Member } from "@/src/types";
import { useCallback, useEffect, useState } from "react";
import { useCache } from "../useCache";
import { useFetchOnFocus } from "../useFetchOnFocus";

interface UseGroupMembersResult {
  members: Member[];
  membersWithStats: Member[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteMember: (memberId: string) => Promise<void>;
}

export const useGroupMembers = (
  groupId: string | null,
  albumId?: string,
): UseGroupMembersResult => {
  const { user } = useAuthStore();
  const [members, setMembers] = useState<Member[]>([]);
  const [membersWithStats, setMembersWithStats] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fetchWithCache, invalidate } = useCache();

  // const { invalidateAll } = useCacheStore();

  // invalidateAll("photocards:"); // ← toutes les photocards
  // invalidateAll("members:"); // ← tous les membres
  // invalidateAll("albums:"); // ← tous les albums
  // invalidateAll("groups:"); // ← tous les groupes

  const fetch = useCallback(async () => {
    if (!groupId) {
      setMembers([]);
      setMembersWithStats([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // ── Membres avec cache ────────────────────────────────────────
      const cacheKey = `members:${groupId}`;
      const data = await fetchWithCache(
        cacheKey,
        () => membersService.getByGroup(groupId),
        CACHE_TTL.members,
      );
      setMembers(data);

      if (albumId) {
        // ── Stats spécifiques à l'album ───────────────────────────────
        const withStats = await membersService.getMembersWithAlbumStats(
          groupId,
          albumId,
          user?.id,
        );

        setMembersWithStats(withStats);
      } else {
        setMembersWithStats(data);
      }

      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [groupId, albumId]);

  useEffect(() => {
    fetch();
  }, [fetch]);
  useFetchOnFocus(fetch);

  const deleteMember = useCallback(async (memberId: string) => {
    await membersService.delete(memberId);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    setMembersWithStats((prev) => prev.filter((m) => m.id !== memberId));
  }, []);

  return {
    members,
    membersWithStats,
    loading,
    error,
    refetch: fetch,
    deleteMember,
  };
};
