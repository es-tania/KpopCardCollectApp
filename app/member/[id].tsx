import { MemberHeader } from "@/src/components/member/MemberHeader";
import { PhotocardMiniGrid } from "@/src/components/photocard";
import { FILTER_OPTIONS } from "@/src/constants/options/filterOptions";
import { MOCK_ALBUMS, MOCK_MEMBERS, MOCK_PHOTOCARDS } from "@/src/data";
import { usePhotocardActions } from "@/src/hooks/usePhotocardActions";
import { useScrollToTop } from "@/src/hooks/useScrollToTop";
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
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
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
import { Album, FilterKey, Member } from "../../src/types";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MemberScreen() {
  const { scrollRef, scrollToTop } = useScrollToTop();
  const { id, groupId } = useLocalSearchParams<{
    id: string;
    groupId: string;
  }>();

  // Membre actif (celui sur lequel on a cliqué + possibilité d'en changer)
  const [activeMemberId, setActiveMemberId] = useState<string>(id ?? "m1");
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const albumsScrollY = useRef<number>(0);
  const isAlbumsViewActive = useRef<boolean>(true);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isAlbumsViewActive.current) {
        albumsScrollY.current = e.nativeEvent.contentOffset.y;
      }
    },
    [selectedAlbum],
  );

  useEffect(() => {
    if (id) {
      setActiveMemberId(id);
      setSelectedAlbum(null);
      setActiveFilter("all");
      albumsScrollY.current = 0;
      scrollToTop();
    }
  }, [id]);

  const activeMember = useMemo(
    () => MOCK_MEMBERS.find((m) => m.id === activeMemberId) ?? MOCK_MEMBERS[0],
    [activeMemberId],
  );

  // Filtrage des photocards
  const filteredCards = useMemo(() => {
    let cards = MOCK_PHOTOCARDS.filter((c) => c.memberId === activeMemberId);
    if (selectedAlbum)
      cards = cards.filter((c) => c.albumId === selectedAlbum.id);

    switch (activeFilter) {
      case "collection":
        return cards.filter((c) => c.isInCollection);
      case "favorites":
        return cards.filter((c) => c.isFavorite);
      case "wishlist":
        return cards.filter((c) => c.isWishlisted);
      default:
        return cards;
    }
  }, [activeMemberId, selectedAlbum, activeFilter]);

  const handleSelectAlbum = useCallback(
    (album: Album) => {
      isAlbumsViewActive.current = false;
      setSelectedAlbum((prev) => (prev?.id === album.id ? null : album));
      scrollToTop();
    },
    [scrollToTop],
  );

  const handleBackToAlbums = useCallback(() => {
    isAlbumsViewActive.current = true;
    setSelectedAlbum(null);
    // setTimeout pour attendre le re-render de la liste avant de scroller
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: albumsScrollY.current,
      });
    }, 50);
  }, [scrollRef]);

  const handleSelectMember = useCallback(
    (member: Member) => {
      if (member.id === activeMemberId) return;
      setActiveMemberId(member.id);
      setActiveFilter("all");
    },
    [activeMemberId],
  );

  const handlePressBack = useCallback(() => {
    router.back();
    scrollToTop();
  }, [groupId, scrollToTop]);

  const { handleToggleFavorite, handleToggleWishlist, handleToggleCollection } =
    usePhotocardActions();

  const handleExport = useCallback(() => {
    console.log("export wishlist");
  }, []);

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

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* ── Header membre ── */}
        <MemberHeader member={activeMember} />

        {/* ── Sélecteur membres (scroll horizontal) ── */}
        <View style={styles.membersSection}>
          <SectionLabel label="Membres" style={styles.sectionLabel} />
          <MembersList
            members={MOCK_MEMBERS}
            selectedId={activeMemberId}
            onPressMember={handleSelectMember}
          />
        </View>

        {/* ── Filtres ── */}
        <View style={styles.filtersRow}>
          <FilterPills
            options={FILTER_OPTIONS}
            selected={activeFilter}
            onSelect={(k) => setActiveFilter(k as FilterKey)}
          />
        </View>

        {/* ── Albums ou photocards ── */}
        {!selectedAlbum ? (
          <>
            <SectionLabel
              label={"Choisissez un album"}
              style={styles.sectionLabel}
            />
            <AlbumGrid albums={MOCK_ALBUMS} onPressAlbum={handleSelectAlbum} />
          </>
        ) : (
          <>
            {/* Album sélectionné — bannière */}
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
                <Text style={styles.albumBannerTitle}>
                  {selectedAlbum.title}
                </Text>
                <Text style={styles.albumBannerSub}>
                  Appuie pour changer d'album
                </Text>
              </View>
              <ChevronLeft
                size={16}
                color={Colors.textMuted}
                strokeWidth={1.6}
                style={{ transform: [{ rotate: "180deg" }] }}
              />
            </TouchableOpacity>

            {/* Compteur */}
            <SectionLabel
              label={`${filteredCards.length} photocard${filteredCards.length !== 1 ? "s" : ""}`}
              style={styles.sectionLabel}
            />

            {filteredCards.length > 0 ? (
              <PhotocardMiniGrid
                cards={filteredCards}
                onPressFavorite={handleToggleFavorite}
                onPressWishlist={handleToggleWishlist}
                onPressCollection={handleToggleCollection}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🃏</Text>
                <Text style={styles.emptyText}>
                  Aucune photocard pour ce filtre
                </Text>
              </View>
            )}
          </>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
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
  filtersRow: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  albumBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.md,
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
