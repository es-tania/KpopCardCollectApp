import { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { authService } from "../services";
import { useCollectionStore } from "./collectionStore";

interface AuthState {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  init: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isAdmin: false,
  loading: true,

  init: async () => {
    // Récupère la session existante
    const session = await authService.getSession();
    set({ session, user: session?.user ?? null, loading: false });

    // Vérifie le rôle admin
    if (session?.user) {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      set({ isAdmin: data?.role === "admin" });
    }

    // Écoute les changements
    authService.onAuthStateChange(async (session) => {
      set({ session, user: session?.user ?? null });

      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        set({ isAdmin: data?.role === "admin" });
      } else {
        set({ isAdmin: false });
      }
    });
  },

  signOut: async () => {
    await authService.signOut();
    useCollectionStore.getState().reset(); // ← vide la collection au logout
    set({ session: null, user: null, isAdmin: false });
  },
}));
