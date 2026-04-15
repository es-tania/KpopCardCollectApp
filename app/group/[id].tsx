import { MembersGrid } from "@/src/components/member/MembersGrid";
import { SectionLabel } from "@/src/components/ui/SectionLabel";
import { useAlbums } from "@/src/hooks/album/useAlbums";
import { useGroupMembers } from "@/src/hooks/group/useGroupMembers";
import { usePhotocards } from "@/src/hooks/photocard/usePhotocards";
import { useFollowedGroups } from "@/src/hooks/useFollowedGroups";
import { useGroup } from "@/src/hooks/useGroup";
import { useScrollToTop } from "@/src/hooks/useScrollToTop";
import { useUserCollection } from "@/src/hooks/useUserCollection";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Download, Heart } from "lucide-react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlbumGrid } from "../../src/components/group/AlbumGrid";
import { GroupHeader } from "../../src/components/group/GroupHeader";
import { Colors } from "../../src/constants/colors";
import { Theme } from "../../src/constants/theme";
import { Album, Member } from "../../src/types";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GroupScreen() {
  const { scrollRef, scrollToTop } = useScrollToTop();
  const { id: groupId } = useLocalSearchParams<{ id: string }>();

  // ── Data BDD ──────────────────────────────────────────────────────────
  const { group, loading: groupLoading } = useGroup(groupId);
  const { members, loading: membersLoading } = useGroupMembers(groupId);
  const { albums, loading: albumsLoading } = useAlbums(groupId);
  const { photocards, loading: photocardsLoading } = usePhotocards({ groupId });

  const { followedIds, toggleFollow } = useFollowedGroups();
  const { collectionIds, favoriteIds, wishlistIds } = useUserCollection();

  // ── UI state ──────────────────────────────────────────────────────────
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  const isMounted = useRef(false);
  const shouldScrollTop = useRef(false);

  const savedScrollY = useRef<number>(0);
  const isSavingScroll = useRef<boolean>(true);

  const isFollowing = group ? followedIds.has(group.id) : false;

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isSavingScroll.current) {
        savedScrollY.current = e.nativeEvent.contentOffset.y;
      }
    },
    [],
  );

  // Scroll en haut uniquement au retour depuis une page enfant
  useFocusEffect(
    useCallback(() => {
      if (!isMounted.current) {
        isMounted.current = true;
        return;
      }
      if (isSavingScroll.current) {
        savedScrollY.current = 0;
        scrollToTop();
      } else {
        // Retour depuis un enfant → restaurer
        setTimeout(() => {
          scrollRef.current?.scrollTo({ y: savedScrollY.current });
        }, 50);
        isSavingScroll.current = true;
      }
    }, [scrollRef, scrollToTop]),
  );

  // Appelé quand on navigue vers membre ou album
  const handlePressMember = useCallback(
    (member: Member) => {
      isSavingScroll.current = false;
      shouldScrollTop.current = false;
      router.push(`/member/${member.id}?groupId=${groupId}`);
    },
    [groupId],
  );

  const handlePressAlbum = useCallback(
    (album: Album) => {
      isSavingScroll.current = false;
      shouldScrollTop.current = false;
      router.push(`/album/${album.id}?groupId=${groupId}`);
    },
    [groupId],
  );

  const handlePressBack = useCallback(() => {
    if (selectedAlbum) {
      setSelectedAlbum(null);
      scrollToTop();
    } else if (selectedMember) {
      setSelectedMember(null);
      scrollToTop();
    } else {
      router.back();
    }
  }, [selectedAlbum, selectedMember, scrollToTop]);

  const handleToggleFollow = useCallback(() => {
    if (group) toggleFollow(group.id);
  }, [group, toggleFollow]);

  const handleExportWishlist = useCallback(() => {
    // router.push(`/export?groupId=${groupId}`);
  }, [groupId]);

  const enrichedPhotocards = useMemo(() => {
    return photocards.map((card) => ({
      ...card,
      isInCollection: collectionIds.has(card.id),
      isFavorite: favoriteIds.has(card.id),
      isWishlisted: wishlistIds.has(card.id),
    }));
  }, [photocards, collectionIds, favoriteIds, wishlistIds]);

  // Stats par album pour l'utilisateur connecté
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

  if (groupLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!group) return null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.backBtn} onPress={handlePressBack}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>

        <View style={styles.navbarIcons}>
          <TouchableOpacity
            style={[styles.backBtn, isFollowing && styles.backBtnActive]}
            onPress={handleToggleFollow}
          >
            <Heart
              size={18}
              color={isFollowing ? Colors.danger : Colors.text}
              fill={isFollowing ? Colors.danger : "transparent"}
              strokeWidth={1.6}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleExportWishlist}
          >
            <Download size={18} color={Colors.text} strokeWidth={1.6} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* En-tête groupe */}
        <GroupHeader group={group} />

        {/* Contenu onglet Membres */}
        <SectionLabel label="Membres" style={styles.sectionLabel} />

        {membersLoading ? (
          <ActivityIndicator
            color={Colors.accent}
            style={styles.sectionLoading}
          />
        ) : (
          <MembersGrid
            members={members}
            selectedId={selectedMember?.id}
            onPressMember={handlePressMember}
          />
        )}

        {/* Contenu onglet Albums */}
        <SectionLabel
          label="Albums"
          style={[styles.sectionLabel, { marginTop: Theme.spacing.lg }]}
        />
        {albumsLoading ? (
          <ActivityIndicator
            color={Colors.accent}
            style={styles.sectionLoading}
          />
        ) : (
          <AlbumGrid albums={albumsWithStats} onPressAlbum={handlePressAlbum} />
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
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    paddingTop: 40,
  },
  navbarIcons: {
    gap: 10,
    flexDirection: "row",
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.borderRadius.full,
    backgroundColor: "rgba(9, 12, 18, 0.45)",
  },
  backBtnActive: {
    backgroundColor: "rgba(240,112,112,0.2)",
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
  sectionLoading: {
    paddingVertical: Theme.spacing.xl,
  },
  bottomPad: {
    height: 40,
  },
  content: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
  },
});
