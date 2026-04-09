import { supabase } from "../lib/supabase";
import { PhotocardWithDetails } from "../types";

export const photocardsService = {
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

  submit: async (
    data: Partial<PhotocardWithDetails>,
  ): Promise<PhotocardWithDetails> => {
    const { data: created, error } = await supabase
      .from("photocards")
      .insert({
        member_id: data.memberId,
        album_id: data.albumId,
        group_id: data.groupId,
        type: data.type,
        version: data.version,
        shop_name: data.shopName,
        rarity: data.rarity,
        status: "pending",
      })
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
    const { error } = await supabase
      .from("photocards")
      .update({
        type: data.type,
        version: data.version,
        shop_name: data.shopName,
        rarity: data.rarity,
        member_id: data.memberId,
        album_id: data.albumId,
      })
      .eq("id", id);

    if (error) throw error;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("photocards").delete().eq("id", id);
    if (error) throw error;
  },
};

const mapPhotocard = (data: any): PhotocardWithDetails => ({
  id: data.id,
  memberId: data.member_id,
  albumId: data.album_id,
  groupId: data.group_id,
  imageUrl: data.image_url ? { uri: data.image_url } : undefined,
  backImageUrl: data.back_image_url ? { uri: data.back_image_url } : undefined,
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
