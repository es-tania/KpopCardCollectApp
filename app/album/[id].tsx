import { PhotocardMiniGrid, PhotocardModal } from "@/src/components/photocard";
import { PageActionsMenu } from "@/src/components/ui/PageActionsMenu";
import {
  COLLECTION_FILTER_CHIPS,
  QuickFilterChips,
} from "@/src/components/ui/QuickFilterChips";
import { useAlbum } from "@/src/hooks/album/useAlbum";
import { useGroupMembers } from "@/src/hooks/group/useGroupMembers";
import { usePaginatedPhotocards } from "@/src/hooks/photocard/usePaginatedPhotocards";
import { useTranslation } from "@/src/hooks/useTranslation";
import { useUserCollection } from "@/src/hooks/useUserCollection";
import { useUserStats } from "@/src/hooks/useUserStats";
import { useDeletedCardsStore } from "@/src/store/deletedCardsStore";
import { useNavigationStateStore } from "@/src/store/navigationStateStore";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ChevronLeft, MoreHorizontal } from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlbumHeader, AlbumMembersSelector } from "../../src/components/album";
import { SectionLabel } from "../../src/components/ui/SectionLabel";
import { Colors } from "../../src/constants/colors";
import {
  ALL_MEMBERS_ID,
  FilterKey,
} from "../../src/constants/options/filterOptions";
import { Theme } from "../../src/constants/theme";
import { useScrollToTop } from "../../src/hooks/useScrollToTop";
import {
  Member,
  PhotocardTypeFilter,
  PhotocardWithDetails,
} from "../../src/types";

export default function AlbumScreen() {
  const { t } = useTranslation();
  const { id, groupId } = useLocalSearchParams<{
    id: string;
    groupId: string;
  }>();
  const { scrollRef, scrollToTop } = useScrollToTop();
  const { saveAlbumState, getAlbumState } = useNavigationStateStore();

  const [modalCard, setModalCard] = useState<PhotocardWithDetails | null>(null);
  const [activeType, setActiveType] = useState<PhotocardTypeFilter>("all");
  const [activeShop, setActiveShop] = useState<string>("all");
  const [menuVisible, setMenuVisible] = useState(false);

  const gridRef = useRef<any>(null);
  const currentScrollOffset = useRef(0);

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
    refresh: refreshPhotocards,
  } = usePaginatedPhotocards({
    albumId: id,
    memberId:
      selectedMemberId !== ALL_MEMBERS_ID ? selectedMemberId : undefined,
  });

  const { collectionIds, favoriteIds, wishlistIds } = useUserCollection();
  const albumStats = useUserStats({ albumId: id });
  const deletedIds = useDeletedCardsStore((s) => s.deletedIds);
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
    let cards = enrichedPhotocards.filter((c) => !deletedIds.has(c.id));
    switch (activeFilter) {
      case "collection":
        return cards.filter((c) => c.isInCollection);
      case "favorites":
        return cards.filter((c) => c.isFavorite);
      case "wishlist":
        return cards.filter((c) => c.isWishlisted);
      case "none":
        return cards.filter(
          (c) => !c.isInCollection && !c.isFavorite && !c.isWishlisted,
        );
      default:
        return cards;
    }
  }, [enrichedPhotocards, activeFilter, deletedIds]);

  useEffect(() => {
    if (!id) return;
    const saved = getAlbumState(id);
    if (saved) {
      setSelectedMemberId(saved.selectedMemberId);
      setActiveFilter(saved.activeFilter);
    }
  }, []);

  // ── Sauvegarde au départ ──────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (id) {
          saveAlbumState(id, {
            selectedMemberId,
            activeFilter,
            scrollOffset: currentScrollOffset.current,
          });
        }
      };
    }, [id, selectedMemberId, activeFilter, saveAlbumState]),
  );

  useFocusEffect(
    useCallback(() => {
      const saved = getAlbumState(id);
      if (!saved?.scrollOffset) return;
      const timer = setTimeout(() => {
        gridRef.current?.scrollToOffset({
          offset: saved.scrollOffset,
          animated: false,
        });
      }, 50);
      return () => clearTimeout(timer);
    }, []),
  );

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleSelectMember = useCallback(
    (member: Member) => {
      setSelectedMemberId((prev) =>
        prev === member.id ? ALL_MEMBERS_ID : member.id,
      );
      scrollToTop();
    },
    [scrollToTop],
  );

  const handleSelectAll = useCallback(() => {
    setSelectedMemberId(ALL_MEMBERS_ID);
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

  const handleCardUpdated = useCallback(async () => {
    const savedOffset = currentScrollOffset.current;
    await refreshPhotocards();
    setTimeout(() => {
      gridRef.current?.scrollToOffset({
        offset: savedOffset,
        animated: false,
      });
    }, 100);
  }, [refreshPhotocards]);

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
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => setMenuVisible(true)}
        >
          <MoreHorizontal size={18} color={Colors.text} strokeWidth={1.6} />
        </TouchableOpacity>
      </View>

      <PhotocardMiniGrid
        ref={gridRef}
        cards={filteredCards}
        activeType={activeType}
        onTypeChange={setActiveType}
        activeShop={activeShop}
        onShopChange={setActiveShop}
        loadingMore={loadingMore}
        onEndReached={loadMore}
        onPressCard={(card) => setModalCard(card)}
        onScroll={(offset) => {
          currentScrollOffset.current = offset;
        }}
        ListHeaderComponent={
          <>
            {album && <AlbumHeader album={{ ...album, ...albumStats }} />}
            <SectionLabel
              label={t("search.members")}
              style={styles.sectionLabel}
            />
            <AlbumMembersSelector
              members={albumMembers}
              selectedMemberId={selectedMemberId}
              onSelectAll={handleSelectAll}
              onSelectMember={handleSelectMember}
              albumId={id}
            />
            <QuickFilterChips
              options={COLLECTION_FILTER_CHIPS(activeFilter)}
              selected={activeFilter}
              onSelect={(k) => setActiveFilter(k as FilterKey)}
            />
          </>
        }
      />
      <PhotocardModal
        card={modalCard}
        visible={modalCard !== null}
        onClose={() => setModalCard(null)}
        onCardUpdated={handleCardUpdated}
      />

      <PageActionsMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        shareUrl={`kcardcollect://album/${id}`}
        shareTitle={album?.title}
        onAddCard={() => {
          handleCardUpdated;
          router.push(
            `/admin/add-photocard?albumId=${id}&groupId=${groupId}&memberId=${selectedMemberId}`,
          );
        }}
        onAddAlbum={() => {
          handleCardUpdated;
          router.push(`/admin/add-album?groupId=${groupId}`);
        }}
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
