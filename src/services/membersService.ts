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

  getMembersWithAlbumStats: async (
    groupId: string,
    albumId: string,
    userId?: string,
  ): Promise<Member[]> => {
    // ── 1. Charge les membres du groupe ───────────────────────────────────
    const { data: membersData, error: membersError } = await supabase
      .from("members")
      .select("*")
      .eq("group_id", groupId)
      .order("stage_name");

    if (membersError) throw membersError;

    // ── 2. Compte les photocards par membre pour cet album ────────────────
    const { data: pcData, error: pcError } = await supabase
      .from("photocards")
      .select("id, member_id")
      .eq("album_id", albumId)
      .eq("status", "approved");

    if (pcError) throw pcError;

    // console.log("📦 Photocards dans l'album:", pcData?.length);

    // Compte total par membre
    const totalCounts: Record<string, number> = {};
    const photocardIds: string[] = [];

    (pcData ?? []).forEach((p: any) => {
      totalCounts[p.member_id] = (totalCounts[p.member_id] ?? 0) + 1;
      photocardIds.push(p.id);
    });

    // console.log(
    //   "🎴 photocardIds:",
    //   photocardIds.length,
    //   photocardIds.slice(0, 3),
    // );
    console.log("👤 userId:", userId);

    // ── 3. Cartes possédées par l'utilisateur pour cet album ──────────────
    const ownedCounts: Record<string, number> = {};
    const wishlistCounts: Record<string, number> = {};

    if (userId && photocardIds.length > 0) {
      // Cartes en collection
      const { data: collectionData, error: collectionError } = await supabase
        .from("user_collection")
        .select("photocard_id")
        .eq("user_id", userId)
        .in("photocard_id", photocardIds);

      // console.log(
      //   "✅ Collection data:",
      //   collectionData,
      //   "error:",
      //   collectionError,
      // );

      // Pour chaque carte possédée, trouve son membre
      const ownedIds = new Set(
        (collectionData ?? []).map((c: any) => c.photocard_id),
      );

      // console.log("✅ ownedIds:", [...ownedIds]);

      (pcData ?? []).forEach((p: any) => {
        if (ownedIds.has(p.id)) {
          ownedCounts[p.member_id] = (ownedCounts[p.member_id] ?? 0) + 1;
        }
      });

      // console.log("✅ ownedCounts:", ownedCounts);

      // Cartes en wishlist
      const { data: wishlistData, error: wishlistError } = await supabase
        .from("user_wishlist")
        .select("photocard_id")
        .eq("user_id", userId)
        .in("photocard_id", photocardIds);

      // console.log("💫 Wishlist data:", wishlistData, "error:", wishlistError);

      const wishlistedIds = new Set(
        (wishlistData ?? []).map((w: any) => w.photocard_id),
      );
      (pcData ?? []).forEach((p: any) => {
        if (wishlistedIds.has(p.id)) {
          wishlistCounts[p.member_id] = (wishlistCounts[p.member_id] ?? 0) + 1;
        }
      });
    } else {
      console.log("⚠️ userId manquant ou photocardIds vide:", {
        userId,
        photocardIdsLength: photocardIds.length,
      });
    }

    // ── 4. Fusionne tout ──────────────────────────────────────────────────
    return (membersData ?? [])
      .map(mapMember)
      .filter((m) => totalCounts[m.id] !== undefined)
      .map((m) => {
        const total = totalCounts[m.id] ?? 0;
        const owned = ownedCounts[m.id] ?? 0;
        const wishlist = wishlistCounts[m.id] ?? 0;

        console.log(
          `👤 ${m.stageName}: total=${total} owned=${owned} wishlist=${wishlist}`,
        );

        return {
          ...m,
          totalPhotocards: total,
          ownedPhotocards: owned,
          wishlistPhotocards: wishlist,
          completionPercentage:
            total > 0 ? Math.round((owned / total) * 100) : 0,
        };
      });
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

export const mapMember = (data: any): Member => ({
  id: data.id,
  groupId: data.group_id,
  stageName: data.stage_name,
  realName: data.real_name,
  koreanName: data.korean_name,
  photoUrl: data.photo_url ? { uri: data.photo_url } : undefined,
  position: data.positions ?? [],
  birthDate: data.birth_date,
  tags: data.tags ?? [],
  totalPhotocards: data.total_photocards ?? 0,
  ownedPhotocards: data.owned_photocards ?? 0,
  wishlistPhotocards: data.wishlist_photocards ?? 0,
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
