import { supabase } from "../lib/supabase";
import { PhotocardWithDetails } from "../types";
import { mapGroup } from "./groupsService";

export const collectionService = {
  // ── Collection ────────────────────────────────────────────────────────

  getCollection: async (userId: string): Promise<PhotocardWithDetails[]> => {
    const { data, error } = await supabase
      .from("user_collection")
      .select(
        `
        photocard_id,
        photocards_with_details (*)
      `,
      )
      .eq("user_id", userId);

    if (error) throw error;
    return data.map((d: any) => ({
      ...mapPhotocard(d.photocards_with_details),
      isInCollection: true,
    }));
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

  getFavorites: async (userId: string): Promise<PhotocardWithDetails[]> => {
    const { data, error } = await supabase
      .from("user_favorites")
      .select(
        `
        photocard_id,
        photocards_with_details (*)
      `,
      )
      .eq("user_id", userId);

    if (error) throw error;
    return data.map((d: any) => ({
      ...mapPhotocard(d.photocards_with_details),
      isFavorite: true,
    }));
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

  getWishlist: async (userId: string): Promise<PhotocardWithDetails[]> => {
    const { data, error } = await supabase
      .from("user_wishlist")
      .select(
        `
        photocard_id,
        photocards_with_details (*)
      `,
      )
      .eq("user_id", userId);

    if (error) throw error;
    return data.map((d: any) => ({
      ...mapPhotocard(d.photocards_with_details),
      isWishlisted: true,
    }));
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

const mapPhotocard = (data: any): PhotocardWithDetails => ({
  id: data.id,
  memberId: data.member_id,
  albumId: data.album_id,
  groupId: data.group_id,
  imageUrl: data.image_url ? { uri: data.image_url } : undefined,
  type: data.type,
  version: data.version,
  rarity: data.rarity,
  status: data.status,
  createdAt: data.created_at,
  memberName: data.member_name,
  albumTitle: data.album_title,
  groupName: data.group_name,
});
