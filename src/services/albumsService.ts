import { supabase } from "../lib/supabase";
import { Album } from "../types";
import { extractUrl } from "../utils/extractUrl";

export const albumsService = {
  getAll: async (): Promise<Album[]> => {
    const { data, error } = await supabase
      .from("albums")
      .select(
        `
      *,
      groups (name)
    `,
      )
      .order("release_date", { ascending: false });

    if (error) throw error;
    return data.map(mapAlbum);
  },

  getByGroup: async (groupId: string): Promise<Album[]> => {
    const { data, error } = await supabase
      .from("albums")
      .select(
        `
      *,
      groups (name)
    `,
      )
      .eq("group_id", groupId)
      .order("release_date", { ascending: false });

    if (error) throw error;
    return data.map(mapAlbum);
  },

  getById: async (id: string): Promise<Album> => {
    const { data, error } = await supabase
      .from("albums")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return mapAlbum(data);
  },

  create: async (data: Partial<Album>): Promise<Album> => {
    const { data: created, error } = await supabase
      .from("albums")
      .insert(mapAlbumToDb(data))
      .select()
      .single();

    if (error) throw error;
    return mapAlbum(created);
  },

  update: async (id: string, data: Partial<Album>): Promise<Album> => {
    const { data: updated, error } = await supabase
      .from("albums")
      .update(mapAlbumToDb(data))
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return mapAlbum(updated);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("albums").delete().eq("id", id);
    if (error) throw error;
  },
};

const mapAlbum = (data: any): Album => ({
  id: data.id,
  groupId: data.group_id,
  groupName: data.groups?.name ?? "",
  title: data.title,
  koreanTitle: data.korean_title ?? undefined,
  type: data.type,
  category: data.category ?? "music",
  coverUrl: data.cover_url ? { uri: data.cover_url } : undefined,
  releaseDate: data.release_date ?? undefined,
  totalPhotocards: 0,
  hasPOB: data.has_pob ?? false,
  isLimited: data.is_limited ?? false,
  eventName: data.event_name ?? undefined,
  eventLocation: data.event_location ?? undefined,
  eventDate: data.event_date ?? undefined,
  versions: data.versions ?? [],
  tags: data.tags ?? [],
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

const mapAlbumToDb = (data: Partial<Album>) => {
  const base: Record<string, any> = {
    group_id: data.groupId,
    title: data.title,
    korean_title: data.koreanTitle ?? null,
    type: data.type,
    category: data.category ?? "music",
    release_date: data.releaseDate ?? null,
    event_name: data.eventName ?? null,
    event_location: data.eventLocation ?? null,
    event_date: data.eventDate ?? null,
    versions: data.versions ?? [],
    has_pob: data.hasPOB ?? false,
    is_limited: data.isLimited ?? false,
    tags: data.tags ?? [],
  };

  const coverUrl = extractUrl(data.coverUrl);
  if (coverUrl !== undefined) base.cover_url = coverUrl;

  return base;
};
