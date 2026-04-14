import { membersService } from "@/src/services/membersService";
import { Member } from "@/src/types";
import { useCallback, useEffect, useState } from "react";
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
  const [members, setMembers] = useState<Member[]>([]);
  const [membersWithStats, setMembersWithStats] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      if (albumId) {
        // ── Stats spécifiques à l'album ───────────────────────────────
        const withStats = await membersService.getMembersWithAlbumStats(
          groupId,
          albumId,
        );

        setMembersWithStats(withStats);
      }
      const data = await membersService.getByGroup(groupId);
      setMembers(data);

      setError(null);
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

  const deleteMember = useCallback(async (memberId: string) => {
    await membersService.delete(memberId);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
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
