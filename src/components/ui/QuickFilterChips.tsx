import { Colors } from "@/src/constants/colors";
import { Theme } from "@/src/constants/theme";
import {
  Check,
  LayoutGrid,
  ShoppingBasket,
  Star,
  Tag,
} from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

export interface QuickFilterOption {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface QuickFilterChipsProps {
  options: QuickFilterOption[];
  selected: string;
  onSelect: (key: string) => void;
}

export const QuickFilterChips: React.FC<QuickFilterChipsProps> = ({
  options,
  selected,
  onSelect,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.content}
    style={styles.row}
  >
    {options.map((opt) => {
      const isActive = selected === opt.key;
      return (
        <TouchableOpacity
          key={opt.key}
          style={[styles.chip, isActive && styles.chipActive]}
          onPress={() => onSelect(opt.key)}
          activeOpacity={0.75}
        >
          {opt.icon && opt.icon}
          <Text style={[styles.label, isActive && styles.labelActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

// ── Options par défaut pour les filtres de collection ─────────────────────────
export const COLLECTION_FILTER_CHIPS = (
  selected: string,
): QuickFilterOption[] => [
  {
    key: "all",
    label: "Tout",
    icon: (
      <LayoutGrid
        size={12}
        color={selected === "all" ? Colors.accent : Colors.textMuted}
        strokeWidth={1.8}
      />
    ),
  },
  {
    key: "collection",
    label: "Collection",
    icon: (
      <Check
        size={12}
        color={selected === "collection" ? Colors.accent : Colors.textMuted}
        strokeWidth={2.5}
      />
    ),
  },
  {
    key: "favorites",
    label: "Favoris",
    icon: (
      <Star
        size={12}
        color={selected === "favorites" ? Colors.accent : Colors.textMuted}
        strokeWidth={1.8}
      />
    ),
  },
  {
    key: "wishlist",
    label: "Wishlist",
    icon: (
      <ShoppingBasket
        size={12}
        color={selected === "wishlist" ? Colors.accent : Colors.textMuted}
        strokeWidth={1.8}
      />
    ),
  },
  {
    key: "none",
    label: "Non classé",
    icon: (
      <Tag
        size={12}
        color={selected === "none" ? Colors.accent : Colors.textMuted}
        strokeWidth={1.8}
      />
    ),
  },
];

const styles = StyleSheet.create({
  row: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  content: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm + 2,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: "rgba(145,126,255,0.12)",
    borderColor: Colors.accent,
  },
  label: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  labelActive: { color: Colors.accent },
});
