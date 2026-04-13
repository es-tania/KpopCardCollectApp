import { PhotocardMiniGrid } from "@/src/components/photocard";
import { useGroupMembers } from "@/src/hooks/group/useGroupMembers";
import { usePhotocards } from "@/src/hooks/photocard/usePhotocards";
import { useAlbum } from "@/src/hooks/useAlbum";
import { useUserCollection } from "@/src/hooks/useUserCollection";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Download } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
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
  const { members, loading: membersLoading } = useGroupMembers(groupId);
  const { photocards, loading: photocardsLoading } = usePhotocards({
    albumId: id,
  });

  const {
    collectionIds,
    favoriteIds,
    wishlistIds,
    toggleCollection,
    toggleFavorite,
    toggleWishlist,
  } = useUserCollection();

  // ── Membres présents dans cet album ───────────────────────────────────
  const albumMembers = useMemo(() => {
    const memberIdsInAlbum = new Set(photocards.map((c) => c.memberId));
    return members.filter((m) => memberIdsInAlbum.has(m.id));
  }, [photocards, members]);

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
    let cards = enrichedPhotocards;

    // Filtre par membre
    if (selectedMemberId !== ALL_MEMBERS_ID) {
      cards = cards.filter((c) => c.memberId === selectedMemberId);
    }

    // Filtre par état
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
  }, [enrichedPhotocards, selectedMemberId, activeFilter]);

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

  if (albumLoading) {
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

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header album */}
        {album && <AlbumHeader album={album} />}

        {/* Sélecteur membres */}
        <SectionLabel label="Membres" style={styles.sectionLabel} />
        {membersLoading ? (
          <ActivityIndicator
            color={Colors.accent}
            style={styles.sectionLoading}
          />
        ) : (
          <AlbumMembersSelector
            members={albumMembers.map((m) => {
              const memberCards = enrichedPhotocards.filter(
                (c) => c.memberId === m.id,
              );
              return {
                ...m,
                // Stats spécifiques à cet album
                totalPhotocards: memberCards.length,
                ownedPhotocards: memberCards.filter((c) => c.isInCollection)
                  .length,
                wishlistPhotocards: memberCards.filter((c) => c.isWishlisted)
                  .length,
              };
            })}
            selectedMemberId={selectedMemberId}
            onSelectAll={handleSelectAll}
            onSelectMember={handleSelectMember}
          />
        )}

        {/* Filtres */}
        <View style={styles.filtersRow}>
          <FilterPills
            options={FILTER_OPTIONS}
            selected={activeFilter}
            onSelect={(k) => setActiveFilter(k as FilterKey)}
          />
        </View>

        {/* Photocards */}
        <SectionLabel
          label={`${filteredCards.length} photocard${filteredCards.length !== 1 ? "s" : ""}`}
          style={styles.sectionLabel}
        />

        {photocardsLoading ? (
          <ActivityIndicator
            color={Colors.accent}
            style={styles.sectionLoading}
          />
        ) : filteredCards.length > 0 ? (
          <PhotocardMiniGrid
            cards={filteredCards}
            onPressFavorite={(cardId) => toggleFavorite(cardId)}
            onPressWishlist={(cardId) => toggleWishlist(cardId)}
            onPressCollection={(cardId) => toggleCollection(cardId)}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🃏</Text>
            <Text style={styles.emptyText}>
              Aucune photocard pour ce filtre
            </Text>
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
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
