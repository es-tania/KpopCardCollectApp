import { supabase } from "@/src/lib/supabase";
import { mapGroup } from "@/src/services/groupsService";
import { useAuthStore } from "@/src/store/authStore";
import { Group } from "@/src/types";
import { useCallback, useEffect, useState } from "react";

const TABLE_MAP: Record<string, string> = {
  collection: "user_collection",
  favorites: "user_favorites",
  wishlist: "user_wishlist",
};

export const useGroupsByMode = (mode: string) => {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const table = TABLE_MAP[mode];
      if (!table) return;

      // ← Récupère les group_id distincts depuis les cartes de l'utilisateur
      const { data, error } = await supabase
        .from(table)
        .select("photocards_with_details!inner(group_id, groups(*))")
        .eq("user_id", user.id);

      if (error) throw error;

      // ← Déduplique les groupes
      const seen = new Set<string>();
      const result: Group[] = [];
      (data ?? []).forEach((d: any) => {
        const g = d.photocards_with_details?.groups;
        if (g && !seen.has(g.id)) {
          seen.add(g.id);
          result.push(mapGroup(g));
        }
      });

      setGroups(result.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err: any) {
      console.error("useGroupsByMode:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user, mode]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { groups, loading };
};
