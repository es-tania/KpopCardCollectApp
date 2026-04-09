import { supabase } from "../lib/supabase";
import { Album, Group, Member, Photocard } from "../types";

// ─── Groups ───────────────────────────────────────────────────────────────────

export const groupsApi = {
  getAll: () => supabase.from("groups").select("*").order("name"),

  getById: (id: string) =>
    supabase.from("groups").select("*").eq("id", id).single(),

  create: (data: Partial<Group>) =>
    supabase.from("groups").insert(data).select().single(),

  update: (id: string, data: Partial<Group>) =>
    supabase.from("groups").update(data).eq("id", id).select().single(),

  delete: (id: string) => supabase.from("groups").delete().eq("id", id),
};

// ─── Members ──────────────────────────────────────────────────────────────────

export const membersApi = {
  getByGroup: (groupId: string) =>
    supabase
      .from("members")
      .select("*")
      .eq("group_id", groupId)
      .order("stage_name"),

  getById: (id: string) =>
    supabase.from("members").select("*").eq("id", id).single(),

  create: (data: Partial<Member>) =>
    supabase.from("members").insert(data).select().single(),

  update: (id: string, data: Partial<Member>) =>
    supabase.from("members").update(data).eq("id", id).select().single(),

  delete: (id: string) => supabase.from("members").delete().eq("id", id),
};

// ─── Albums ───────────────────────────────────────────────────────────────────

export const albumsApi = {
  getByGroup: (groupId: string) =>
    supabase
      .from("albums")
      .select("*")
      .eq("group_id", groupId)
      .order("release_date", { ascending: false }),

  getById: (id: string) =>
    supabase.from("albums").select("*").eq("id", id).single(),

  create: (data: Partial<Album>) =>
    supabase.from("albums").insert(data).select().single(),

  update: (id: string, data: Partial<Album>) =>
    supabase.from("albums").update(data).eq("id", id).select().single(),

  delete: (id: string) => supabase.from("albums").delete().eq("id", id),
};

// ─── Photocards ───────────────────────────────────────────────────────────────

export const photocardsApi = {
  getByAlbum: (albumId: string) =>
    supabase
      .from("photocards")
      .select("*, members(stage_name), albums(title), groups(name)")
      .eq("album_id", albumId)
      .eq("status", "approved"),

  getByMember: (memberId: string) =>
    supabase
      .from("photocards")
      .select("*, members(stage_name), albums(title), groups(name)")
      .eq("member_id", memberId)
      .eq("status", "approved"),

  getPending: () =>
    supabase
      .from("photocards")
      .select(
        "*, members(stage_name), albums(title), groups(name), profiles(username)",
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false }),

  submit: (data: Partial<Photocard>) =>
    supabase
      .from("photocards")
      .insert({ ...data, status: "pending" })
      .select()
      .single(),

  approve: (id: string) =>
    supabase.from("photocards").update({ status: "approved" }).eq("id", id),

  reject: (id: string) =>
    supabase.from("photocards").update({ status: "rejected" }).eq("id", id),

  update: (id: string, data: Partial<Photocard>) =>
    supabase.from("photocards").update(data).eq("id", id).select().single(),

  delete: (id: string) => supabase.from("photocards").delete().eq("id", id),
};

// ─── Collection ───────────────────────────────────────────────────────────────

export const collectionApi = {
  getUserCollection: (userId: string) =>
    supabase
      .from("user_collection")
      .select(
        "*, photocards(*, members(stage_name), albums(title), groups(name))",
      )
      .eq("user_id", userId),

  add: (userId: string, photocardId: string) =>
    supabase
      .from("user_collection")
      .insert({ user_id: userId, photocard_id: photocardId }),

  remove: (userId: string, photocardId: string) =>
    supabase
      .from("user_collection")
      .delete()
      .eq("user_id", userId)
      .eq("photocard_id", photocardId),
};

// ─── Favorites ────────────────────────────────────────────────────────────────

export const favoritesApi = {
  getAll: (userId: string) =>
    supabase
      .from("user_favorites")
      .select(
        "*, photocards(*, members(stage_name), albums(title), groups(name))",
      )
      .eq("user_id", userId),

  add: (userId: string, photocardId: string) =>
    supabase
      .from("user_favorites")
      .insert({ user_id: userId, photocard_id: photocardId }),

  remove: (userId: string, photocardId: string) =>
    supabase
      .from("user_favorites")
      .delete()
      .eq("user_id", userId)
      .eq("photocard_id", photocardId),
};

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export const wishlistApi = {
  getAll: (userId: string) =>
    supabase
      .from("user_wishlist")
      .select(
        "*, photocards(*, members(stage_name), albums(title), groups(name))",
      )
      .eq("user_id", userId),

  add: (userId: string, photocardId: string) =>
    supabase
      .from("user_wishlist")
      .insert({ user_id: userId, photocard_id: photocardId }),

  remove: (userId: string, photocardId: string) =>
    supabase
      .from("user_wishlist")
      .delete()
      .eq("user_id", userId)
      .eq("photocard_id", photocardId),
};

// ─── Storage ──────────────────────────────────────────────────────────────────

export const storageApi = {
  uploadImage: async (
    bucket:
      | "photocards"
      | "album-covers"
      | "group-logos"
      | "group-banners"
      | "member-photos"
      | "avatars",
    path: string,
    file: Blob,
  ) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  },

  deleteImage: (bucket: string, path: string) =>
    supabase.storage.from(bucket).remove([path]),
};
