import { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { authService } from "../services";
import { useCollectionStore } from "./collectionStore";

interface AuthState {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  isGroupAdmin: boolean;
  groupAdminIds: string[];
  loading: boolean;
  init: () => Promise<void>;
  signOut: () => Promise<void>;
}

// ── Helper — charge tout pour un user ────────────────────────────────────────
const loadUserData = async (userId: string) => {
  const [profileResult, groupAdminsResult] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", userId).single(),
    supabase.from("group_admins").select("group_id").eq("user_id", userId),
  ]);

  const isAdmin = profileResult.data?.role === "admin";

  const groupAdminIds = (groupAdminsResult.data ?? []).map(
    (d: any) => d.group_id,
  );
  return { isAdmin, groupAdminIds, isGroupAdmin: groupAdminIds.length > 0 };
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isAdmin: false,
  isGroupAdmin: false,
  groupAdminIds: [],
  loading: true,

  init: async () => {
    // ── 1. Session existante ─────────────────────────────────────────
    const session = await authService.getSession();
    set({ session, user: session?.user ?? null, loading: false });

    if (session?.user) {
      const userData = await loadUserData(session.user.id);
      set(userData);
    }

    // ── 2. Écoute les changements ────────────────────────────────────
    authService.onAuthStateChange(async (newSession) => {
      set({ session: newSession, user: newSession?.user ?? null });

      if (newSession?.user) {
        const userData = await loadUserData(newSession.user.id);
        set(userData);
      } else {
        // Logout — reset tout
        set({
          isAdmin: false,
          isGroupAdmin: false,
          groupAdminIds: [],
        });
      }
    });
  },

  signOut: async () => {
    await authService.signOut();
    useCollectionStore.getState().reset();
    set({
      session: null,
      user: null,
      isAdmin: false,
      isGroupAdmin: false,
      groupAdminIds: [],
    });
  },
}));
