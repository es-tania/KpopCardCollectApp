import { Colors } from "@/src/constants/colors";
import { PHOTOCARD_FILTER_OPTIONS } from "@/src/constants/options";
import { Theme } from "@/src/constants/theme";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  PhotocardType,
  PhotocardTypeFilter,
  PhotocardWithDetails,
} from "../../types";
import { AlbumInfo, AlbumSectionDB } from "../album/AlbumSectionDB";
import { AlbumSectionStatic } from "../album/AlbumSectionStatic";
import { QuickFilterChips } from "../ui/QuickFilterChips";

// ─── Types ────────────────────────────────────────────────────────────────────

export type { AlbumInfo };

interface PhotocardsByAlbumProps {
  // ── Mode standard (cards déjà chargées) ──────────────────────────────
  cards?: PhotocardWithDetails[];
  // ── Mode BDD (charge depuis Supabase par page) ────────────────────────
  albumInfos?: AlbumInfo[];
  userId?: string;
  groupId?: string;
  memberId?: string;
  fetchMode?: "missing" | "collection" | "favorites" | "wishlist";
  // ── Commun ───────────────────────────────────────────────────────────
  onPressCard?: (card: PhotocardWithDetails) => void;
  ListHeaderComponent?: React.ReactElement;
  defaultExpanded?: boolean;
  activeType?: string;
  activeShop?: string;
  onTypeChange?: (type: PhotocardTypeFilter) => void;
  loadingMore?: boolean;
  onEndReached?: () => void;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export const PhotocardsByAlbum: React.FC<PhotocardsByAlbumProps> = ({
  cards,
  albumInfos,
  userId,
  groupId,
  memberId,
  fetchMode = "missing",
  onPressCard,
  ListHeaderComponent,
  defaultExpanded = false,
  activeType,
  activeShop,
  onTypeChange,
  loadingMore,
  onEndReached,
}) => {
  const isDBMode = !!albumInfos && !!userId && !!groupId;

  const [localActiveType, setLocalActiveType] =
    useState<PhotocardTypeFilter>("all");
  const currentType = activeType ?? localActiveType;
  const setCurrentType = onTypeChange ?? setLocalActiveType;

  // ── Types disponibles (mode standard uniquement) ──────────────────────
  const availableTypes = useMemo(() => {
    if (isDBMode) return [];
    const types = new Set((cards ?? []).map((c) => c.type));
    return PHOTOCARD_FILTER_OPTIONS.filter(
      (opt) => opt.key === "all" || types.has(opt.key as PhotocardType),
    );
  }, [cards, isDBMode]);

  // ── Sections mode standard ────────────────────────────────────────────
  const staticSections = useMemo(() => {
    if (isDBMode || !cards) return [];
    let filtered = cards;
    if (currentType !== "all")
      filtered = filtered.filter((c) => c.type === currentType);
    const map = new Map<
      string,
      {
        albumId: string;
        albumTitle: string;
        coverUrl?: any;
        cards: PhotocardWithDetails[];
      }
    >();
    filtered.forEach((card) => {
      if (!map.has(card.albumId)) {
        map.set(card.albumId, {
          albumId: card.albumId,
          albumTitle: card.albumTitle,
          coverUrl: (card as any).albumCoverUrl ?? null,
          cards: [],
        });
      }
      map.get(card.albumId)!.cards.push(card);
    });
    return Array.from(map.values()).sort((a, b) =>
      a.albumTitle.localeCompare(b.albumTitle),
    );
  }, [cards, currentType, isDBMode]);

  const dataSource = isDBMode ? (albumInfos ?? []) : staticSections;

  // ── État expand ───────────────────────────────────────────────────────
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleSection = useCallback((albumId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(albumId) ? next.delete(albumId) : next.add(albumId);
      return next;
    });
  }, []);

  const expandAll = useCallback(
    () => setExpanded(new Set(dataSource.map((s) => s.albumId))),
    [dataSource],
  );
  const collapseAll = useCallback(() => setExpanded(new Set()), []);

  useEffect(() => {
    if (defaultExpanded) {
      setExpanded(new Set(dataSource.map((s) => s.albumId)));
    }
  }, [dataSource]);

  // ── Rendu d'une section ───────────────────────────────────────────────
  const renderSection = useCallback(
    ({ item }: { item: any }) => {
      if (isDBMode) {
        return (
          <AlbumSectionDB
            albumInfo={item as AlbumInfo}
            userId={userId!}
            groupId={groupId!}
            memberId={memberId}
            activeType={activeType}
            activeShop={activeShop}
            fetchMode={fetchMode}
            expanded={expanded.has(item.albumId)}
            onToggle={() => toggleSection(item.albumId)}
            onPressCard={onPressCard}
          />
        );
      }
      return (
        <AlbumSectionStatic
          section={item}
          expanded={expanded.has(item.albumId)}
          onToggle={() => toggleSection(item.albumId)}
          onPressCard={onPressCard}
        />
      );
    },
    [
      isDBMode,
      expanded,
      toggleSection,
      onPressCard,
      userId,
      groupId,
      memberId,
      activeShop,
      activeType,
      fetchMode,
    ],
  );

  // ── Header ────────────────────────────────────────────────────────────
  const ListHeader = useMemo(
    () => (
      <>
        {ListHeaderComponent}
        {!isDBMode && availableTypes.length > 1 && (
          <QuickFilterChips
            options={availableTypes}
            selected={currentType}
            onSelect={(k) => setCurrentType(k as PhotocardTypeFilter)}
          />
        )}
        {dataSource.length > 1 && (
          <View style={styles.controls}>
            <TouchableOpacity onPress={expandAll} style={styles.controlBtn}>
              <Text style={styles.controlText}>Tout déplier</Text>
            </TouchableOpacity>
            <View style={styles.controlDivider} />
            <TouchableOpacity onPress={collapseAll} style={styles.controlBtn}>
              <Text style={styles.controlText}>Tout replier</Text>
            </TouchableOpacity>
          </View>
        )}
      </>
    ),
    [
      ListHeaderComponent,
      availableTypes,
      currentType,
      dataSource.length,
      expandAll,
      collapseAll,
      isDBMode,
    ],
  );

  // ── Empty ─────────────────────────────────────────────────────────────
  if (dataSource.length === 0) {
    return (
      <>
        {ListHeaderComponent}
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🃏</Text>
          <Text style={styles.emptyText}>Aucune carte</Text>
        </View>
      </>
    );
  }

  return (
    <FlatList
      data={dataSource}
      renderItem={renderSection}
      keyExtractor={(item) => item.albumId}
      ListHeaderComponent={ListHeader}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews
      maxToRenderPerBatch={4}
      windowSize={8}
      ListFooterComponent={
        <>
          {loadingMore && (
            <View style={styles.loadingMore}>
              <ActivityIndicator color={Colors.accent} size="small" />
            </View>
          )}
          <View style={styles.footer} />
        </>
      }
    />
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  controls: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  controlBtn: { paddingVertical: Theme.spacing.xs },
  controlDivider: {
    width: 1,
    height: 12,
    backgroundColor: Colors.border,
    marginHorizontal: Theme.spacing.md,
  },
  controlText: { fontSize: Theme.fontSize.sm, color: Colors.textMuted },
  loadingMore: { paddingVertical: Theme.spacing.lg, alignItems: "center" },
  footer: { height: 40 },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyEmoji: { fontSize: 28 },
  emptyText: { fontSize: Theme.fontSize.base, color: Colors.textMuted },
});
