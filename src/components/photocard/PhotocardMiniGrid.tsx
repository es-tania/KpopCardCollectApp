import { Theme } from "@/src/constants/theme";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/colors";
import { PhotocardType, PhotocardWithDetails } from "../../types";
import { PhotocardMini } from "./PhotocardMini";
import { PhotocardModal } from "./PhotocardModal";

// ─── Types ────────────────────────────────────────────────────────────────────

type TypeFilter = "all" | PhotocardType;

interface TypeFilterOption {
  key: TypeFilter;
  label: string;
}

const TYPE_FILTER_OPTIONS: TypeFilterOption[] = [
  { key: "all", label: "Tous" },
  { key: "normal", label: "Normal" },
  { key: "pob", label: "POB" },
  { key: "broadcast", label: "Broadcast" },
  { key: "lucky_draw", label: "Lucky Draw" },
  { key: "event", label: "Event" },
  { key: "benefit", label: "Benefit" },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface PhotocardMiniGridProps {
  cards: PhotocardWithDetails[];
  onPressFavorite: (id: string) => void;
  onPressWishlist: (id: string) => void;
  onPressCollection: (id: string) => void;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export const PhotocardMiniGrid: React.FC<PhotocardMiniGridProps> = ({
  cards,
  onPressFavorite,
  onPressWishlist,
  onPressCollection,
}) => {
  const [activeType, setActiveType] = useState<TypeFilter>("all");
  const [selectedCard, setSelectedCard] = useState<PhotocardWithDetails | null>(
    null,
  );

  // Déduit les types présents dans les cartes pour n'afficher que les filtres utiles
  const availableTypes = useMemo(() => {
    const types = new Set(cards.map((c) => c.type));
    return TYPE_FILTER_OPTIONS.filter(
      (opt) => opt.key === "all" || types.has(opt.key as PhotocardType),
    );
  }, [cards]);

  const filteredCards = useMemo(() => {
    if (activeType === "all") return cards;
    return cards.filter((c) => c.type === activeType);
  }, [cards, activeType]);

  return (
    <View>
      {/* ── Filtres type ── */}
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
              onPress={() => setActiveType(opt.key)}
              activeOpacity={0.75}
            >
              <Text
                style={[styles.pillText, isActive && styles.pillTextActive]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Grille ── */}
      {filteredCards.length > 0 ? (
        <View style={styles.grid}>
          {filteredCards.map((card) => (
            <PhotocardMini
              key={card.id}
              card={card}
              onPressFavorite={() => onPressFavorite(card.id)}
              onPressWishlist={() => onPressWishlist(card.id)}
              onPressCollection={() => onPressCollection(card.id)}
              onPress={() => setSelectedCard(card)}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🃏</Text>
          <Text style={styles.emptyText}>Aucune carte de ce type</Text>
        </View>
      )}

      <PhotocardModal
        card={selectedCard}
        visible={selectedCard !== null}
        onClose={() => setSelectedCard(null)}
        onPressFavorite={() => console.log("toggle fav", selectedCard?.id)}
        onPressWishlist={() => console.log("toggle wish", selectedCard?.id)}
        onPressCollection={() => console.log("toggle coll", selectedCard?.id)}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: Theme.spacing.lg,
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
