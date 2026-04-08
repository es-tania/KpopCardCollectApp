import { PhotocardMiniGrid } from "@/src/components/photocard";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Share2 } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AlbumHeader,
  AlbumMembersSelector,
} from "../../../src/components/album";
import { FilterPills } from "../../../src/components/ui/FilterPills";
import { SectionLabel } from "../../../src/components/ui/SectionLabel";
import { Colors } from "../../../src/constants/colors";
import {
  ALL_MEMBERS_ID,
  FILTER_OPTIONS,
  FilterKey,
} from "../../../src/constants/filterOptions";
import { Theme } from "../../../src/constants/theme";
import { MOCK_ALBUMS } from "../../../src/data/mockAlbums";
import { MOCK_MEMBERS } from "../../../src/data/mockMembers";
import { MOCK_PHOTOCARDS } from "../../../src/data/mockPhotocards";
import { useScrollToTop } from "../../../src/hooks/useScrollToTop";
import { Member } from "../../../src/types";

export default function AlbumScreen() {
  const { id, groupId } = useLocalSearchParams<{
    id: string;
    groupId: string;
  }>();
  const { scrollRef, scrollToTop } = useScrollToTop();

  const [selectedMemberId, setSelectedMemberId] =
    useState<string>(ALL_MEMBERS_ID);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const album = useMemo(() => MOCK_ALBUMS.find((a) => a.id === id), [id]);

  const albumMembers = useMemo(() => {
    const memberIdsInAlbum = new Set(
      MOCK_PHOTOCARDS.filter((c) => c.albumId === id).map((c) => c.memberId),
    );
    return MOCK_MEMBERS.filter((m) => memberIdsInAlbum.has(m.id));
  }, [id]);

  const filteredCards = useMemo(() => {
    let cards = MOCK_PHOTOCARDS.filter((c) => c.albumId === id);
    if (selectedMemberId !== ALL_MEMBERS_ID) {
      cards = cards.filter((c) => c.memberId === selectedMemberId);
    }
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
  }, [id, selectedMemberId, activeFilter]);

  const handleSelectMember = useCallback((member: Member) => {
    setSelectedMemberId((prev) =>
      prev === member.id ? ALL_MEMBERS_ID : member.id,
    );
    setActiveFilter("all");
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedMemberId(ALL_MEMBERS_ID);
    setActiveFilter("all");
  }, []);

  const handlePressBack = useCallback(() => {
    handleSelectAll();
    groupId ? router.push(`/group/${groupId}`) : router.back();
  }, [groupId]);

  const handleToggleFavorite = useCallback((cardId: string) => {
    console.log("toggle favorite", cardId);
  }, []);

  const handleToggleWishlist = useCallback((cardId: string) => {
    console.log("toggle wishlist", cardId);
  }, []);

  const handleToggleCollection = useCallback((cardId: string) => {
    console.log("toggle collection", cardId);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={handlePressBack}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => console.log("export")}
        >
          <Share2 size={18} color={Colors.text} strokeWidth={1.6} />
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
        <AlbumMembersSelector
          members={albumMembers}
          selectedMemberId={selectedMemberId}
          onSelectAll={handleSelectAll}
          onSelectMember={handleSelectMember}
        />

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
