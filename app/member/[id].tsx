import { AlbumCard } from "@/src/components/album/AlbumCard";
import { MemberHeader } from "@/src/components/member/MemberHeader";
import { PhotocardMiniGrid, PhotocardModal } from "@/src/components/photocard";
import {
  COLLECTION_FILTER_CHIPS,
  QuickFilterChips,
} from "@/src/components/ui/QuickFilterChips";
import { FilterKey } from "@/src/constants/options/filterOptions";
import { useAlbums } from "@/src/hooks/album/useAlbums";
import { useGroupMembers } from "@/src/hooks/group/useGroupMembers";
import { usePaginatedPhotocards } from "@/src/hooks/photocard/usePaginatedPhotocards";
import { useTranslation } from "@/src/hooks/useTranslation";
import { useUserCollection } from "@/src/hooks/useUserCollection";
import { useUserStats } from "@/src/hooks/useUserStats";
import { useDeletedCardsStore } from "@/src/store/deletedCardsStore";
import { useNavigationStateStore } from "@/src/store/navigationStateStore";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Share2 } from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MembersList } from "../../src/components/member/MembersList";
import { SectionLabel } from "../../src/components/ui/SectionLabel";
import { Colors } from "../../src/constants/colors";
import { Theme } from "../../src/constants/theme";
import {
  Album,
  Member,
  PhotocardTypeFilter,
  PhotocardWithDetails,
} from "../../src/types";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MemberScreen() {
  const { t } = useTranslation();
  const { id, groupId } = useLocalSearchParams<{
    id: string;
    groupId: string;
  }>();
  const { saveMemberState, getMemberState } = useNavigationStateStore();

  // ── UI state ──────────────────────────────────────────────────────────
  const [activeMemberId, setActiveMemberId] = useState<string>(id ?? "");
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [modalCard, setModalCard] = useState<PhotocardWithDetails | null>(null);
  const [activeType, setActiveType] = useState<PhotocardTypeFilter>("all");
  const [activeShop, setActiveShop] = useState<string>("all");

  const memberStats = useUserStats({ memberId: activeMemberId });
  const albumFlatListRef = useRef<FlatList>(null);
  const photocardsScrollRef = useRef<any>(null);

  useEffect(() => {
    if (!groupId) return;
    const saved = getMemberState(groupId);
    if (saved) {
      setActiveMemberId(saved.activeMemberId);
      setSelectedAlbum(saved.selectedAlbum);
      setActiveFilter(saved.activeFilter);
    } else if (id) {
      setActiveMemberId(id);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (groupId) {
          saveMemberState(groupId, {
            activeMemberId,
            selectedAlbum,
            activeFilter,
            scrollOffset: currentScrollOffset.current,
          });
        }
      };
    }, [groupId, activeMemberId, selectedAlbum, activeFilter, saveMemberState]),
  );

  // ── Ref pour tracker la position scroll ──────────────────────────────
  const currentScrollOffset = useRef(0);

  // ── Restaure le scroll au retour ─────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      const saved = getMemberState(groupId);
      if (!saved?.scrollOffset) return;

      // Petit délai pour laisser le layout se faire
      const timer = setTimeout(() => {
        if (selectedAlbum && photocardsScrollRef.current) {
          photocardsScrollRef.current?.scrollToOffset({
            offset: saved.scrollOffset,
            animated: false,
          });
        } else {
          albumFlatListRef.current?.scrollToOffset({
            offset: saved.scrollOffset,
            animated: false,
          });
        }
      }, 50);

      return () => clearTimeout(timer);
    }, []), // ← [] pour ne restaurer qu'au premier focus après navigation
  );

  const handlePressCard = useCallback((card: PhotocardWithDetails) => {
    setModalCard(card);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalCard(null);
  }, []);

  // ── Data BDD ──────────────────────────────────────────────────────────
  const { membersWithStats, loading: membersLoading } =
    useGroupMembers(groupId);
  const { albums, loading: albumsLoading } = useAlbums(groupId);

  const {
    photocards,
    loading: photocardsLoading,
    refresh: refreshPhotocards,
  } = usePaginatedPhotocards({
    memberId: activeMemberId,
    albumId: selectedAlbum?.id ?? undefined,
  });

  const { collectionIds, favoriteIds, wishlistIds } = useUserCollection();
  const deletedIds = useDeletedCardsStore((s) => s.deletedIds);

  // ── Membre actif ──────────────────────────────────────────────────────
  const activeMember = useMemo(
    () =>
      membersWithStats.find((m) => m.id === activeMemberId) ??
      membersWithStats[0] ??
      null,
    [membersWithStats, activeMemberId],
  );

  // ── Photocards enrichies ──────────────────────────────────────────────
  const enrichedPhotocards = useMemo(
    () =>
      photocards.map((card) => ({
        ...card,
        isInCollection: collectionIds.has(card.id),
        isFavorite: favoriteIds.has(card.id),
        isWishlisted: wishlistIds.has(card.id),
      })),
    [photocards, collectionIds, favoriteIds, wishlistIds],
  );

  // ── Stats albums depuis IDs bruts ─────────────────────────────────────
  const albumStatsMap = useMemo(() => {
    const map = new Map<
      string,
      {
        totalPhotocards: number;
        ownedPhotocards: number;
        wishlistPhotocards: number;
        completionPercentage: number;
      }
    >();
    albums.forEach((album) => {
      const ids = photocards
        .filter((c) => c.albumId === album.id)
        .map((c) => c.id);
      const total = ids.length;
      const owned = ids.filter((id) => collectionIds.has(id)).length;
      const wished = ids.filter((id) => wishlistIds.has(id)).length;
      map.set(album.id, {
        totalPhotocards: total,
        ownedPhotocards: owned,
        wishlistPhotocards: wished,
        completionPercentage: total > 0 ? Math.round((owned / total) * 100) : 0,
      });
    });
    return map;
  }, [albums, photocards, collectionIds, wishlistIds]);

  const albumsWithStats = useMemo(
    () =>
      albums.map((album) => ({
        ...album,
        ...(albumStatsMap.get(album.id) ?? {
          totalPhotocards: 0,
          ownedPhotocards: 0,
          wishlistPhotocards: 0,
          completionPercentage: 0,
        }),
      })),
    [albums, albumStatsMap],
  );

  // ── Rows d'albums ─────────────────────────────────────────────────────
  const albumRows = useMemo(() => {
    const rows: Album[][] = [];
    for (let i = 0; i < albumsWithStats.length; i += 2) {
      rows.push(albumsWithStats.slice(i, i + 2));
    }
    return rows;
  }, [albumsWithStats]);

  // ── Handlers stables par album ────────────────────────────────────────
  const albumHandlers = useMemo(() => {
    const map = new Map<string, () => void>();
    albumsWithStats.forEach((album) => {
      map.set(album.id, () =>
        setSelectedAlbum((prev) => (prev?.id === album.id ? null : album)),
      );
    });
    return map;
  }, [albumsWithStats]);

  // ── Photocards filtrées ───────────────────────────────────────────────
  const filteredCards = useMemo(() => {
    let cards = enrichedPhotocards.filter((c) => !deletedIds.has(c.id));
    if (selectedAlbum) {
      cards = cards.filter((c) => c.albumId === selectedAlbum.id);
    }
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
  }, [enrichedPhotocards, selectedAlbum, activeFilter, deletedIds]);

  // ── Sync id depuis les params ─────────────────────────────────────────
  useEffect(() => {
    if (id) {
      setActiveMemberId(id);
      setSelectedAlbum(null);
      setActiveFilter("all");
    }
  }, [id]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleBackToAlbums = useCallback(() => setSelectedAlbum(null), []);
  const handlePressBack = useCallback(() => router.back(), []);
  const handleExport = useCallback(() => {
    router.push(`/export?memberId=${activeMemberId}`);
  }, [activeMemberId]);

  const handleSelectMember = useCallback(
    (member: Member) => {
      if (member.id === activeMemberId) return;
      setActiveMemberId(member.id);
    },
    [activeMemberId],
  );

  const handleCardUpdated = useCallback(async () => {
    const savedOffset = currentScrollOffset.current;

    await refreshPhotocards();

    setTimeout(() => {
      photocardsScrollRef.current?.scrollToOffset({
        offset: savedOffset,
        animated: false,
      });
    }, 100);
  }, [refreshPhotocards]);

  // ── Header statique — membres + filtres ──────────────────────────────
  const StaticHeader = useMemo(
    () => (
      <>
        {!selectedAlbum && activeMember && (
          <MemberHeader member={{ ...activeMember, ...memberStats }} />
        )}
        <View style={styles.membersSection}>
          <SectionLabel
            label={t("search.members")}
            style={styles.sectionLabel}
          />
          <MembersList
            members={membersWithStats}
            selectedId={activeMemberId}
            onPressMember={handleSelectMember}
          />
        </View>
        {selectedAlbum && (
          <QuickFilterChips
            options={COLLECTION_FILTER_CHIPS(activeFilter)}
            selected={activeFilter}
            onSelect={(k) => setActiveFilter(k as FilterKey)}
          />
        )}
      </>
    ),
    [
      activeMember,
      memberStats,
      membersWithStats,
      activeMemberId,
      handleSelectMember,
      activeFilter,
      selectedAlbum,
    ],
  );

  // ── Header albums — static + label + spinner ──────────────────────────
  const AlbumsListHeader = useMemo(
    () => (
      <>
        {StaticHeader}
        <SectionLabel label={t("search.albums")} style={styles.sectionLabel} />
        {albumsLoading && (
          <ActivityIndicator
            color={Colors.accent}
            style={styles.sectionLoading}
          />
        )}
      </>
    ),
    [StaticHeader, albumsLoading],
  );

  // ── renderAlbumRow — identique à group/[id].tsx ───────────────────────
  const renderAlbumRow = useCallback(
    ({ item: row }: { item: Album[] }) => (
      <View style={styles.albumRow}>
        {row.map((album) => (
          <AlbumCard
            key={album.id}
            album={album}
            memberId={activeMemberId}
            onPress={albumHandlers.get(album.id)!}
          />
        ))}
        {row.length < 2 && <View style={styles.albumCardEmpty} />}
      </View>
    ),
    [albumHandlers],
  );

  // ── Header vue photocards ─────────────────────────────────────────────
  const PhotocardsHeader = useMemo(() => <>{StaticHeader}</>, [StaticHeader]);

  // ── Loading ───────────────────────────────────────────────────────────
  if (membersLoading) {
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
      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={handlePressBack}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={handleExport}>
          <Share2 size={18} color={Colors.text} strokeWidth={1.6} />
        </TouchableOpacity>
      </View>

      {/* Bannière album sélectionné */}
      {selectedAlbum && (
        <TouchableOpacity
          style={styles.albumBanner}
          onPress={handleBackToAlbums}
          activeOpacity={0.8}
        >
          {selectedAlbum.coverUrl && (
            <Image
              source={
                typeof selectedAlbum.coverUrl === "string"
                  ? { uri: selectedAlbum.coverUrl }
                  : (selectedAlbum.coverUrl as any)
              }
              style={styles.albumBannerCover}
              resizeMode="cover"
            />
          )}
          <View style={styles.albumBannerInfo}>
            <Text style={styles.albumBannerTitle}>{selectedAlbum.title}</Text>
            <Text style={styles.albumBannerSub}>{t("fields.album")}</Text>
          </View>
          <ChevronLeft size={20} color={Colors.text} strokeWidth={1.6} />
        </TouchableOpacity>
      )}

      {/* ── Vue albums — FlatList natif, toujours montée ── */}
      <View style={[styles.fill, selectedAlbum ? styles.hidden : null]}>
        <FlatList
          data={albumRows}
          renderItem={renderAlbumRow}
          keyExtractor={(_, i) => `album-row-${i}`}
          ListHeaderComponent={AlbumsListHeader}
          ListFooterComponent={<View style={styles.bottomPad} />}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={4}
          windowSize={8}
          initialNumToRender={6}
          getItemLayout={(_, index) => ({
            length: 160,
            offset: 160 * index,
            index,
          })}
        />
      </View>

      {/* ── Vue photocards — montée seulement quand album sélectionné ── */}
      {selectedAlbum &&
        (photocardsLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Colors.accent} />
          </View>
        ) : (
          <PhotocardMiniGrid
            ref={photocardsScrollRef}
            cards={filteredCards}
            activeType={activeType}
            onTypeChange={setActiveType}
            activeShop={activeShop}
            onShopChange={setActiveShop}
            ListHeaderComponent={PhotocardsHeader}
            onPressCard={handlePressCard}
            onScroll={(offset) => {
              currentScrollOffset.current = offset;
            }}
          />
        ))}

      <PhotocardModal
        card={modalCard}
        visible={modalCard !== null}
        onClose={handleCloseModal}
        onCardUpdated={handleCardUpdated}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  fill: { flex: 1 },
  hidden: { display: "none" },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
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
  membersSection: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    paddingBottom: Theme.spacing.lg,
  },
  sectionLabel: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
  },
  sectionLoading: { paddingVertical: Theme.spacing.xl },
  filtersRow: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    marginBottom: Theme.spacing.md,
  },
  filterToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  filterToggleText: {
    flex: 1,
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  filterToggleTextActive: {
    color: Colors.accent,
  },
  filterActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },

  // ── Albums ────────────────────────────────────────────────────────────
  albumRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: 10,
  },
  albumCardEmpty: { flex: 1 },

  // ── Album banner ──────────────────────────────────────────────────────
  albumBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
    marginHorizontal: Theme.spacing.lg,
    marginVertical: Theme.spacing.md,
    padding: Theme.spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  albumBannerCover: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.sm,
  },
  albumBannerInfo: { flex: 1 },
  albumBannerTitle: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
  },
  albumBannerSub: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  bottomPad: { height: 40 },
});
