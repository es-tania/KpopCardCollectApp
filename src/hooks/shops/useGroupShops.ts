// src/hooks/useGroupShops.ts
import { supabase } from "@/src/lib/supabase";
import { SelectOption } from "@/src/types";
import { useEffect, useState } from "react";

export const useGroupShops = (
  groupId?: string,
  allOptions?: SelectOption[],
) => {
  const [usedKeys, setUsedKeys] = useState<string[]>([]);

  useEffect(() => {
    if (!groupId) return;
    supabase
      .from("photocards")
      .select("shop_name")
      .eq("group_id", groupId)
      .eq("status", "approved")
      .not("shop_name", "is", null)
      .then(({ data }) => {
        const unique = [
          ...new Set((data ?? []).map((d: any) => d.shop_name).filter(Boolean)),
        ];
        setUsedKeys(unique);
      });
  }, [groupId]);

  // ── Construit la liste avec les shops utilisés en haut ────────────────
  const sortedOptions = (() => {
    if (!allOptions || usedKeys.length === 0) return allOptions ?? [];

    const usedSet = new Set(usedKeys);
    const usedOptions = allOptions.filter((o) => usedSet.has(o.key));
    const restOptions = allOptions.filter((o) => !usedSet.has(o.key));

    if (usedOptions.length === 0) return allOptions;

    return [
      // Séparateur
      { key: "__used_header__", label: "── Déjà utilisés ──", disabled: true },
      ...usedOptions,
      { key: "__all_header__", label: "── Tous les shops ──", disabled: true },
      ...restOptions,
    ];
  })();

  return { sortedOptions, usedKeys };
};
