import { GroupFilter } from "@/src/components/group/GroupFilter";
import { ALL_KEY } from "@/src/constants/key";
import { useGroups } from "@/src/hooks/group/useGroups";
import { useFetchOnFocus } from "@/src/hooks/useFetchOnFocus";
import { supabase } from "@/src/lib/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { useCollectionStore } from "@/src/store/collectionStore";
import { CardMode, PhotocardWithDetails } from "@/src/types";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Grid3x3, SlidersHorizontal } from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { mapPhotocard } from "../src/services/photocardsService";

// ─── Config par mode ──────────────────────────────────────────────────────────

const MODE_CONFIG: Record<
  CardMode,
  { title: string; emptyText: string; accentColor: string; table: string }
> = {
  collection: {
    title: "Toute ma collection",
    emptyText: "Ta collection est vide pour l'instant",
    accentColor: Colors.accent,
    table: "user_collection",
  },
  favorites: {
    title: "Mes favoris",
    emptyText: "Aucune carte en favori pour l'instant",
    accentColor: "#DAA520",
    table: "user_favorites",
  },
  wishlist: {
    title: "Ma wishlist",
    emptyText: "Ta wishlist est vide pour l'instant",
    accentColor: Colors.accent,
    table: "user_wishlist",
  },
};
// ─── Page principale ──────────────────────────────────────────────────────────

export default function MyCardsScreen() {
  const { user } = useAuthStore();
  const { groups } = useGroups(true);

  const { collectionIds, favoriteIds, wishlistIds } = useCollectionStore();

  const { mode: rawMode } = useLocalSearchParams<{ mode?: string }>();
  const mode: CardMode =
    rawMode === "favorites" || rawMode === "wishlist" ? rawMode : "collection";
  const config = MODE_CONFIG[mode];

  // ── State ─────────────────────────────────────────────────────────────
  const [cards, setCards] = useState<PhotocardWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(ALL_KEY);
  const [showFilters, setShowFilters] = useState(false);

  const filterHeight = useRef(new Animated.Value(0)).current;

  // ── Fetch depuis Supabase ─────────────────────────────────────────────

  const fetchCards = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(config.table)
        .select(`photocard_id, photocards_with_details (*)`)
        .eq("user_id", user.id);

      if (error) throw error;

      setCards(
        (data ?? [])
          .map((d: any) => d.photocards_with_details)
          .filter(Boolean)
          .map((d: any) => ({
            ...mapPhotocard(d),
            isInCollection: collectionIds.has(d.id),
            isFavorite: favoriteIds.has(d.id),
            isWishlisted: wishlistIds.has(d.id),
          })),
      );
    } catch (err: any) {
      console.error("fetchCards error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user, mode]);

  useEffect(() => {
    fetchCards();
  }, [mode, user]);
  useFetchOnFocus(fetchCards);

  // ── Groupes présents dans les cartes ─────────────────────────────────

  const groupsInCards = useMemo(() => {
    const groupIds = new Set(cards.map((c) => c.groupId));
    return groups.filter((g) => groupIds.has(g.id));
  }, [cards, groups]);

  // ── Filtre par groupe ─────────────────────────────────────────────────

  // ── Cartes enrichies depuis le store (toujours à jour) ────────────────
  const enrichedCards = useMemo(() => {
    return cards.map((card) => ({
      ...card,
      isInCollection: collectionIds.has(card.id),
      isFavorite: favoriteIds.has(card.id),
      isWishlisted: wishlistIds.has(card.id),
    }));
  }, [cards, collectionIds, favoriteIds, wishlistIds]);

  const filteredCards = useMemo(() => {
    if (selectedGroupId === ALL_KEY) return enrichedCards;
    return enrichedCards.filter((c) => c.groupId === selectedGroupId);
  }, [enrichedCards, selectedGroupId]);

  const selectedGroupName = useMemo(
    () => groupsInCards.find((g) => g.id === selectedGroupId)?.name ?? null,
    [selectedGroupId, groupsInCards],
  );

  // ── Handlers ──────────────────────────────────────────────────────────
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
          <Text style={styles.filterLabel}>Groupe</Text>
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
      ) : filteredCards.length === 0 ? (
        <>
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
        </>
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
