import { CACHE_TTL } from "@/src/constants/cacheTtl";
import { supabase } from "@/src/lib/supabase";
import { membersService } from "@/src/services/membersService";
import { useAuthStore } from "@/src/store/authStore";
import { useCollectionStore } from "@/src/store/collectionStore";
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
  const { collectionIds, wishlistIds, favoriteIds } = useCollectionStore();

  const fetch = useCallback(async () => {
    if (!groupId) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `members:${groupId}`;
      const data = await fetchWithCache(
        cacheKey,
        () => membersService.getByGroup(groupId),
        CACHE_TTL.members,
      );
      setMembers(data);

      if (albumId) {
        // ── Stats spécifiques à l'album ── (inchangé)
        const withStats = await membersService.getMembersWithAlbumStats(
          groupId,
          albumId,
          user?.id,
        );
        setMembersWithStats(withStats);
      } else {
        // ── Sans album — calcule les stats depuis le collectionStore ──
        // Charge tous les IDs de photocards du groupe
        const { data: pcData } = await supabase
          .from("photocards")
          .select("id, member_id")
          .eq("group_id", groupId)
          .eq("status", "approved");

        // Groupe les IDs par membre
        const idsByMember: Record<string, string[]> = {};
        (pcData ?? []).forEach((p: any) => {
          if (!idsByMember[p.member_id]) idsByMember[p.member_id] = [];
          idsByMember[p.member_id].push(p.id);
        });

        // Calcule les stats utilisateur
        setMembersWithStats(
          data.map((member) => {
            const ids = idsByMember[member.id] ?? [];
            const total = ids.length;
            const owned = ids.filter((id) => collectionIds.has(id)).length;
            const wished = ids.filter((id) => wishlistIds.has(id)).length;

            return {
              ...member,
              totalPhotocards: total,
              ownedPhotocards: owned,
              wishlistPhotocards: wished,
              completionPercentage:
                total > 0 ? Math.round((owned / total) * 100) : 0,
            };
          }),
        );
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
