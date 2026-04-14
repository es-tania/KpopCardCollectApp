import { PhotocardMiniGrid } from "@/src/components/photocard";
import { useGroupMembers } from "@/src/hooks/group/useGroupMembers";
import { useAlbum } from "@/src/hooks/useAlbum";
import { usePaginatedPhotocards } from "@/src/hooks/usePaginatedPhotocards";
import { useUserCollection } from "@/src/hooks/useUserCollection";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Download } from "lucide-react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlbumHeader, AlbumMembersSelector } from "../../src/components/album";
import { FilterPills } from "../../src/components/ui/FilterPills";
import { SectionLabel } from "../../src/components/ui/SectionLabel";
import { Colors } from "../../src/constants/colors";
import {
  ALL_MEMBERS_ID,
  FILTER_OPTIONS,
  FilterKey,
} from "../../src/constants/options/filterOptions";
import { Theme } from "../../src/constants/theme";
import { useScrollToTop } from "../../src/hooks/useScrollToTop";
import { Member } from "../../src/types";

export default function AlbumScreen() {
  const { id, groupId } = useLocalSearchParams<{
    id: string;
    groupId: string;
  }>();
  const { scrollRef, scrollToTop } = useScrollToTop();

  // ── UI state ──────────────────────────────────────────────────────────
  const [selectedMemberId, setSelectedMemberId] =
    useState<string>(ALL_MEMBERS_ID);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  // ── Data BDD ──────────────────────────────────────────────────────────
  const { album, loading: albumLoading } = useAlbum(id);
  const { membersWithStats, loading: membersLoading } = useGroupMembers(
    groupId,
    id,
  );

  const {
    photocards,
    loading: photocardsLoading,
    loadingMore,
    hasMore,
    loadMore,
  } = usePaginatedPhotocards({
    albumId: id,
    memberId:
      selectedMemberId !== ALL_MEMBERS_ID ? selectedMemberId : undefined,
  });

  const { collectionIds, favoriteIds, wishlistIds } = useUserCollection();

  const cooldownRef = useRef(false);

  // ── Membres présents dans cet album ───────────────────────────────────
  const albumMembers = useMemo(() => {
    return membersWithStats;
  }, [membersWithStats]);

  // ── Photocards enrichies ──────────────────────────────────────────────
  const enrichedPhotocards = useMemo(() => {
    return photocards.map((card) => ({
      ...card,
      isInCollection: collectionIds.has(card.id),
      isFavorite: favoriteIds.has(card.id),
      isWishlisted: wishlistIds.has(card.id),
    }));
  }, [photocards, collectionIds, favoriteIds, wishlistIds]);

  // ── Photocards filtrées ───────────────────────────────────────────────
  const filteredCards = useMemo(() => {
    switch (activeFilter) {
      case "collection":
        return enrichedPhotocards.filter((c) => c.isInCollection);
      case "favorites":
        return enrichedPhotocards.filter((c) => c.isFavorite);
      case "wishlist":
        return enrichedPhotocards.filter((c) => c.isWishlisted);
      default:
        return enrichedPhotocards;
    }
  }, [enrichedPhotocards, activeFilter]);

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleSelectMember = useCallback(
    (member: Member) => {
      setSelectedMemberId((prev) =>
        prev === member.id ? ALL_MEMBERS_ID : member.id,
      );
      setActiveFilter("all");
      scrollToTop();
    },
    [scrollToTop],
  );

  const handleSelectAll = useCallback(() => {
    setSelectedMemberId(ALL_MEMBERS_ID);
    setActiveFilter("all");
    scrollToTop();
  }, [scrollToTop]);

  const handlePressBack = useCallback(() => {
    handleSelectAll();
    router.back();
  }, [groupId]);

  const handleExport = useCallback(() => {
    router.push(`/export?albumId=${id}`);
  }, [id]);

  const handleScroll = useCallback(
    ({ nativeEvent }: any) => {
      const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
      const distanceFromBottom =
        contentSize.height - layoutMeasurement.height - contentOffset.y;

      if (
        distanceFromBottom < 300 &&
        hasMore &&
        !loadingMore &&
        !cooldownRef.current
      ) {
        cooldownRef.current = true;
        loadMore();
        setTimeout(() => {
          cooldownRef.current = false;
        }, 800);
      }
    },
    [hasMore, loadingMore, loadMore],
  );

  if (albumLoading || membersLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={handlePressBack}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={handleExport}>
          <Download size={18} color={Colors.text} strokeWidth={1.6} />
        </TouchableOpacity>
      </View>

      <PhotocardMiniGrid
        cards={filteredCards}
        loadingMore={loadingMore}
        onEndReached={loadMore}
        ListHeaderComponent={
          <>
            {album && <AlbumHeader album={album} />}
            <SectionLabel label="Membres" style={styles.sectionLabel} />
            <AlbumMembersSelector
              members={albumMembers}
              selectedMemberId={selectedMemberId}
              onSelectAll={handleSelectAll}
              onSelectMember={handleSelectMember}
            />
            <View style={styles.filtersRow}>
              <FilterPills
                options={FILTER_OPTIONS}
                selected={activeFilter}
                onSelect={(k) => setActiveFilter(k as FilterKey)}
              />
            </View>
            <SectionLabel
              label={`${filteredCards.length} photocard${filteredCards.length !== 1 ? "s" : ""}`}
              style={styles.sectionLabel}
            />
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  navTitle: {
    flex: 1,
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
    textAlign: "center",
    marginHorizontal: Theme.spacing.sm,
  },
  scroll: {
    flex: 1,
  },
  sectionLabel: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
  },
  sectionLoading: {
    paddingVertical: Theme.spacing.xl,
  },
  filtersRow: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 32,
  },
  emptyText: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
  },
  bottomPad: {
    height: 40,
  },
});
