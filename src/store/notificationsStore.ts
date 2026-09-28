import { supabase } from "@/src/lib/supabase";
import { create } from "zustand";
import { useAuthStore } from "./authStore";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType =
  | "photocard_approved"
  | "photocard_rejected"
  | "album_approved"
  | "album_rejected"
  | "group_approved"
  | "group_rejected"
  | "new_photocard_submission"
  | "new_album_submission"
  | "new_group_submission";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: {
    submission_id?: string;
    entity_name?: string;
    reject_reason?: string;
  } | null;
  read: boolean;
  createdAt: string;
}

interface NotificationsState {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  // ── Actions ───────────────────────────────────────────────────────────
  fetch: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  reset: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetch: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const notifications: AppNotification[] = (data ?? []).map((n: any) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        data: n.data,
        read: n.read,
        createdAt: n.created_at,
      }));

      set({
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      });
    } catch (err: any) {
      console.error("notificationsStore.fetch:", err.message);
    } finally {
      set({ loading: false });
    }
  },

  markRead: async (id) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id)
      .eq("user_id", user.id);

    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
  },

  markAllRead: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  reset: () => set({ notifications: [], unreadCount: 0 }),
}));
