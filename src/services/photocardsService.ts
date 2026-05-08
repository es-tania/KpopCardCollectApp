import {
  CardFormat,
  getCardRatio,
} from "../constants/options/cardFormatOptions";
import { supabase } from "../lib/supabase";
import {
  CardMember,
  PhotocardEditFormState,
  PhotocardFormState,
  PhotocardWithDetails,
} from "../types";
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

  getByMember: async (
    memberId: string,
    albumId?: string,
  ): Promise<PhotocardWithDetails[]> => {
    const { data, error } = await supabase.rpc("get_photocards_by_member", {
      p_member_id: memberId,
      p_album_id: albumId ?? null,
    });
    if (error) throw error;
    return (data ?? []).map(mapPhotocard);
  },

  getById: async (id: string): Promise<PhotocardWithDetails | null> => {
    const { data, error } = await supabase
      .from("photocards_with_details")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return mapPhotocard(data);
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
      created_by: (await supabase.auth.getUser()).data.user?.id,
      aspect_ratio: (data as any).aspectRatio ?? "photocard",
      custom_width: (data as any).customWidth ?? null,
      custom_height: (data as any).customHeight ?? null,
      back_image_shared: data.backImageShared ?? false,
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

  update: async (id: string, data: PhotocardEditFormState): Promise<void> => {
    // validateOrThrow(photocardEditSchema, data);
    const isMulti = data.memberIds.length > 1;

    // ── Construit le payload ──────────────────────────────────────────────
    const payload: Record<string, any> = {
      member_id: isMulti ? null : (data.memberIds[0] ?? data.memberId),
      album_id: data.albumId,
      type: data.type,
      version: data.version || null,
      shop_name: data.shopName || null,
      rarity: data.rarity || "common",
      aspect_ratio: data.aspectRatio ?? "photocard",
      custom_width: data.customWidth ?? null,
      custom_height: data.customHeight ?? null,
    };

    if (data.newImageUrl !== undefined) {
      payload.image_url = data.newImageUrl;
    }
    if (data.newBackImageUrl !== undefined) {
      payload.back_image_url = data.newBackImageUrl;
    }

    // ── Update en BDD avec le payload complet ────────────────────────────
    const { data: result, error } = await supabase
      .from("photocards")
      .update(payload)
      .eq("id", id)
      .select("id, aspect_ratio, custom_width, custom_height");

    console.log("✅ Résultat BDD:", JSON.stringify(result, null, 2));
    console.log("❌ Erreur:", error);

    if (error) throw error;

    // ── Membres ───────────────────────────────────────────────────────────
    const { error: deleteError } = await supabase
      .from("photocard_members")
      .delete()
      .eq("photocard_id", id);

    if (deleteError) throw deleteError;

    if (data.memberIds.length > 0) {
      const { error: insertError } = await supabase
        .from("photocard_members")
        .insert(
          data.memberIds.map((memberId) => ({
            photocard_id: id,
            member_id: memberId,
          })),
        );
      if (insertError) throw insertError;
    }
  },

  create: async (data: PhotocardFormState, isAdmin = false): Promise<void> => {
    // validateOrThrow(photocardCreateSchema, data);
    const isMulti = data.memberIds.length > 1;

    const { data: card, error } = await supabase
      .from("photocards")
      .insert({
        member_id: isMulti ? null : (data.memberIds[0] ?? data.memberId),
        album_id: data.albumId,
        group_id: data.groupId,
        type: data.type,
        version: data.version || null,
        shop_name: data.shopName || null,
        rarity: data.rarity || "common",
        status: isAdmin ? "approved" : "pending",
        aspect_ratio: data.aspectRatio ?? "photocard",
        custom_width: data.customWidth ?? null,
        custom_height: data.customHeight ?? null,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Insère tous les membres
    if (data.memberIds.length > 0) {
      const { error: insertError } = await supabase
        .from("photocard_members")
        .insert(
          data.memberIds.map((memberId) => ({
            photocard_id: card.id,
            member_id: memberId,
          })),
        );
      if (insertError) throw insertError;
    }
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("photocards").delete().eq("id", id);
    if (error) throw error;
  },
};

export const mapPhotocard = (d: any): PhotocardWithDetails => {
  const cardMembers: CardMember[] = (d.card_members ?? []).map((m: any) => ({
    id: m.id,
    stageName: m.stage_name,
  }));

  const isMultiMember = cardMembers.length > 1;

  const aspectRatio = (d.aspect_ratio as CardFormat) ?? "photocard";
  const cardRatio = getCardRatio(aspectRatio, d.custom_width, d.custom_height);

  return {
    id: d.id,
    memberId: d.member_id ?? cardMembers[0]?.id ?? "",
    memberName:
      d.member_name ?? cardMembers.map((m) => m.stageName).join(" & ") ?? "",
    cardMembers,
    isMultiMember,
    albumId: d.album_id,
    albumTitle: d.album_title,
    groupId: d.group_id,
    groupName: d.group_name,
    type: d.type,
    version: d.version,
    shopName: d.shop_name,
    rarity: d.rarity,
    imageUrl: d.image_url ? { uri: d.image_url } : null,
    backImageUrl: d.back_image_url ? { uri: d.back_image_url } : null,
    status: d.status,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
    createdBy: d.created_by,
    aspectRatio,
    customWidth: d.custom_width ?? undefined,
    customHeight: d.custom_height ?? undefined,
    cardRatio,
    albumCoverUrl: d.album_cover_url ? { uri: d.album_cover_url } : undefined,
  };
};
