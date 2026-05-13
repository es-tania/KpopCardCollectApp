import { useTranslation } from "@/src/hooks/useTranslation";
import { useCollectionStore } from "@/src/store/collectionStore";
import { router } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useFollowedGroups } from "@/src/hooks/group/useFollowedGroups";
import { useGroups } from "@/src/hooks/group/useGroups";
import { useRecentPhotocards } from "@/src/hooks/photocard/useRecentPhotocards";
import { useUserCollection } from "@/src/hooks/useUserCollection";
import { CollectionProgress } from "../../src/components/home/CollectionProgress";
import { FollowedGroupsRow } from "../../src/components/home/FollowedGroupsRow";
import { RecentCardsCarousel } from "../../src/components/home/RecentCardsCarousel";
import { SectionLabel } from "../../src/components/ui/SectionLabel";
import { Colors } from "../../src/constants/colors";
import { Theme } from "../../src/constants/theme";

import {
  BookMarked,
  Heart,
  PackageSearch,
  ShoppingCart,
  Sparkles,
} from "lucide-react-native";

// ─── Raccourcis ───────────────────────────────────────────────────────────────

interface ShortcutItem {
  id: string;
  label: string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  onPress: () => void;
}

const ShortcutCard: React.FC<ShortcutItem> = ({
  label,
  sub,
  icon,
  color,
  bg,
  onPress,
}) => (
  <TouchableOpacity
    style={[styles.shortcut, { borderColor: color + "30" }]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <View style={[styles.shortcutIcon, { backgroundColor: bg }]}>{icon}</View>
    <Text style={styles.shortcutLabel}>{label}</Text>
    {sub && <Text style={[styles.shortcutSub, { color }]}>{sub}</Text>}
  </TouchableOpacity>
);

// ─── Composant principal ──────────────────────────────────────────────────────

export default function HomeScreen() {
  const { t } = useTranslation();
  const { followedGroups, loading: followedLoading } = useFollowedGroups();
  const { groups, loading: groupsLoading } = useGroups(true);
  const { photocards, loading: photocardsLoading } = useRecentPhotocards(10);
  const {
    collectionIds,
    favoriteIds,
    wishlistIds,
    toggleCollection,
    toggleFavorite,
    toggleWishlist,
  } = useUserCollection();

  const { collectionIds: allCollectionIds, wishlistIds: allWishlistIds } =
    useCollectionStore();

  const enrichedPhotocards = photocards.map((card) => ({
    ...card,
    isInCollection: collectionIds.has(card.id),
    isFavorite: favoriteIds.has(card.id),
    isWishlisted: wishlistIds.has(card.id),
  }));

  const handlePressGroup = useCallback(
    (groupId: string) => router.push(`/group/${groupId}`),
    [],
  );
  const handlePressAddGroup = useCallback(() => router.push("/search"), []);

  const shortcuts: ShortcutItem[] = [
    {
      id: "collection",
      label: "Collection",
      sub: `${allCollectionIds.size} cartes`,
      icon: <BookMarked size={20} color={Colors.accent} strokeWidth={1.6} />,
      color: Colors.accent,
      bg: "rgba(145,126,255,0.12)",
      onPress: () => router.push("/my-cards?mode=collection"),
    },
    {
      id: "missing",
      label: "Manquantes",
      icon: <PackageSearch size={20} color={Colors.danger} strokeWidth={1.6} />,
      color: Colors.danger,
      bg: "rgba(240,112,112,0.12)",
      onPress: () => router.push("/missing-cards"),
    },
    {
      id: "wishlist",
      label: "Wishlist",
      sub: `${allWishlistIds.size} cartes`,
      icon: <ShoppingCart size={20} color={Colors.accent2} strokeWidth={1.6} />,
      color: Colors.accent2,
      bg: "rgba(0,219,233,0.1)",
      onPress: () => router.push("/my-cards?mode=wishlist"),
    },
    {
      id: "favorites",
      label: "Favoris",
      icon: <Heart size={20} color="#DAA520" strokeWidth={1.6} />,
      color: "#DAA520",
      bg: "rgba(218,165,32,0.12)",
      onPress: () => router.push("/my-cards?mode=favorites"),
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero header ── */}
        <View style={styles.hero}>
          <View style={styles.heroLeft}>
            <View style={styles.heroBadge}>
              <Sparkles size={11} color={Colors.accent} strokeWidth={2} />
              <Text style={styles.heroBadgeText}>KCardCollect</Text>
            </View>
            <Text style={styles.heroTitle}>Ma{"\n"}Collection</Text>
            <Text style={styles.heroSub}>
              {allCollectionIds.size} photocards collectées
            </Text>
          </View>
          {/* Carte décorative */}
          <View style={styles.heroCardStack}>
            <View style={[styles.heroCard, styles.heroCardBack2]} />
            <View style={[styles.heroCard, styles.heroCardBack1]} />
            <View style={[styles.heroCard, styles.heroCardFront]}>
              <Image
                source={require("../../assets/images/icon.png")}
                style={styles.heroCardImage}
                resizeMode="cover"
              />
            </View>
          </View>
        </View>

        {/* ── Raccourcis ── */}
        <View style={styles.shortcuts}>
          {shortcuts.map((s) => (
            <ShortcutCard key={s.id} {...s} />
          ))}
        </View>

        {/* ── Groupes suivis ── */}
        <View style={styles.section}>
          <SectionLabel label={t("home.followedGroups")} />
          {followedLoading ? (
            <ActivityIndicator color={Colors.accent} style={styles.loader} />
          ) : (
            <FollowedGroupsRow
              groups={followedGroups}
              onPressGroup={handlePressGroup}
              onPressAdd={handlePressAddGroup}
            />
          )}
        </View>

        {/* ── Séparateur décoratif ── */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerDot} />
          <View style={styles.dividerLine} />
        </View>

        {/* ── Derniers ajouts ── */}
        <View style={styles.section}>
          <SectionLabel label={t("home.recentCards")} />
          {photocardsLoading ? (
            <ActivityIndicator color={Colors.accent} style={styles.loader} />
          ) : (
            <RecentCardsCarousel
              cards={enrichedPhotocards}
              onPressFavorite={(id) => toggleFavorite(id)}
              onPressWishlist={(id) => toggleWishlist(id)}
              onPressCollection={(id) => toggleCollection(id)}
            />
          )}
        </View>

        {/* ── Séparateur décoratif ── */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerDot} />
          <View style={styles.dividerLine} />
        </View>

        {/* ── Progression ── */}
        <View style={styles.section}>
          <SectionLabel label={t("home.collectionProgress")} />
          {groupsLoading ? (
            <ActivityIndicator color={Colors.accent} style={styles.loader} />
          ) : (
            <CollectionProgress groups={followedGroups} />
          )}
        </View>

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
  scroll: { flex: 1 },
  scrollContent: { backgroundColor: Colors.bg },
  loader: { paddingVertical: Theme.spacing.xl },
  bottomPad: { height: Theme.spacing.xl * 2 },
  section: { paddingHorizontal: Theme.spacing.lg },

  // ── Hero ──────────────────────────────────────────────────────────────
  hero: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
  },
  heroLeft: { gap: 6 },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(145,126,255,0.12)",
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    borderWidth: 0.5,
    borderColor: Colors.accent + "40",
  },
  heroBadgeText: {
    fontSize: Theme.fontSize.xs,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.semibold,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: Colors.text,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textMuted,
  },

  // ── Carte décorative ──────────────────────────────────────────────────
  heroCardStack: {
    width: 90,
    height: 130,
    position: "relative",
  },
  heroCard: {
    position: "absolute",
    width: 80,
    height: 120,
    borderRadius: 10,
    overflow: "hidden",
  },
  heroCardBack2: {
    backgroundColor: Colors.surface2,
    borderWidth: 0.5,
    borderColor: Colors.border,
    transform: [{ rotate: "8deg" }, { translateX: 8 }, { translateY: 4 }],
    top: 0,
    left: 0,
  },
  heroCardBack1: {
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
    transform: [{ rotate: "4deg" }, { translateX: 4 }, { translateY: 2 }],
    top: 0,
    left: 0,
  },
  heroCardFront: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.accent + "60",
    top: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  heroCardShimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "rgba(145,126,255,0.08)",
  },
  heroCardImage: {
    width: "100%",
    height: "100%",
  },

  // ── Raccourcis ────────────────────────────────────────────────────────
  shortcuts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
  },
  shortcut: {
    width: "47.5%",
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    gap: 6,
    borderWidth: 0.5,
  },
  shortcutIcon: {
    width: 36,
    height: 36,
    borderRadius: Theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  shortcutLabel: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  shortcutSub: {
    fontSize: Theme.fontSize.xs + 1,
  },

  // ── Divider décoratif ─────────────────────────────────────────────────
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.lg,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: Colors.border,
  },
  dividerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accent,
    opacity: 0.6,
  },
});
