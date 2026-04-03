import { MembersGrid } from "@/src/components/member/MembersGrid";
import { SectionLabel } from "@/src/components/ui/SectionLabel";
import { MOCK_ALBUMS, MOCK_GROUPS, MOCK_MEMBERS } from "@/src/data";
import { useScrollToTop } from "@/src/hooks/useScrollToTop";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Share2 } from "lucide-react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlbumGrid } from "../../../src/components/group/AlbumGrid";
import { GroupHeader } from "../../../src/components/group/GroupHeader";
import { FilterOption } from "../../../src/components/ui/FilterPills";
import { Colors } from "../../../src/constants/colors";
import { Theme } from "../../../src/constants/theme";
import { Album, Member } from "../../../src/types";

// ─── Types locaux ─────────────────────────────────────────────────────────────

type TabKey = "members" | "albums";

const FILTER_OPTIONS: FilterOption[] = [
  { key: "all", label: "Toutes" },
  { key: "collection", label: "Collection" },
  { key: "favorites", label: "Favoris" },
  { key: "wishlist", label: "Souhaits" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GroupScreen() {
  const { scrollRef, scrollToTop } = useScrollToTop();
  const { id: groupId } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>("members");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  const isMounted = useRef(false);
  const shouldScrollTop = useRef(false);

  // Appelé quand on navigue vers membre ou album
  const handlePressMember = useCallback(
    (member: Member) => {
      shouldScrollTop.current = true;
      router.push(`/member/${member.id}?groupId=${groupId}`);
    },
    [groupId],
  );

  const handlePressAlbum = useCallback(
    (album: Album) => {
      shouldScrollTop.current = false;
      router.push(`/album/${album.id}?groupId=${groupId}`);
    },
    [groupId],
  );

  // Scroll en haut uniquement au retour depuis une page enfant
  useFocusEffect(
    useCallback(() => {
      if (!isMounted.current) {
        isMounted.current = true;
        return;
      }
      if (shouldScrollTop.current) {
        scrollToTop();
        shouldScrollTop.current = false;
      }
    }, [scrollToTop]),
  );

  // Contexte d'affichage des cartes
  const showingCards = selectedMember !== null || selectedAlbum !== null;

  const handlePressBack = useCallback(() => {
    if (selectedAlbum) {
      setSelectedAlbum(null);
      scrollToTop();
    } else if (selectedMember) {
      setSelectedMember(null);
      setActiveTab("members");
      scrollToTop();
    } else {
      router.back();
    }
  }, [selectedAlbum, selectedMember, scrollToTop]);

  const handleToggleFavorite = useCallback((cardId: string) => {
    // TODO: appel API
    console.log("toggle favorite", cardId);
  }, []);

  const handleToggleWishlist = useCallback((cardId: string) => {
    // TODO: appel API
    console.log("toggle wishlist", cardId);
  }, []);

  const handleToggleCollection = useCallback((cardId: string) => {
    // TODO: appel API
    console.log("toggle collection", cardId);
  }, []);

  const handleExportWishlist = useCallback(() => {
    // TODO: capture + partage via expo-media-library
    console.log("export wishlist");
  }, []);

  // Titre de la section cartes
  const cardsSectionTitle = useMemo(() => {
    if (selectedMember && selectedAlbum)
      return `${selectedMember.stageName} · ${selectedAlbum.title}`;
    if (selectedMember)
      return `${selectedMember.stageName} — toutes les cartes`;
    if (selectedAlbum) return selectedAlbum.title;
    return "";
  }, [selectedMember, selectedAlbum]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.backBtn} onPress={handlePressBack}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={handleExportWishlist}>
          <Share2 size={18} color={Colors.text} strokeWidth={1.6} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* En-tête groupe */}
        <GroupHeader group={MOCK_GROUPS[0]} />

        {/* Contenu onglet Membres */}
        <SectionLabel label="Membres" style={styles.sectionLabel} />

        <MembersGrid
          members={MOCK_MEMBERS}
          selectedId={selectedMember?.id}
          onPressMember={handlePressMember}
        />

        {/* Contenu onglet Albums */}
        <SectionLabel
          label="Albums"
          style={[styles.sectionLabel, { marginTop: Theme.spacing.lg }]}
        />
        {/* {!showingCards && activeTab === "albums" && ( */}
        <AlbumGrid albums={MOCK_ALBUMS} onPressAlbum={handlePressAlbum} />
        {/* )} */}

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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    // borderBottomWidth: 0.5,
    // borderBottomColor: Colors.border,
    paddingTop: 40,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.borderRadius.full,
    backgroundColor: "rgba(9, 12, 18, 0.45)",
  },
  navTitle: {
    flex: 1,
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
    textAlign: "center",
    marginHorizontal: Theme.spacing.sm,
  },
  scroll: {
    flex: 1,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    marginHorizontal: Theme.spacing.lg,
  },
  tab: {
    paddingVertical: Theme.spacing.sm + 2,
    paddingHorizontal: Theme.spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: Colors.accent,
  },
  sectionLabel: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
  },
  bottomPad: {
    height: 40,
  },
  content: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
  },
});
