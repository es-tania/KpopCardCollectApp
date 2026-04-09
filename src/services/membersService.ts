import { supabase } from "../lib/supabase";
import { Member } from "../types";

export const membersService = {
  getByGroup: async (groupId: string): Promise<Member[]> => {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("group_id", groupId)
      .order("stage_name");

    if (error) throw error;
    return data.map(mapMember);
  },

  getById: async (id: string): Promise<Member> => {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return mapMember(data);
  },

  create: async (data: Partial<Member>): Promise<Member> => {
    const { data: created, error } = await supabase
      .from("members")
      .insert(mapMemberToDb(data))
      .select()
      .single();

    if (error) throw error;
    return mapMember(created);
  },

  update: async (id: string, data: Partial<Member>): Promise<Member> => {
    const { data: updated, error } = await supabase
      .from("members")
      .update(mapMemberToDb(data))
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return mapMember(updated);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) throw error;
  },
};

const extractUrl = (source: any): string | null | undefined => {
  if (source === undefined) return undefined; // ne pas toucher la colonne
  if (source === null) return null; // effacer la colonne
  if (typeof source === "string") return source || undefined;
  if (typeof source === "object" && source.uri) return source.uri;
  return undefined;
};

const mapMember = (data: any): Member => ({
  id: data.id,
  groupId: data.group_id,
  stageName: data.stage_name,
  realName: data.real_name,
  koreanName: data.korean_name,
  photoUrl: data.photo_url ? { uri: data.photo_url } : undefined,
  position: data.positions ?? [],
  birthDate: data.birth_date,
  tags: data.tags ?? [],
  createdAt: data.created_at,
});

const mapMemberToDb = (data: Partial<Member>) => {
  const base: Record<string, any> = {
    group_id: data.groupId,
    stage_name: data.stageName,
    real_name: data.realName ?? null,
    korean_name: data.koreanName ?? null,
    positions: data.position ?? [],
    birth_date: data.birthDate ?? null,
    tags: data.tags ?? [],
  };

  // ✅ N'inclut photo_url que si une nouvelle valeur est fournie
  const photoUrl = extractUrl(data.photoUrl);
  if (photoUrl !== undefined) base.photo_url = photoUrl;

  return base;
};
