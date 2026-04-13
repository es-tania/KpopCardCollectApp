import { GroupFilter } from "@/src/components/group/GroupFilter";
import { ALL_KEY } from "@/src/constants/key";
import { MOCK_PHOTOCARDS } from "@/src/data/mockPhotocards";
import { useGroups } from "@/src/hooks/group/useGroups";
import { usePhotocardActions } from "@/src/hooks/usePhotocardActions";
import { useScrollToTop } from "@/src/hooks/useScrollToTop";
import { CardMode } from "@/src/types";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Grid3x3, SlidersHorizontal } from "lucide-react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PhotocardMiniGrid } from "../src/components/photocard/PhotocardMiniGrid";
import { Colors } from "../src/constants/colors";
import { Theme } from "../src/constants/theme";

// ─── Config par mode ──────────────────────────────────────────────────────────

const MODE_CONFIG: Record<
  CardMode,
  { title: string; emptyText: string; accentColor: string }
> = {
  collection: {
    title: "Toute ma collection",
    emptyText: "Ta collection est vide pour l'instant",
    accentColor: Colors.accent,
  },
  favorites: {
    title: "Mes favoris",
    emptyText: "Aucune carte en favori pour l'instant",
    accentColor: "#DAA520",
  },
  wishlist: {
    title: "Ma wishlist",
    emptyText: "Ta wishlist est vide pour l'instant",
    accentColor: Colors.accent,
  },
};

// ─── Page principale ──────────────────────────────────────────────────────────

export default function MyCardsScreen() {
  const { groups } = useGroups(true);
  const { mode: rawMode } = useLocalSearchParams<{ mode?: string }>();
  const mode: CardMode =
    rawMode === "favorites" || rawMode === "wishlist" ? rawMode : "collection";
  const { scrollRef, scrollToTop } = useScrollToTop();

  const { handleToggleFavorite, handleToggleWishlist, handleToggleCollection } =
    usePhotocardActions();

  const [selectedGroupId, setSelectedGroupId] = useState<string>(ALL_KEY);
  const [showFilters, setShowFilters] = useState(false);

  // Animation du panneau de filtres
  const filterHeight = useRef(new Animated.Value(0)).current;
  const config = MODE_CONFIG[mode];

  const toggleFilters = useCallback(() => {
    setShowFilters((v) => !v);
    Animated.spring(filterHeight, {
      toValue: showFilters ? 0 : 1,
      useNativeDriver: false,
      tension: 80,
      friction: 12,
    }).start();
  }, [showFilters, filterHeight]);

  // Cartes selon le mode
  const modeCards = useMemo(() => {
    switch (mode) {
      case "favorites":
        return MOCK_PHOTOCARDS.filter((c) => c.isFavorite);
      case "wishlist":
        return MOCK_PHOTOCARDS.filter((c) => c.isWishlisted);
      default:
        return MOCK_PHOTOCARDS.filter((c) => c.isInCollection);
    }
  }, [mode]);

  // Groupes présents dans la collection
  const groupsInCards = useMemo(() => {
    const groupIds = new Set(modeCards.map((c) => c.groupId));
    return groups.filter((g) => groupIds.has(g.id));
  }, [modeCards]);

  // Filtre par groupe
  const filteredCards = useMemo(() => {
    if (selectedGroupId === ALL_KEY) return modeCards;
    return modeCards.filter((c) => c.groupId === selectedGroupId);
  }, [modeCards, selectedGroupId]);

  const handleSelectGroup = useCallback(
    (id: string) => {
      setSelectedGroupId(id);
      scrollToTop();
    },
    [scrollToTop],
  );

  // Nom du groupe sélectionné pour le header
  const selectedGroupName = useMemo(
    () => groupsInCards.find((g) => g.id === selectedGroupId)?.name ?? null,
    [selectedGroupId, groupsInCards],
  );

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

      {/* ── Panneau filtres (animé) ── */}
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
          <Text style={styles.filterLabel}>Groupe</Text>
          <GroupFilter
            groups={groupsInCards}
            selectedId={selectedGroupId}
            onSelect={handleSelectGroup}
          />
        </View>
      </Animated.View>

      {/* ── Barre d'info ── */}
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

      {/* ── Grille ── */}
      {filteredCards.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🃏</Text>
          <Text style={styles.emptyTitle}>Aucune carte</Text>
          <Text style={styles.emptySubtitle}>
            {selectedGroupId !== ALL_KEY
              ? "Aucune carte pour ce groupe"
              : config.emptyText}
          </Text>
          {selectedGroupId !== ALL_KEY && (
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => handleSelectGroup(ALL_KEY)}
            >
              <Text style={styles.resetBtnText}>
                Voir toutes les photocards
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <PhotocardMiniGrid
            cards={filteredCards}
            onPressFavorite={handleToggleFavorite}
            onPressWishlist={handleToggleWishlist}
            onPressCollection={handleToggleCollection}
          />
          <View style={styles.bottomPad} />
        </ScrollView>
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
