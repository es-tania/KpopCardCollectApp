import { PHOTOCARD_FILTER_OPTIONS } from "@/src/constants/options";
import { Theme } from "@/src/constants/theme";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/colors";
import {
  PhotocardType,
  PhotocardTypeFilter,
  PhotocardWithDetails,
} from "../../types";
import { PhotocardMini } from "./PhotocardMini";
import { PhotocardModal } from "./PhotocardModal";

// ─── Props ────────────────────────────────────────────────────────────────────

interface PhotocardMiniGridProps {
  cards: PhotocardWithDetails[];
  onEndReached?: () => void;
  loadingMore?: boolean;
  ListHeaderComponent?: React.ReactElement;
  ListFooterComponent?: React.ReactElement;
  hideEmpty?: boolean;
  onPressCard?: (card: PhotocardWithDetails) => void;
  onScroll?: (offset: number) => void;
}

const NUM_COLUMNS = 3;
const LOCAL_PAGE = 24;

// ─── Composant ────────────────────────────────────────────────────────────────

export const PhotocardMiniGrid = forwardRef<any, PhotocardMiniGridProps>(
  (
    {
      cards,
      onScroll,
      onEndReached,
      loadingMore = false,
      ListHeaderComponent,
      ListFooterComponent,
      hideEmpty = false,
      onPressCard,
    },
    ref,
  ) => {
    const [activeType, setActiveType] = useState<PhotocardTypeFilter>("all");
    const [selectedCard, setSelectedCard] =
      useState<PhotocardWithDetails | null>(null);
    const [visibleCount, setVisibleCount] = useState(LOCAL_PAGE);

    const flatListRef = useRef<FlatList>(null);
    const cooldown = useRef(false);
    const prevCards = useRef(cards);

    // ── Réinitialise le compteur si les cartes changent ───────────────────
    if (prevCards.current !== cards) {
      prevCards.current = cards;
      setVisibleCount(LOCAL_PAGE);
    }

    // ── Types disponibles ─────────────────────────────────────────────────
    const availableTypes = useMemo(() => {
      const types = new Set(cards.map((c) => c.type));
      return PHOTOCARD_FILTER_OPTIONS.filter(
        (opt) => opt.key === "all" || types.has(opt.key as PhotocardType),
      );
    }, [cards]);

    // ── Cartes filtrées par type ──────────────────────────────────────────
    const typeFilteredCards = useMemo(() => {
      if (activeType === "all") return cards;
      return cards.filter((c) => c.type === activeType);
    }, [cards, activeType]);

    // ── Cartes visibles ───────────────────────────────────────────────────
    const visibleCards = useMemo(
      () => typeFilteredCards.slice(0, visibleCount),
      [typeFilteredCards, visibleCount],
    );

    const hasLocalMore = visibleCount < typeFilteredCards.length;

    // ── Rows pour le rendu ────────────────────────────────────────────────
    const rows = useMemo(() => {
      const result: PhotocardWithDetails[][] = [];
      for (let i = 0; i < visibleCards.length; i += NUM_COLUMNS) {
        result.push(visibleCards.slice(i, i + NUM_COLUMNS));
      }
      return result;
    }, [visibleCards]);

    // ── onEndReached unifié ───────────────────────────────────────────────
    const handleEndReached = useCallback(() => {
      if (cooldown.current) return;
      cooldown.current = true;

      if (hasLocalMore) {
        setVisibleCount((prev) =>
          Math.min(prev + LOCAL_PAGE, typeFilteredCards.length),
        );
      } else if (onEndReached) {
        onEndReached();
      }

      setTimeout(() => {
        cooldown.current = false;
      }, 1000);
    }, [hasLocalMore, typeFilteredCards.length, onEndReached]);

    useImperativeHandle(ref, () => ({
      scrollToOffset: (params: { offset: number; animated: boolean }) => {
        flatListRef.current?.scrollToOffset(params);
      },
    }));

    // ── Rendu d'une ligne ─────────────────────────────────────────────────
    const renderRow = useCallback(
      ({ item: row }: { item: PhotocardWithDetails[] }) => (
        <View style={styles.row}>
          {row.map((card) => (
            <View key={card.id} style={styles.cardWrap}>
              <PhotocardMini
                card={card}
                onPress={() =>
                  onPressCard ? onPressCard(card) : setSelectedCard(card)
                }
              />
            </View>
          ))}
          {row.length < NUM_COLUMNS &&
            Array(NUM_COLUMNS - row.length)
              .fill(null)
              .map((_, i) => (
                <View key={`empty-${i}`} style={styles.cardWrap} />
              ))}
        </View>
      ),
      [onPressCard],
    );

    const keyExtractor = useCallback(
      (_: any, index: number) => `row-${index}`,
      [],
    );

    // ── Header ────────────────────────────────────────────────────────────
    const renderHeader = useCallback(
      () => (
        <>
          {ListHeaderComponent}
          {availableTypes.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersContent}
              style={styles.filters}
            >
              {availableTypes.map((opt) => {
                const isActive = opt.key === activeType;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.pill, isActive && styles.pillActive]}
                    onPress={() => {
                      setActiveType(opt.key as PhotocardTypeFilter);
                      setVisibleCount(LOCAL_PAGE);
                      cooldown.current = false;
                    }}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        isActive && styles.pillTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </>
      ),
      [ListHeaderComponent, availableTypes, activeType],
    );

    // ── Footer ────────────────────────────────────────────────────────────
    const renderFooter = useCallback(() => {
      const hasPagination = hasLocalMore || loadingMore;
      return (
        <>
          {ListFooterComponent}
          {hasPagination && (
            <View style={styles.footer}>
              <ActivityIndicator color={Colors.accent} size="small" />
              <Text style={styles.footerText}>
                {hasLocalMore && "Chargement..."}
              </Text>
            </View>
          )}
        </>
      );
    }, [hasLocalMore, loadingMore, ListFooterComponent]);

    // ── Empty ─────────────────────────────────────────────────────────────
    const renderEmpty = useCallback(() => {
      if (hideEmpty) return null;
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🃏</Text>
          <Text style={styles.emptyText}>Aucune carte de ce type</Text>
        </View>
      );
    }, [hideEmpty]);

    return (
      <>
        <FlatList
          ref={flatListRef}
          onScroll={(e) => {
            onScroll?.(e.nativeEvent.contentOffset.y);
          }}
          scrollEventThrottle={16}
          data={rows}
          renderItem={renderRow}
          keyExtractor={keyExtractor}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          // ✅ Clé du fix — empêche le scroll de remonter
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
          // Optimisations
          removeClippedSubviews={true}
          maxToRenderPerBatch={6}
          updateCellsBatchingPeriod={50}
          windowSize={10}
          initialNumToRender={8}
        />

        {!onPressCard && (
          <PhotocardModal
            card={selectedCard}
            visible={selectedCard !== null}
            onClose={() => setSelectedCard(null)}
          />
        )}
      </>
    );
  },
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  // Filtres
  filters: {
    marginBottom: Theme.spacing.md,
  },
  filtersContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xs,
    gap: 6,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.pillActive,
    borderColor: Colors.borderActive,
  },
  pillText: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  pillTextActive: {
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },

  // Grille
  row: {
    flexDirection: "row",
    paddingHorizontal: Theme.spacing.lg,
    gap: 8,
    marginBottom: 8,
  },
  cardWrap: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: Theme.spacing.lg,
  },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: Theme.spacing.lg,
  },
  footerText: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },

  // État vide
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 28,
  },
  emptyText: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
  },
});
