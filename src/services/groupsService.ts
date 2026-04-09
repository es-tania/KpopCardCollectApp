import { supabase } from "../lib/supabase";
import { Group } from "../types";
import { extractUrl } from "../utils/extractUrl";

export const groupsService = {
  // ── Lecture ────────────────────────────────────────────────────────────

  getAll: async (): Promise<Group[]> => {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .order("name");

    if (error) throw error;
    return data.map(mapGroup);
  },

  getById: async (id: string): Promise<Group> => {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return mapGroup(data);
  },

  // ── Écriture (admin) ───────────────────────────────────────────────────

  create: async (data: Partial<Group>): Promise<Group> => {
    const { data: created, error } = await supabase
      .from("groups")
      .insert(mapGroupToDb(data))
      .select()
      .single();

    if (error) throw error;
    return mapGroup(created);
  },

  update: async (id: string, data: Partial<Group>): Promise<Group> => {
    const { data: updated, error } = await supabase
      .from("groups")
      .update(mapGroupToDb(data))
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return mapGroup(updated);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("groups").delete().eq("id", id);

    if (error) throw error;
  },
};

// ─── Mappers ──────────────────────────────────────────────────────────────────

const mapGroup = (data: any): Group => ({
  id: data.id,
  name: data.name,
  koreanName: data.korean_name,
  logoUrl: data.logo_url ? { uri: data.logo_url } : undefined,
  bannerUrl: data.banner_url ? { uri: data.banner_url } : undefined,
  company: data.company,
  debutDate: data.debut_date,
  disbandDate: data.disband_date,
  status: data.status ?? "active",
  generation: data.generation,
  fandomName: data.fandom_name,
  memberCount: data.group_stats?.member_count,
  totalAlbums: data.group_stats?.total_albums,
  totalPhotocards: data.group_stats?.total_photocards ?? 0,
  createdAt: data.created_at,
});

const mapGroupToDb = (data: Partial<Group>) => {
  const base: Record<string, any> = {
    name: data.name,
    korean_name: data.koreanName ?? null,
    company: data.company ?? null,
    debut_date: data.debutDate ?? null,
    disband_date: data.disbandDate ?? null,
    status: data.status ?? "active",
    generation: data.generation ?? null,
    fandom_name: data.fandomName ?? null,
  };

  const logoUrl = extractUrl(data.logoUrl);
  const bannerUrl = extractUrl(data.bannerUrl);

  // ✅ undefined = champ absent du payload = Supabase ne touche pas la colonne
  if (logoUrl !== undefined) base.logo_url = logoUrl;
  if (bannerUrl !== undefined) base.banner_url = bannerUrl;

  return base;
};
