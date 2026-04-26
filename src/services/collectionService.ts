import { supabase } from "../lib/supabase";
import { mapGroup } from "./groupsService";

export const collectionService = {
  // ── Collection ────────────────────────────────────────────────────────

  getCollection: async (userId: string): Promise<string[]> => {
    let allIds: string[] = [];
    let from = 0;

    while (true) {
      const { data, error } = await supabase
        .from("user_collection")
        .select("photocard_id")
        .eq("user_id", userId)
        .range(from, from + 999);

      if (error) throw error;
      if (!data || data.length === 0) break;

      allIds = [...allIds, ...data.map((d: any) => d.photocard_id)];
      if (data.length < 1000) break;
      from += 1000;
    }

    return allIds;
  },

  addToCollection: async (
    userId: string,
    photocardId: string,
  ): Promise<void> => {
    const { error } = await supabase
      .from("user_collection")
      .insert({ user_id: userId, photocard_id: photocardId });

    if (error) throw error;
  },

  removeFromCollection: async (
    userId: string,
    photocardId: string,
  ): Promise<void> => {
    const { error } = await supabase
      .from("user_collection")
      .delete()
      .eq("user_id", userId)
      .eq("photocard_id", photocardId);

    if (error) throw error;
  },

  // ── Favoris ────────────────────────────────────────────────────────────
  getFavorites: async (userId: string): Promise<string[]> => {
    let allIds: string[] = [];
    let from = 0;

    while (true) {
      const { data, error } = await supabase
        .from("user_favorites")
        .select("photocard_id")
        .eq("user_id", userId)
        .range(from, from + 999);

      if (error) throw error;
      if (!data || data.length === 0) break;

      allIds = [...allIds, ...data.map((d: any) => d.photocard_id)];
      if (data.length < 1000) break;
      from += 1000;
    }

    return allIds;
  },

  toggleFavorite: async (
    userId: string,
    photocardId: string,
    isFavorite: boolean,
  ): Promise<void> => {
    if (isFavorite) {
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", userId)
        .eq("photocard_id", photocardId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("user_favorites")
        .insert({ user_id: userId, photocard_id: photocardId });
      if (error) throw error;
    }
  },

  // ── Wishlist ───────────────────────────────────────────────────────────
  getWishlist: async (userId: string): Promise<string[]> => {
    let allIds: string[] = [];
    let from = 0;

    while (true) {
      const { data, error } = await supabase
        .from("user_wishlist")
        .select("photocard_id")
        .eq("user_id", userId)
        .range(from, from + 999);

      if (error) throw error;
      if (!data || data.length === 0) break;

      allIds = [...allIds, ...data.map((d: any) => d.photocard_id)];
      if (data.length < 1000) break;
      from += 1000;
    }

    return allIds;
  },

  toggleWishlist: async (
    userId: string,
    photocardId: string,
    isWishlisted: boolean,
  ): Promise<void> => {
    if (isWishlisted) {
      const { error } = await supabase
        .from("user_wishlist")
        .delete()
        .eq("user_id", userId)
        .eq("photocard_id", photocardId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("user_wishlist")
        .insert({ user_id: userId, photocard_id: photocardId });
      if (error) throw error;
    }
  },

  // ── Groupes suivis ─────────────────────────────────────────────────────

  getFollowedGroups: async (userId: string) => {
    const { data, error } = await supabase
      .from("user_followed_groups")
      .select("group_id, groups (*)")
      .eq("user_id", userId);

    if (error) throw error;
    return data.map((d: any) => mapGroup(d.groups));
  },

  toggleFollowGroup: async (
    userId: string,
    groupId: string,
    isFollowing: boolean,
  ): Promise<void> => {
    if (isFollowing) {
      const { error } = await supabase
        .from("user_followed_groups")
        .delete()
        .eq("user_id", userId)
        .eq("group_id", groupId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("user_followed_groups")
        .insert({ user_id: userId, group_id: groupId });
      if (error) throw error;
    }
  },
};
