import { useAuthStore } from "@/src/store/authStore";

export const useIsGroupAdmin = (groupId?: string | null) => {
  const { isAdmin, groupAdminIds } = useAuthStore();

  // Admin global → accès à tout
  if (isAdmin) return true;

  // Group admin → accès seulement si ce groupe est dans sa liste
  if (groupId && groupAdminIds.includes(groupId)) return true;

  return false;
};
