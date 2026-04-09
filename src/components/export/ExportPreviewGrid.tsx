import { Check } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { PhotocardWithDetails } from "../../types";

interface ExportPreviewGridProps {
  cards: PhotocardWithDetails[];
  selectedIds: Set<string>;
  onToggleCard: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export const ExportPreviewGrid: React.FC<ExportPreviewGridProps> = ({
  cards,
  selectedIds,
  onToggleCard,
  onSelectAll,
  onDeselectAll,
}) => {
  const allSelected = cards.length > 0 && selectedIds.size === cards.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.count}>
          <Text style={styles.countNum}>{selectedIds.size}</Text> /{" "}
          {cards.length} carte{cards.length !== 1 ? "s" : ""}
        </Text>
        <TouchableOpacity onPress={allSelected ? onDeselectAll : onSelectAll}>
          <Text style={styles.selectAllBtn}>
            {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Grille */}
      {cards.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🃏</Text>
          <Text style={styles.emptyText}>Aucune carte pour ces filtres</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {cards.map((card) => {
            const isSelected = selectedIds.has(card.id);
            return (
              <TouchableOpacity
                key={card.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => onToggleCard(card.id)}
                activeOpacity={0.8}
              >
                {/* Image */}
                <View style={styles.imageWrap}>
                  {card.imageUrl ? (
                    <Image
                      source={card.imageUrl as any}
                      style={styles.image}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.imageFallback}>
                      <Text style={styles.imageFallbackEmoji}>🧑‍🎤</Text>
                    </View>
                  )}

                  {/* Overlay sélection */}
                  {isSelected && (
                    <View style={styles.selectedOverlay}>
                      <View style={styles.checkCircle}>
                        <Check size={14} color={Colors.bg} strokeWidth={2.5} />
                      </View>
                    </View>
                  )}
                </View>

                {/* Infos */}
                <View style={styles.cardInfo}>
                  <Text style={styles.cardMember} numberOfLines={1}>
                    {card.memberName}
                  </Text>
                  <Text style={styles.cardAlbum} numberOfLines={1}>
                    {card.albumTitle}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: Theme.spacing.md },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  count: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
  },
  countNum: {
    color: Colors.accent,
    fontWeight: Theme.fontWeight.semibold,
  },
  selectAllBtn: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.accent,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  card: {
    width: "31%",
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  cardSelected: {
    borderColor: Colors.accent,
    borderWidth: 1.5,
  },
  imageWrap: {
    width: "100%",
    aspectRatio: 0.68,
    backgroundColor: Colors.surface2,
    position: "relative",
  },
  image: { width: "100%", height: "100%" },
  imageFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imageFallbackEmoji: { fontSize: 20 },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(125,211,240,0.3)",
    alignItems: "flex-end",
    padding: 4,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
    padding: 5,
    gap: 1,
  },
  cardMember: {
    fontSize: Theme.fontSize.xs + 1,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
  },
  cardAlbum: {
    fontSize: Theme.fontSize.xs,
    color: Colors.textMuted,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyEmoji: { fontSize: 32 },
  emptyText: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
  },
});
