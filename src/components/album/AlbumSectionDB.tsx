import { Colors } from "@/src/constants/colors";
import { Theme } from "@/src/constants/theme";
import { supabase } from "@/src/lib/supabase";
import { mapPhotocard } from "@/src/services/photocardsService";
import { useCollectionStore } from "@/src/store/collectionStore";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PhotocardWithDetails } from "../../types";
import { AlbumCardRow } from "./AlbumCardRow";
import { AlbumSectionPagination } from "./AlbumSectionPagination";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AlbumInfo {
  albumId: string;
  albumTitle: string;
  albumCoverUrl?: string;
  missingCount: number;
}

interface AlbumSectionDBProps {
  albumInfo: AlbumInfo;
  userId: string;
  groupId: string;
  memberId?: string;
  activeType?: string;
  activeShop?: string;
  fetchMode?: "missing" | "collection" | "favorites" | "wishlist";
  expanded: boolean;
  onToggle: () => void;
  onPressCard?: (card: PhotocardWithDetails) => void;
}

const PAGE_SIZE = 30;
const NUM_COLUMNS = 3;

const RPC_NAME: Record<string, string> = {
  missing: "get_missing_photocards_by_album",
  collection: "get_my_cards_by_album",
  favorites: "get_my_cards_by_album",
  wishlist: "get_my_cards_by_album",
};

// ─── Composant ────────────────────────────────────────────────────────────────

export const AlbumSectionDB: React.FC<AlbumSectionDBProps> = ({
  albumInfo,
  userId,
  groupId,
  memberId,
  activeType,
  activeShop,
  fetchMode = "missing",
  expanded,
  onToggle,
  onPressCard,
}) => {
  const { favoriteIds, wishlistIds, collectionIds } = useCollectionStore();
  const [page, setPage] = useState(0);
  const [cards, setCards] = useState<PhotocardWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const loadedPages = useRef(new Set<number>());

  const totalPages = Math.ceil(albumInfo.missingCount / PAGE_SIZE);

  // ── Reset cache quand le membre change ───────────────────────────────
  useEffect(() => {
    setCards([]);
    setPage(0);
    loadedPages.current = new Set();
  }, [memberId, activeType, activeShop]);

  // ── Ré-enrichit les cartes déjà chargées quand la collection change ───
  useEffect(() => {
    setCards((prev) =>
      prev
        .filter((card) => card && !collectionIds.has(card.id))
        .map((card) =>
          card
            ? {
                ...card,
                isInCollection: collectionIds.has(card.id),
                isFavorite: favoriteIds.has(card.id),
                isWishlisted: wishlistIds.has(card.id),
              }
            : card,
        ),
    );
  }, [collectionIds, favoriteIds, wishlistIds]);

  // ── Charge la page si pas encore en cache ────────────────────────────
  useEffect(() => {
    if (!expanded || loadedPages.current.has(page)) return;

    const fetchPage = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc(
          RPC_NAME[fetchMode ?? "missing"] ?? "get_missing_photocards_by_album",
          {
            p_user_id: userId,
            p_group_id: groupId,
            p_album_id: albumInfo.albumId,
            p_member_id: memberId ?? null,
            p_type: activeType ?? null,
            p_shop: activeShop ?? null,
            p_limit: PAGE_SIZE,
            p_offset: page * PAGE_SIZE,
            ...(fetchMode !== "missing" && { p_mode: fetchMode }),
          },
        );
        if (error) throw error;

        const mapped = (data ?? [])
          .map(mapPhotocard)
          .map((c: PhotocardWithDetails) => ({
            ...c,
            isInCollection: collectionIds.has(c.id),
            isFavorite: favoriteIds.has(c.id),
            isWishlisted: wishlistIds.has(c.id),
          }));

        setCards((prev) => {
          const next = [...prev];
          mapped.forEach((card: PhotocardWithDetails, i: number) => {
            next[page * PAGE_SIZE + i] = card;
          });
          return next;
        });
        loadedPages.current.add(page);
      } catch (err: any) {
        console.error("AlbumSectionDB:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [page, expanded]);

  // ── Rows de la page courante ──────────────────────────────────────────
  const pageCards = cards.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const rows: PhotocardWithDetails[][] = [];
  for (let i = 0; i < pageCards.length; i += NUM_COLUMNS) {
    rows.push(pageCards.slice(i, i + NUM_COLUMNS));
  }

  return (
    <View style={styles.section}>
      {/* ── Header ── */}
      <TouchableOpacity
        style={styles.albumHeader}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <View style={styles.albumCoverWrap}>
          {albumInfo.albumCoverUrl ? (
            <Image
              source={{ uri: albumInfo.albumCoverUrl }}
              style={styles.albumCover}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.albumCoverFallback}>
              <Text style={styles.albumCoverEmoji}>📀</Text>
            </View>
          )}
        </View>
        <View style={styles.albumInfo}>
          <Text style={styles.albumTitle} numberOfLines={1}>
            {albumInfo.albumTitle}
          </Text>
          <Text style={styles.albumSubtitle}>
            {albumInfo.missingCount} carte
            {albumInfo.missingCount !== 1 ? "s" : ""}
            {totalPages > 1 && ` · page ${page + 1}/${totalPages}`}
          </Text>
        </View>
        <View style={styles.albumToggle}>
          {expanded ? (
            <ChevronUp size={16} color={Colors.textMuted} strokeWidth={1.6} />
          ) : (
            <ChevronDown size={16} color={Colors.textMuted} strokeWidth={1.6} />
          )}
        </View>
      </TouchableOpacity>

      {/* ── Cartes + pagination ── */}
      {expanded && (
        <View style={styles.sectionCards}>
          {loading ? (
            <View style={styles.pageLoading}>
              <ActivityIndicator color={Colors.accent} size="small" />
            </View>
          ) : (
            rows.map((row, i) => (
              <AlbumCardRow
                key={`${albumInfo.albumId}-${page}-${i}`}
                row={row}
                onPressCard={onPressCard}
              />
            ))
          )}
          {!loading && (
            <AlbumSectionPagination
              page={page}
              totalPages={totalPages}
              onPage={setPage}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  albumHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Colors.surface,
  },
  albumCoverWrap: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.sm,
    overflow: "hidden",
    backgroundColor: Colors.surface2,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  albumCover: { width: "100%", height: "100%" },
  albumCoverFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  albumCoverEmoji: { fontSize: 20 },
  albumInfo: { flex: 1, gap: 2 },
  albumTitle: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  albumSubtitle: { fontSize: Theme.fontSize.xs + 1, color: Colors.textMuted },
  albumToggle: { alignItems: "center" },
  sectionCards: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    gap: 8,
    backgroundColor: Colors.bg,
  },
  pageLoading: { paddingVertical: Theme.spacing.xl, alignItems: "center" },
});
