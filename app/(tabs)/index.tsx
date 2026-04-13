import { router } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";

import { useGroups } from "@/src/hooks/group/useGroups";
import { usePhotocards } from "@/src/hooks/photocard/usePhotocards";
import { useFollowedGroups } from "@/src/hooks/useFollowedGroups";
import { useRecentPhotocards } from "@/src/hooks/useRecentPhotocards";
import { useUserCollection } from "@/src/hooks/useUserCollection";
import { SafeAreaView } from "react-native-safe-area-context";
import { CollectionProgress } from "../../src/components/home/CollectionProgress";
import { FollowedGroupsRow } from "../../src/components/home/FollowedGroupsRow";
import { RecentCardsCarousel } from "../../src/components/home/RecentCardsCarousel";
import { GlowDivider } from "../../src/components/ui/GlowDivider";
import { SectionLabel } from "../../src/components/ui/SectionLabel";
import { Colors } from "../../src/constants/colors";
import { Theme } from "../../src/constants/theme";

// ─── Composant principal ─────────────────────────────────────────────────────

export default function HomeScreen() {
  // ── Data BDD ──────────────────────────────────────────────────────────
  const { followedGroups, loading: followedLoading } = useFollowedGroups();
  const { groups, loading: groupsLoading } = useGroups(true);
  const { photocards, loading: photocardsLoading } = useRecentPhotocards(10);
  const followedGroupIds = followedGroups.map((g) => g.id).join(",");
  const { photocards: allPhotocards } = usePhotocards({});

  const {
    collectionIds,
    favoriteIds,
    wishlistIds,
    toggleCollection,
    toggleFavorite,
    toggleWishlist,
  } = useUserCollection();

  // ── Photocards enrichies ──────────────────────────────────────────────
  const enrichedPhotocards = photocards.map((card) => ({
    ...card,
    isInCollection: collectionIds.has(card.id),
    isFavorite: favoriteIds.has(card.id),
    isWishlisted: wishlistIds.has(card.id),
  }));

  // ── Progression — uniquement les groupes suivis ───────────────────────
  const followedGroupsWithProgress = useMemo(() => {
    return followedGroups.map((group) => {
      // Photocards de ce groupe
      const groupCards = allPhotocards.filter((c) => c.groupId === group.id);

      const owned = groupCards.filter((c) => collectionIds.has(c.id)).length;

      const wishlisted = groupCards.filter((c) => wishlistIds.has(c.id)).length;

      return {
        ...group,
        ownedPhotocards: owned,
        wishlistPhotocards: wishlisted,
        completionPercentage:
          group.totalPhotocards > 0
            ? Math.round((owned / group.totalPhotocards) * 100)
            : 0,
      };
    });
  }, [followedGroups, allPhotocards, collectionIds, wishlistIds]);

  const handlePressGroup = useCallback((groupId: string) => {
    router.push(`/group/${groupId}`);
  }, []);

  const handlePressAddGroup = useCallback(() => {
    router.push("/search");
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Contenu scrollable */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Groupes suivis */}
        <SectionLabel label="Groupes suivis" />
        {followedLoading ? (
          <ActivityIndicator
            color={Colors.accent}
            style={styles.sectionLoading}
          />
        ) : (
          <FollowedGroupsRow
            groups={followedGroups}
            onPressGroup={handlePressGroup}
            onPressAdd={handlePressAddGroup}
          />
        )}

        <GlowDivider />

        {/* Derniers ajouts */}
        <SectionLabel label="Derniers ajouts" />
        {photocardsLoading ? (
          <ActivityIndicator
            color={Colors.accent}
            style={styles.sectionLoading}
          />
        ) : (
          <RecentCardsCarousel
            cards={enrichedPhotocards}
            onPressFavorite={(id) => toggleFavorite(id)}
            onPressWishlist={(id) => toggleWishlist(id)}
            onPressCollection={(id) => toggleCollection(id)}
          />
        )}

        <GlowDivider />

        {/* Progression collection */}
        <SectionLabel label="Progression de ma collection" />
        {groupsLoading ? (
          <ActivityIndicator
            color={Colors.accent}
            style={styles.sectionLoading}
          />
        ) : (
          <CollectionProgress groups={followedGroupsWithProgress} />
        )}

        {/* Padding bas */}
        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingTop: Theme.spacing.lg,
  },
  sectionLoading: {
    paddingVertical: Theme.spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.lg,
  },
  headerSub: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
  },
  headerTitle: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnText: {
    fontSize: 16,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.lg,
    backgroundColor: Colors.bg,
  },
  bottomPad: {
    height: Theme.spacing.xl,
  },
});
