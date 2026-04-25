import { CACHE_TTL } from "@/src/constants/cacheTtl";
import { supabase } from "@/src/lib/supabase";
import { useCallback, useEffect, useState } from "react";
import { useCache } from "../useCache";

interface Shop {
  id: string;
  key: string;
  label: string;
}

export const useShops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchWithCache } = useCache();

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWithCache(
        "shops:all",
        async () => {
          const { data, error } = await supabase
            .from("shops")
            .select("id, key, label")
            .order("label");
          if (error) throw error;
          return data ?? [];
        },
        CACHE_TTL.shops ?? 60 * 60 * 1000, // 1h — les shops changent rarement
      );
      setShops(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Compatibilité avec l'ancien format SelectOption
  const shopOptions = shops.map((s) => ({ key: s.key, label: s.label }));

  return { shops, shopOptions, loading };
};
