import { MemberHeader } from "@/src/components/member/MemberHeader";
import { PhotocardMiniGrid } from "@/src/components/photocard";
import {
  FILTER_OPTIONS,
  FilterKey,
} from "@/src/constants/options/filterOptions";
import { useAlbums } from "@/src/hooks/album/useAlbums";
import { useGroupMembers } from "@/src/hooks/group/useGroupMembers";
import { usePaginatedPhotocards } from "@/src/hooks/usePaginatedPhotocards";
import { useScrollToTop } from "@/src/hooks/useScrollToTop";
import { useUserCollection } from "@/src/hooks/useUserCollection";
import { router, useLocalSearchParams } from "expo-router";
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
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlbumGrid } from "../../src/components/group/AlbumGrid";
import { MembersList } from "../../src/components/member/MembersList";
import { FilterPills } from "../../src/components/ui/FilterPills";
import { SectionLabel } from "../../src/components/ui/SectionLabel";
import { Colors } from "../../src/constants/colors";
import { Theme } from "../../src/constants/theme";
import { Album, Member } from "../../src/types";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MemberScreen() {
  const { scrollRef, scrollToTop } = useScrollToTop();
  const { id, groupId } = useLocalSearchParams<{
    id: string;
    groupId: string;
  }>();

  // ── UI state ──────────────────────────────────────────────────────────
  const [activeMemberId, setActiveMemberId] = useState<string>(id ?? "");
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const albumsScrollY = useRef<number>(0);
  const isAlbumsViewActive = useRef<boolean>(true);

  // ── Data BDD ──────────────────────────────────────────────────────────
  const { members, loading: membersLoading } = useGroupMembers(groupId);
  const { albums, loading: albumsLoading } = useAlbums(groupId);

  // Photocards du membre actif
  const { photocards, loading: photocardsLoading } = usePaginatedPhotocards({
    memberId: activeMemberId,
    albumId: selectedAlbum?.id ?? undefined,
  });

  // États collection/favoris/wishlist
  const { collectionIds, favoriteIds, wishlistIds } = useUserCollection();

  // ── Membre actif ──────────────────────────────────────────────────────
  const activeMember = useMemo(
    () => members.find((m) => m.id === activeMemberId) ?? members[0] ?? null,
    [members, activeMemberId],
  );

  // ── Photocards enrichies ──────────────────────────────────────────────
  const enrichedPhotocards = useMemo(() => {
    return photocards.map((card) => ({
      ...card,
      isInCollection: collectionIds.has(card.id),
      isFavorite: favoriteIds.has(card.id),
      isWishlisted: wishlistIds.has(card.id),
    }));
  }, [photocards, collectionIds, favoriteIds, wishlistIds]);

  // Albums enrichis avec les stats de l'utilisateur pour ce membre
  const albumsWithStats = useMemo(() => {
    return albums.map((album) => {
      const albumCards = enrichedPhotocards.filter(
        (c) => c.albumId === album.id,
      );
      return {
        ...album,
        totalPhotocards: albumCards.length,
        ownedPhotocards: albumCards.filter((c) => c.isInCollection).length,
        wishlistPhotocards: albumCards.filter((c) => c.isWishlisted).length,
        completionPercentage:
          albumCards.length > 0
            ? Math.round(
                (albumCards.filter((c) => c.isInCollection).length /
                  albumCards.length) *
                  100,
              )
            : 0,
      };
    });
  }, [albums, enrichedPhotocards]);

  // ── Photocards filtrées ───────────────────────────────────────────────
  const filteredCards = useMemo(() => {
    let cards = enrichedPhotocards;
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
  }, [enrichedPhotocards, selectedAlbum, activeFilter]);

  // ── Sync id depuis les params ─────────────────────────────────────────
  useEffect(() => {
    if (id) {
      setActiveMemberId(id);
      setSelectedAlbum(null);
      setActiveFilter("all");
      albumsScrollY.current = 0;
      scrollToTop();
    }
  }, [id]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleSelectAlbum = useCallback((album: Album) => {
    isAlbumsViewActive.current = false;
    setSelectedAlbum((prev) => (prev?.id === album.id ? null : album));
  }, []);

  const handleBackToAlbums = useCallback(() => {
    isAlbumsViewActive.current = true;
    setSelectedAlbum(null);
    scrollToTop();
  }, []);

  const handleSelectMember = useCallback(
    (member: Member) => {
      if (member.id === activeMemberId) return;
      setActiveMemberId(member.id);
      setActiveFilter("all");
      albumsScrollY.current = 0;
    },
    [activeMemberId],
  );

  const handlePressBack = useCallback(() => {
    router.back();
  }, []);

  const handleExport = useCallback(() => {
    router.push(`/export?memberId=${activeMemberId}`);
  }, [activeMemberId]);

  // ── Header pour le FlatList ───────────────────────────────────────────
  const ListHeader = useMemo(
    () => (
      <>
        {/* Header membre */}
        {activeMember && <MemberHeader member={activeMember} />}

        {/* Sélecteur membres */}
        <View style={styles.membersSection}>
          <SectionLabel label="Membres" style={styles.sectionLabel} />
          <MembersList
            members={members}
            selectedId={activeMemberId}
            onPressMember={handleSelectMember}
          />
        </View>

        {/* Filtres */}
        <View style={styles.filtersRow}>
          <FilterPills
            options={FILTER_OPTIONS}
            selected={activeFilter}
            onSelect={(k) => setActiveFilter(k as FilterKey)}
          />
        </View>

        {/* Albums ou bannière album sélectionné */}
        {!selectedAlbum && (
          <>
            <SectionLabel
              label="Choisissez un album"
              style={styles.sectionLabel}
            />
            {albumsLoading ? (
              <ActivityIndicator
                color={Colors.accent}
                style={styles.sectionLoading}
              />
            ) : (
              <AlbumGrid
                albums={albumsWithStats}
                onPressAlbum={handleSelectAlbum}
              />
            )}
          </>
        )}
      </>
    ),
    [
      activeMember,
      members,
      activeMemberId,
      handleSelectMember,
      activeFilter,
      selectedAlbum,
      albumsLoading,
      albumsWithStats,
      handleSelectAlbum,
      handleBackToAlbums,
      filteredCards.length,
    ],
  );

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

      {selectedAlbum && (
        <TouchableOpacity
          style={styles.albumBanner}
          onPress={handleBackToAlbums}
          activeOpacity={0.8}
        >
          {selectedAlbum.coverUrl && (
            <Image
              source={selectedAlbum.coverUrl as any}
              style={styles.albumBannerCover}
              resizeMode="cover"
            />
          )}
          <View style={styles.albumBannerInfo}>
            <Text style={styles.albumBannerTitle}>{selectedAlbum.title}</Text>
            <Text style={styles.albumBannerSub}>
              Appuie pour changer d'album
            </Text>
          </View>
          <ChevronLeft size={20} color={Colors.text} strokeWidth={1.6} />
        </TouchableOpacity>
      )}

      {/* ── Contenu — FlatList gère tout ── */}
      {!selectedAlbum ? (
        <PhotocardMiniGrid
          cards={[]}
          ListHeaderComponent={ListHeader}
          hideEmpty
        />
      ) : photocardsLoading ? (
        <>
          {/* Header + spinner */}
          <PhotocardMiniGrid
            cards={[]}
            ListHeaderComponent={
              <>
                {ListHeader}
                <ActivityIndicator
                  color={Colors.accent}
                  style={styles.sectionLoading}
                />
              </>
            }
          />
        </>
      ) : (
        // Mode photocards — FlatList avec infinite scroll
        <PhotocardMiniGrid
          cards={filteredCards}
          ListHeaderComponent={ListHeader}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  membersSection: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    paddingBottom: Theme.spacing.lg,
  },
  sectionLabel: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
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
    marginBottom: Theme.spacing.md,
  },
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
  albumBannerInfo: {
    flex: 1,
  },
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
