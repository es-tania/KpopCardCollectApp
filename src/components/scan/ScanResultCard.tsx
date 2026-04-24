import { useUserCollection } from "@/src/hooks/useUserCollection";
import { Check, Plus, ShoppingCart, Star, X } from "lucide-react-native";
import React, { useCallback } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { PhotocardWithDetails } from "../../types";

interface ScanResultCardProps {
  card: PhotocardWithDetails;
  onDismiss: () => void;
}

export const ScanResultCard: React.FC<ScanResultCardProps> = ({
  card,
  onDismiss,
}) => {
  const {
    collectionIds,
    favoriteIds,
    wishlistIds,
    toggleCollection,
    toggleFavorite,
    toggleWishlist,
  } = useUserCollection();

  // ── États live depuis le store — pas depuis la prop card ─────────────
  const isInCollection = collectionIds.has(card.id);
  const isFavorite = favoriteIds.has(card.id);
  const isWishlisted = wishlistIds.has(card.id);

  const handleToggleCollection = useCallback(async () => {
    await toggleCollection(card.id);
  }, [card.id, toggleCollection]);

  const handleToggleFavorite = useCallback(async () => {
    await toggleFavorite(card.id);
  }, [card.id, toggleFavorite]);

  const handleToggleWishlist = useCallback(async () => {
    await toggleWishlist(card.id);
  }, [card.id, toggleWishlist]);

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Carte trouvée</Text>
        <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
          <X size={16} color={Colors.textMuted} strokeWidth={1.8} />
        </TouchableOpacity>
      </View>

      {/* ── Aperçu ── */}
      <View style={styles.preview}>
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
        </View>

        <View style={styles.previewInfo}>
          <Text style={styles.memberName}>{card.memberName}</Text>
          <Text style={styles.groupName}>{card.groupName}</Text>
          <Text style={styles.albumTitle}>{card.albumTitle}</Text>
          {card.version && (
            <Text style={styles.version}>Ver. {card.version}</Text>
          )}
          {card.type !== "normal" && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {card.type.toUpperCase().replace("_", " ")}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Actions ── */}
      <View style={styles.actions}>
        {/* Collection */}
        <TouchableOpacity
          style={[
            styles.actionBtn,
            isInCollection ? styles.actionBtnActive : styles.actionBtnPrimary,
          ]}
          onPress={handleToggleCollection}
          activeOpacity={0.75}
        >
          {isInCollection ? (
            <Check size={15} color={Colors.accent} strokeWidth={2.5} />
          ) : (
            <Plus size={15} color={Colors.bg} strokeWidth={2} />
          )}
          <Text
            style={[
              styles.actionLabel,
              isInCollection
                ? styles.actionLabelActive
                : styles.actionLabelPrimary,
            ]}
          >
            {isInCollection ? "Collectée" : "Collection"}
          </Text>
        </TouchableOpacity>

        {/* Wishlist */}
        <TouchableOpacity
          style={[
            styles.actionBtn,
            styles.actionBtnSecondary,
            isWishlisted && styles.actionBtnWishActive,
          ]}
          onPress={handleToggleWishlist}
          activeOpacity={0.75}
        >
          <ShoppingCart
            size={15}
            color={isWishlisted ? Colors.accent : Colors.textMuted}
            strokeWidth={1.8}
          />
          <Text
            style={[
              styles.actionLabel,
              styles.actionLabelSecondary,
              isWishlisted && styles.actionLabelWishActive,
            ]}
          >
            {isWishlisted ? "Souhaitée" : "Wishlist"}
          </Text>
        </TouchableOpacity>

        {/* Favoris */}
        <TouchableOpacity
          style={[
            styles.actionBtn,
            styles.actionBtnSecondary,
            isFavorite && styles.actionBtnFavActive,
            { borderRightWidth: 0 },
          ]}
          onPress={handleToggleFavorite}
          activeOpacity={0.75}
        >
          <Star
            size={15}
            color={isFavorite ? "#DAA520" : Colors.textMuted}
            fill={isFavorite ? "#DAA520" : "transparent"}
            strokeWidth={1.8}
          />
          <Text
            style={[
              styles.actionLabel,
              styles.actionLabelSecondary,
              isFavorite && styles.actionLabelFavActive,
            ]}
          >
            {isFavorite ? "Favori ✓" : "Favori"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 0.5,
    borderColor: "rgba(74,222,170,0.3)",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.accent,
  },
  closeBtn: { padding: 4 },
  preview: {
    flexDirection: "row",
    gap: Theme.spacing.md,
    padding: Theme.spacing.md,
  },
  imageWrap: {
    width: 80,
    height: 116,
    borderRadius: Theme.borderRadius.sm,
    overflow: "hidden",
    backgroundColor: Colors.surface2,
    flexShrink: 0,
  },
  image: { width: "100%", height: "100%" },
  imageFallback: { flex: 1, alignItems: "center", justifyContent: "center" },
  imageFallbackEmoji: { fontSize: 28 },
  previewInfo: {
    flex: 1,
    gap: 4,
    justifyContent: "center",
  },
  memberName: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  groupName: { fontSize: Theme.fontSize.base, color: Colors.accent },
  albumTitle: { fontSize: Theme.fontSize.base, color: Colors.textMuted },
  version: { fontSize: Theme.fontSize.sm + 1, color: Colors.textMuted },
  typeBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.pillActive,
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
    marginTop: 2,
  },
  typeBadgeText: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
  ownedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  ownedText: { fontSize: Theme.fontSize.sm + 1, color: Colors.accent },
  notOwned: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
    marginTop: 4,
  },

  // ── Actions ──────────────────────────────────────────────────────────
  actions: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: Theme.spacing.md,
    borderRightWidth: 0.5,
    borderRightColor: Colors.border,
  },
  actionBtnPrimary: {
    backgroundColor: Colors.accent,
  },
  actionBtnActive: {
    backgroundColor: Colors.surface2,
  },
  actionBtnSecondary: {
    backgroundColor: Colors.surface,
  },
  actionBtnWishActive: {
    backgroundColor: Colors.pillActive,
  },
  actionBtnFavActive: {
    backgroundColor: "rgba(218,165,32,0.1)",
  },
  actionLabel: {
    fontSize: Theme.fontSize.sm + 1,
    fontWeight: Theme.fontWeight.medium,
  },
  actionLabelPrimary: { color: Colors.bg },
  actionLabelActive: { color: Colors.accent },
  actionLabelSecondary: { color: Colors.textMuted },
  actionLabelWishActive: { color: Colors.accent },
  actionLabelFavActive: { color: "#DAA520" },
});
