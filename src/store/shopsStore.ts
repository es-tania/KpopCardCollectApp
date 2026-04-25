// src/store/shopsStore.ts
import { create } from "zustand";
import { supabase } from "../lib/supabase";

interface ShopsState {
  shops: { key: string; label: string }[];
  loaded: boolean;
  load: () => Promise<void>;
  getLabel: (key?: string) => string;
}

export const useShopsStore = create<ShopsState>((set, get) => ({
  shops: [],
  loaded: false,

  load: async () => {
    if (get().loaded) return; // ← ne recharge pas si déjà chargé
    const { data } = await supabase
      .from("shops")
      .select("key, label")
      .order("label");
    set({ shops: data ?? [], loaded: true });
  },

  getLabel: (key?: string): string => {
    if (!key) return "";
    const shop = get().shops.find((s) => s.key === key);
    return shop?.label ?? key;
  },
}));
