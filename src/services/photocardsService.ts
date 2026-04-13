import { supabase } from "../lib/supabase";
import { PhotocardWithDetails } from "../types";
import { extractUrl } from "../utils/extractUrl";

export const photocardsService = {
  getAll: async (): Promise<PhotocardWithDetails[]> => {
    const { data, error } = await supabase
      .from("photocards_with_details")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data.map(mapPhotocard);
  },

  getByAlbum: async (albumId: string): Promise<PhotocardWithDetails[]> => {
    const { data, error } = await supabase
      .from("photocards_with_details")
      .select("*")
      .eq("album_id", albumId)
      .eq("status", "approved");

    if (error) throw error;
    return data.map(mapPhotocard);
  },

  getByMember: async (memberId: string): Promise<PhotocardWithDetails[]> => {
    const { data, error } = await supabase
      .from("photocards_with_details")
      .select("*")
      .eq("member_id", memberId)
      .eq("status", "approved");

    if (error) throw error;
    return data.map(mapPhotocard);
  },

  getPending: async (): Promise<PhotocardWithDetails[]> => {
    const { data, error } = await supabase
      .from("photocards_with_details")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data.map(mapPhotocard);
  },

  getRecent: async (limit: number = 10): Promise<PhotocardWithDetails[]> => {
    const { data, error } = await supabase
      .from("photocards_with_details")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data.map(mapPhotocard);
  },

  getRecentByUser: async (
    userId: string,
    limit: number = 10,
  ): Promise<PhotocardWithDetails[]> => {
    // Récupère les IDs des cartes de l'utilisateur (collection + favoris + wishlist)
    const [collection, favorites, wishlist] = await Promise.all([
      supabase
        .from("user_collection")
        .select("photocard_id, added_at")
        .eq("user_id", userId)
        .order("added_at", { ascending: false })
        .limit(limit),
      supabase
        .from("user_favorites")
        .select("photocard_id, added_at")
        .eq("user_id", userId)
        .order("added_at", { ascending: false })
        .limit(limit),
      supabase
        .from("user_wishlist")
        .select("photocard_id, added_at")
        .eq("user_id", userId)
        .order("added_at", { ascending: false })
        .limit(limit),
    ]);

    if (collection.error) throw collection.error;
    if (favorites.error) throw favorites.error;
    if (wishlist.error) throw wishlist.error;

    // Fusionne et déduplique en gardant la date la plus récente
    const cardMap = new Map<string, string>();

    [
      ...(collection.data ?? []),
      ...(favorites.data ?? []),
      ...(wishlist.data ?? []),
    ].forEach((item) => {
      const existing = cardMap.get(item.photocard_id);
      if (!existing || item.added_at > existing) {
        cardMap.set(item.photocard_id, item.added_at);
      }
    });

    if (cardMap.size === 0) return [];

    // Trie par date décroissante et prend les N premiers
    const sortedIds = [...cardMap.entries()]
      .sort((a, b) => b[1].localeCompare(a[1]))
      .slice(0, limit)
      .map(([id]) => id);

    // Fetch les détails des photocards
    const { data, error } = await supabase
      .from("photocards_with_details")
      .select("*")
      .in("id", sortedIds);

    if (error) throw error;

    // Retrie dans le bon ordre (Supabase ne garantit pas l'ordre avec .in())
    return sortedIds
      .map((id) => data.find((d: any) => d.id === id))
      .filter(Boolean)
      .map(mapPhotocard);
  },

  submit: async (
    data: Partial<PhotocardWithDetails>,
    isAdmin: boolean = false,
  ): Promise<PhotocardWithDetails> => {
    const payload: Record<string, any> = {
      member_id: data.memberId,
      album_id: data.albumId,
      group_id: data.groupId,
      type: data.type,
      version: data.version ?? null,
      shop_name: data.shopName ?? null,
      rarity: data.rarity ?? "common",
      status: isAdmin ? "approved" : "pending",
    };

    // ✅ Extrait les URLs depuis ImageSourcePropType
    const imageUrl = extractUrl(data.imageUrl);
    const backImageUrl = extractUrl(data.backImageUrl);

    if (imageUrl !== undefined) payload.image_url = imageUrl;
    if (backImageUrl !== undefined) payload.back_image_url = backImageUrl;

    console.log("Submit photocard payload:", payload); // ← debug

    const { data: created, error } = await supabase
      .from("photocards")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return mapPhotocard(created);
  },

  approve: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("photocards")
      .update({ status: "approved" })
      .eq("id", id);

    if (error) throw error;
  },

  reject: async (id: string, reason?: string): Promise<void> => {
    const { error } = await supabase
      .from("photocards")
      .update({ status: "rejected", reject_reason: reason })
      .eq("id", id);

    if (error) throw error;
  },

  update: async (
    id: string,
    data: Partial<PhotocardWithDetails>,
  ): Promise<void> => {
    const payload: Record<string, any> = {};

    if (data.type) payload.type = data.type;
    if (data.version !== undefined) payload.version = data.version ?? null;
    if (data.shopName !== undefined) payload.shop_name = data.shopName ?? null;
    if (data.rarity) payload.rarity = data.rarity;
    if (data.memberId) payload.member_id = data.memberId;
    if (data.albumId) payload.album_id = data.albumId;

    // Images — uniquement si fournies
    if (data.imageUrl !== undefined) {
      payload.image_url = extractUrl(data.imageUrl) ?? null;
    }
    if (data.backImageUrl !== undefined) {
      payload.back_image_url = extractUrl(data.backImageUrl) ?? null;
    }

    const { error } = await supabase
      .from("photocards")
      .update(payload)
      .eq("id", id);

    if (error) throw error;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("photocards").delete().eq("id", id);
    if (error) throw error;
  },
};

export const mapPhotocard = (data: any): PhotocardWithDetails => ({
  id: data.id,
  memberId: data.member_id,
  albumId: data.album_id,
  groupId: data.group_id,
  imageUrl: data.image_url ? { uri: data.image_url } : null,
  backImageUrl: data.back_image_url ? { uri: data.back_image_url } : null,
  type: data.type,
  version: data.version,
  isLimited: data.is_limited,
  shopName: data.shop_name,
  rarity: data.rarity,
  fingerprint: data.fingerprint,
  status: data.status,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  memberName: data.member_name,
  albumTitle: data.album_title,
  groupName: data.group_name,
});
