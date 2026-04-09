import { membersService } from "@/src/services/membersService";
import { Member } from "@/src/types";
import { useCallback, useEffect, useState } from "react";

interface UseGroupMembersResult {
  members: Member[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteMember: (memberId: string) => Promise<void>;
}

export const useGroupMembers = (
  groupId: string | null,
): UseGroupMembersResult => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await membersService.getByGroup(groupId);
      setMembers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const deleteMember = useCallback(async (memberId: string) => {
    await membersService.delete(memberId);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  }, []);

  return { members, loading, error, refetch: fetch, deleteMember };
};
