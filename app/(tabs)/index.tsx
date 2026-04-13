import { router } from "expo-router";
import React, { useCallback } from "react";
import { ScrollView, StatusBar, StyleSheet, View } from "react-native";

import { MOCK_GROUPS_PROGRESS, MOCK_PHOTOCARDS } from "@/src/data";
import { useGroups } from "@/src/hooks/group/useGroups";
import { usePhotocardActions } from "@/src/hooks/usePhotocardActions";
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
  const { groups } = useGroups(true);

  const { handleToggleFavorite, handleToggleWishlist, handleToggleCollection } =
    usePhotocardActions();

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
        <FollowedGroupsRow
          groups={groups}
          onPressGroup={handlePressGroup}
          onPressAdd={handlePressAddGroup}
        />

        <GlowDivider />

        {/* Derniers ajouts */}
        <SectionLabel label="Derniers ajouts" />
        <RecentCardsCarousel
          cards={MOCK_PHOTOCARDS}
          onPressFavorite={handleToggleFavorite}
          onPressWishlist={handleToggleWishlist}
          onPressCollection={handleToggleCollection}
        />

        <GlowDivider />

        {/* Progression collection */}
        <SectionLabel label="Progression de ma collection" />
        <CollectionProgress groups={MOCK_GROUPS_PROGRESS} />

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
