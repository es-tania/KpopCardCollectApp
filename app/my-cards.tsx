import { GroupFilter } from "@/src/components/group/GroupFilter";
import { ALL_KEY } from "@/src/constants/key";
import { useGroups } from "@/src/hooks/group/useGroups";
import { useMyCards } from "@/src/hooks/photocard/useMyCards";
import { useTranslation } from "@/src/hooks/useTranslation";
import { useAuthStore } from "@/src/store/authStore";
import { useCollectionStore } from "@/src/store/collectionStore";
import { CardMode } from "@/src/types";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Grid3x3, SlidersHorizontal } from "lucide-react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PhotocardMiniGrid } from "../src/components/photocard/PhotocardMiniGrid";
import { Colors } from "../src/constants/colors";
import { Theme } from "../src/constants/theme";

// ─── Page principale ──────────────────────────────────────────────────────────

export default function MyCardsScreen() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { groups } = useGroups(true);

  const { collectionIds, favoriteIds, wishlistIds } = useCollectionStore();

  const { mode: rawMode } = useLocalSearchParams<{ mode?: string }>();
  const mode: CardMode =
    rawMode === "favorites" || rawMode === "wishlist" ? rawMode : "collection";

  const MODE_CONFIG: Record<
    CardMode,
    { title: string; accentColor: string; table: string }
  > = {
    collection: {
      title: t("myCards.titleCollection"),
      accentColor: Colors.accent,
      table: "user_collection",
    },
    favorites: {
      title: t("myCards.titleFavorites"),
      accentColor: "#DAA520",
      table: "user_favorites",
    },
    wishlist: {
      title: t("myCards.titleWishlist"),
      accentColor: Colors.accent,
      table: "user_wishlist",
    },
  };
  const config = MODE_CONFIG[mode];

  // ── State ─────────────────────────────────────────────────────────────
  const [selectedGroupId, setSelectedGroupId] = useState<string>(ALL_KEY);
  const [showFilters, setShowFilters] = useState(false);

  const filterHeight = useRef(new Animated.Value(0)).current;

  const { cards, loading } = useMyCards(mode);

  // ── Groupes présents dans les cartes ──────────────────────────────────
  const groupsInCards = useMemo(() => {
    const ids = new Set(cards.map((c) => c.groupId));
    return groups.filter((g) => ids.has(g.id));
  }, [cards, groups]);

  // ── Filtre par groupe ─────────────────────────────────────────────────
  const filteredCards = useMemo(() => {
    if (selectedGroupId === ALL_KEY) return cards;
    return cards.filter((c) => c.groupId === selectedGroupId);
  }, [cards, selectedGroupId]);

  const selectedGroupName = useMemo(
    () => groupsInCards.find((g) => g.id === selectedGroupId)?.name ?? null,
    [selectedGroupId, groupsInCards],
  );

  const toggleFilters = useCallback(() => {
    setShowFilters((v) => !v);
    Animated.spring(filterHeight, {
      toValue: showFilters ? 0 : 1,
      useNativeDriver: false,
      tension: 80,
      friction: 12,
    }).start();
  }, [showFilters, filterHeight]);

  const handleSelectGroup = useCallback((id: string) => {
    setSelectedGroupId(id);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {selectedGroupName ?? config.title}
        </Text>
        <TouchableOpacity
          style={[styles.navBtn, showFilters && styles.navBtnActive]}
          onPress={toggleFilters}
        >
          <SlidersHorizontal
            size={18}
            color={showFilters ? Colors.accent : Colors.text}
            strokeWidth={1.6}
          />
        </TouchableOpacity>
      </View>

      {/* Panneau filtres animé */}
      <Animated.View
        style={[
          styles.filtersPanel,
          {
            maxHeight: filterHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 120],
            }),
            opacity: filterHeight,
          },
        ]}
      >
        <View style={styles.filtersPanelInner}>
          <Text style={styles.filterLabel}>{t("fields.group")}</Text>
          <GroupFilter
            groups={groupsInCards}
            selectedId={selectedGroupId}
            onSelect={handleSelectGroup}
          />
        </View>
      </Animated.View>

      {/* ── Contenu ── */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      ) : (
        <PhotocardMiniGrid
          cards={filteredCards}
          ListHeaderComponent={
            <View style={styles.infoBar}>
              <Grid3x3 size={13} color={Colors.textMuted} strokeWidth={1.6} />
              <Text style={styles.infoText}>
                <Text style={[styles.infoCount, { color: config.accentColor }]}>
                  {filteredCards.length}
                </Text>{" "}
                photocard{filteredCards.length !== 1 ? "s" : ""}
                {selectedGroupName ? ` · ${selectedGroupName}` : ""}
              </Text>
            </View>
          }
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

  // Navbar
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
  navBtnActive: {
    backgroundColor: Colors.pillActive,
    borderColor: Colors.borderActive,
  },
  navTitle: {
    flex: 1,
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
    textAlign: "center",
    marginHorizontal: Theme.spacing.sm,
  },

  // Panneau filtres
  filtersPanel: {
    overflow: "hidden",
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filtersPanelInner: {
    padding: Theme.spacing.lg,
    gap: Theme.spacing.sm,
  },
  filterLabel: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
    fontWeight: Theme.fontWeight.medium,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },

  // Info bar
  infoBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    marginBottom: Theme.spacing.lg,
  },
  infoText: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  infoCount: {
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Theme.spacing.xl,
    gap: Theme.spacing.md,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Theme.spacing.sm,
  },
  emptyTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  resetBtn: {
    marginTop: Theme.spacing.sm,
    backgroundColor: Colors.pillActive,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
  },
  resetBtnText: {
    fontSize: Theme.fontSize.base,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },

  scroll: { flex: 1 },
  bottomPad: { height: 40 },
});
