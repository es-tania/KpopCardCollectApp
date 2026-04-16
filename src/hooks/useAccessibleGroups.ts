import { useAuthStore } from "@/src/store/authStore";
import { useMemo } from "react";
import { useGroups } from "./group/useGroups";

export const useAccessibleGroups = () => {
  const { isAdmin, groupAdminIds } = useAuthStore();
  const { groups, loading } = useGroups();

  const accessibleGroups = useMemo(() => {
    if (isAdmin) return groups; // admin global → tous les groupes
    return groups.filter((g) => groupAdminIds.includes(g.id));
  }, [groups, isAdmin, groupAdminIds]);

  return { groups: accessibleGroups, loading };
};
