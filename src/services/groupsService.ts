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

  getWithUserStats: async (userId: string): Promise<Group[]> => {
    const { data, error } = await supabase
      .from("groups")
      .select(
        `
      *,
      user_group_progress!inner (
        owned_photocards,
        wishlist_photocards,
        favorite_photocards,
        completion_pct
      )
    `,
      )
      .eq("user_group_progress.user_id", userId);

    if (error) throw error;
    return data.map((d: any) => ({
      ...mapGroup(d),
      ownedPhotocards: d.user_group_progress?.owned_photocards ?? 0,
      wishlistPhotocards: d.user_group_progress?.wishlist_photocards ?? 0,
      completionPercentage: d.user_group_progress?.completion_pct ?? 0,
    }));
  },
};

// ─── Mappers ──────────────────────────────────────────────────────────────────

export const mapGroup = (data: any): Group => ({
  id: data.id,
  name: data.name,
  koreanName: data.korean_name ?? undefined,
  logoUrl: data.logo_url ? { uri: data.logo_url } : undefined,
  bannerUrl: data.banner_url ? { uri: data.banner_url } : undefined,
  company: data.company ?? undefined,
  debutDate: data.debut_date ?? undefined,
  disbandDate: data.disband_date ?? undefined,
  status: data.status ?? "active",
  generation: data.generation ?? undefined,
  fandomName: data.fandom_name ?? undefined,
  memberCount: data.member_count ?? 0,
  totalAlbums: data.total_albums ?? 0,
  totalPhotocards: data.total_photocards ?? 0,
  ownedPhotocards: data.owned_photocards ?? 0,
  wishlistPhotocards: data.wishlist_photocards ?? 0,
  favoritePhotocards: data.favorite_photocards ?? 0,
  completionPercentage:
    data.total_photocards > 0
      ? Math.round((data.owned_photocards / data.total_photocards) * 100)
      : 0,
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
