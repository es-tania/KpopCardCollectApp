import { supabase } from "@/src/lib/supabase";
import { mapGroup } from "@/src/services/groupsService";
import { Album, Group, Member, PhotocardWithDetails } from "@/src/types";
import { useCallback, useState } from "react";

interface SearchResults {
  groups: Group[];
  members: Member[];
  albums: Album[];
  photocards: PhotocardWithDetails[];
}

const EMPTY: SearchResults = {
  groups: [],
  members: [],
  albums: [],
  photocards: [],
};

export const useSearch = () => {
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const search = useCallback(async (q: string, userId?: string) => {
    setQuery(q);

    if (!q.trim()) {
      setResults(EMPTY);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const term = q.trim();

      const [groups, members, albums, photocards] = await Promise.all([
        // Groupes
        supabase.from("groups").select("*").ilike("name", `%${term}%`).limit(5),

        // Membres
        supabase
          .from("members")
          .select("*")
          .ilike("stage_name", `%${term}%`)
          .limit(5),

        // Albums
        supabase
          .from("albums")
          .select("*, groups(name)")
          .ilike("title", `%${term}%`)
          .limit(5),

        // Photocards — cherche dans member_name en priorité
        supabase
          .from("photocards_with_details")
          .select("*")
          .or(
            `member_name.ilike.%${term}%,album_title.ilike.%${term}%,group_name.ilike.%${term}%,version.ilike.%${term}%`,
          )
          .eq("status", "approved")
          .limit(10),
      ]);

      if (userId && groups.data && groups.data.length > 0) {
        const groupIds = groups.data.map((g: any) => g.id);

        const { data: progressData } = await supabase
          .from("user_group_progress")
          .select("*")
          .eq("user_id", userId)
          .in("group_id", groupIds);

        const progressMap: Record<string, any> = {};
        (progressData ?? []).forEach((p: any) => {
          progressMap[p.group_id] = p;
        });

        setResults((prev) => ({
          ...prev,
          groups: (groups.data ?? []).map((g: any) => ({
            ...mapGroup(g),
            ownedPhotocards: progressMap[g.id]?.owned_photocards ?? 0,
            wishlistPhotocards: progressMap[g.id]?.wishlist_photocards ?? 0,
            completionPercentage: progressMap[g.id]?.completion_pct ?? 0,
          })),
        }));
      } else {
        setResults((prev) => ({
          ...prev,
          groups: (groups.data ?? []).map(mapGroup),
        }));
      }

      setResults({
        groups: (groups.data ?? []).map(mapGroup),
        members: (members.data ?? []).map(mapMember),
        albums: (albums.data ?? []).map(mapAlbum),
        photocards: (photocards.data ?? []).map(mapPhotocard),
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setQuery("");
    setResults(EMPTY);
  }, []);

  return { results, loading, error, query, search, clear };
};

// ─── Mappers locaux ───────────────────────────────────────────────────────────

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
  totalPhotocards: data.total_photocards ?? 0,
  ownedPhotocards: data.owned_photocards ?? 0,
  wishlistPhotocards: data.wishlist_photocards ?? 0,
  createdAt: data.created_at,
});

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
  totalPhotocards: data.total_photocards ?? 0,
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

const mapPhotocard = (data: any): PhotocardWithDetails => ({
  id: data.id,
  memberId: data.member_id,
  albumId: data.album_id,
  groupId: data.group_id,
  imageUrl: data.image_url ? { uri: data.image_url } : null,
  backImageUrl: data.back_image_url ? { uri: data.back_image_url } : null,
  type: data.type,
  version: data.version,
  shopName: data.shop_name,
  rarity: data.rarity,
  status: data.status,
  createdAt: data.created_at,
  memberName: data.member_name,
  albumTitle: data.album_title,
  groupName: data.group_name,
  createdBy: data.created_by,
});
