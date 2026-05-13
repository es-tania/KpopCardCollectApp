import { supabase } from "@/src/lib/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { useCallback, useEffect, useState } from "react";

interface UseAvailableFiltersOptions {
  mode: string;
  groupId?: string | null;
}

// ── Retourne les types et shops disponibles pour le mode + groupe ─────────────
export const useAvailableFilters = ({
  mode,
  groupId,
}: UseAvailableFiltersOptions) => {
  const { user } = useAuthStore();

  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableShops, setAvailableShops] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!user || !groupId) {
      setAvailableTypes([]);
      setAvailableShops([]);
      return;
    }
    setLoading(true);
    try {
      // ← Une seule requête pour récupérer types et shops distincts
      const table =
        mode === "missing"
          ? null
          : mode === "collection"
            ? "user_collection"
            : mode === "favorites"
              ? "user_favorites"
              : "user_wishlist";

      let query;
      if (mode === "missing") {
        // Pour missing — cartes non collectées du groupe
        query = supabase
          .from("photocards")
          .select("type, shop_name")
          .eq("group_id", groupId)
          .eq("status", "approved")
          .not(
            "id",
            "in",
            `(select photocard_id from user_collection where user_id = '${user.id}')`,
          );
      } else {
        query = supabase
          .from(table!)
          .select("photocards_with_details!inner(type, shop_name, group_id)")
          .eq("user_id", user.id)
          .eq("photocards_with_details.group_id", groupId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const types = new Set<string>();
      const shops = new Set<string>();

      (data ?? []).forEach((d: any) => {
        const item = mode === "missing" ? d : d.photocards_with_details;
        if (item?.type) types.add(item.type);
        if (item?.shop_name) shops.add(item.shop_name);
      });

      setAvailableTypes([...types]);
      setAvailableShops([...shops]);
    } catch (err: any) {
      console.error("useAvailableFilters:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user, mode, groupId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { availableTypes, availableShops, loading };
};
