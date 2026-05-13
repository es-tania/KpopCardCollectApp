import { AlbumInfo } from "@/src/components/album/AlbumSectionDB";
import { supabase } from "@/src/lib/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseAlbumCountsOptions {
  mode: string;
  groupId?: string | null;
  memberId?: string;
  type?: string;
  shop?: string;
  watchIds?: Set<string>;
}

const RPC_MAP: Record<string, string> = {
  missing: "get_missing_counts_by_album",
  collection: "get_my_counts_by_album",
  favorites: "get_my_counts_by_album",
  wishlist: "get_my_counts_by_album",
};

const COUNT_FIELD: Record<string, string> = {
  missing: "missing_count",
  collection: "card_count",
  favorites: "card_count",
  wishlist: "card_count",
};

export const useAlbumCounts = ({
  mode,
  groupId,
  memberId,
  type,
  shop,
  watchIds,
}: UseAlbumCountsOptions) => {
  const { user } = useAuthStore();

  const [albumInfos, setAlbumInfos] = useState<AlbumInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [silentRefreshing, setSilentRefreshing] = useState(false);

  const rpcName = RPC_MAP[mode] ?? "get_my_counts_by_album";
  const countField = COUNT_FIELD[mode] ?? "card_count";

  const fetchCounts = useCallback(
    async (silent = false) => {
      if (!user || !groupId) return;
      silent ? setSilentRefreshing(true) : setLoading(true);
      try {
        const params: Record<string, any> = {
          p_user_id: user.id,
          p_group_id: groupId,
          p_member_id: memberId ?? null,
          p_type: type ?? null,
          p_shop: shop ?? null,
        };
        if (mode !== "missing") params.p_mode = mode;

        const { data, error } = await supabase.rpc(rpcName, params);
        if (error) throw error;

        setAlbumInfos(
          (data ?? []).map((d: any) => ({
            albumId: d.album_id,
            albumTitle: d.album_title,
            albumCoverUrl: d.album_cover_url ?? undefined,
            missingCount: d[countField],
          })),
        );
      } catch (err: any) {
        console.error("useAlbumCounts:", err.message);
      } finally {
        silent ? setSilentRefreshing(false) : setLoading(false);
      }
    },
    [user, groupId, memberId, mode, type, shop, rpcName, countField],
  );

  // ── Reset + chargement initial ────────────────────────────────────────
  useEffect(() => {
    setAlbumInfos([]);
    fetchCounts(false);
  }, [groupId, memberId, type, shop]);

  // ── Refresh silencieux quand les IDs changent ─────────────────────────
  const prevWatchIds = useRef(watchIds);
  useEffect(() => {
    if (!groupId || watchIds === prevWatchIds.current) return;
    prevWatchIds.current = watchIds;
    fetchCounts(true);
  }, [watchIds]);

  const totalCount = albumInfos.reduce((acc, a) => acc + a.missingCount, 0);

  return {
    albumInfos,
    loading,
    silentRefreshing,
    totalCount,
    refetch: fetchCounts,
  };
};
