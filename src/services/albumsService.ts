import { supabase } from "../lib/supabase";
import { Album } from "../types";

export const albumsService = {
  getByGroup: async (groupId: string): Promise<Album[]> => {
    const { data, error } = await supabase
      .from("albums")
      .select("*")
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
  title: data.title,
  koreanTitle: data.korean_title,
  type: data.type,
  category: data.category,
  coverUrl: data.cover_url ? { uri: data.cover_url } : undefined,
  releaseDate: data.release_date,
  totalPhotocards: 0, // calculé séparément
  hasPOB: data.has_pob,
  isLimited: data.is_limited,
  eventName: data.event_name,
  eventLocation: data.event_location,
  eventDate: data.event_date,
  versions: data.versions ?? [],
  tags: data.tags ?? [],
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

const mapAlbumToDb = (data: Partial<Album>) => ({
  group_id: data.groupId,
  title: data.title,
  korean_title: data.koreanTitle,
  type: data.type,
  category: data.category,
  release_date: data.releaseDate,
  event_name: data.eventName,
  event_location: data.eventLocation,
  event_date: data.eventDate,
  versions: data.versions,
  has_pob: data.hasPOB,
  is_limited: data.isLimited,
  tags: data.tags,
});
