import { Check, Plus, ShoppingCart, Star, X } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { PhotocardWithDetails } from "../../types";

interface ScanResultCardProps {
  card: PhotocardWithDetails;
  onAddToCollection: () => void;
  onAddToWishlist: () => void;
  onAddToFavorites: () => void;
  onDismiss: () => void;
}

export const ScanResultCard: React.FC<ScanResultCardProps> = ({
  card,
  onAddToCollection,
  onAddToWishlist,
  onAddToFavorites,
  onDismiss,
}) => (
  <View style={styles.container}>
    {/* Header */}
    <View style={styles.header}>
      <Text style={styles.headerTitle}>✅ Carte trouvée</Text>
      <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
        <X size={16} color={Colors.textMuted} strokeWidth={1.8} />
      </TouchableOpacity>
    </View>

    {/* Aperçu */}
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

        {/* Statut dans la collection */}
        {card.isInCollection ? (
          <View style={styles.ownedBadge}>
            <Check size={11} color={Colors.accent} strokeWidth={2.5} />
            <Text style={styles.ownedText}>Déjà dans ta collection</Text>
          </View>
        ) : (
          <Text style={styles.notOwned}>Pas encore collectée</Text>
        )}
      </View>
    </View>

    {/* Actions */}
    <View style={styles.actions}>
      <TouchableOpacity
        style={[
          styles.actionBtn,
          card.isInCollection && styles.actionBtnDisabled,
        ]}
        onPress={onAddToCollection}
        disabled={card.isInCollection}
      >
        <Plus
          size={15}
          color={card.isInCollection ? Colors.textMuted : Colors.bg}
          strokeWidth={2}
        />
        <Text
          style={[
            styles.actionLabel,
            card.isInCollection && styles.actionLabelDisabled,
          ]}
        >
          {card.isInCollection ? "Collectée" : "Collection"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.actionBtn,
          styles.actionBtnWish,
          card.isWishlisted && styles.actionBtnWishActive,
        ]}
        onPress={onAddToWishlist}
      >
        <ShoppingCart
          size={15}
          color={card.isWishlisted ? Colors.accent : Colors.textMuted}
          strokeWidth={1.8}
        />
        <Text
          style={[
            styles.actionLabel,
            styles.actionLabelWish,
            card.isWishlisted && styles.actionLabelWishActive,
          ]}
        >
          {card.isWishlisted ? "Souhaitée" : "Wishlist"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.actionBtn,
          styles.actionBtnFav,
          card.isFavorite && styles.actionBtnFavActive,
        ]}
        onPress={onAddToFavorites}
      >
        <Star
          size={15}
          color={card.isFavorite ? "#DAA520" : Colors.textMuted}
          fill={card.isFavorite ? "#DAA520" : "transparent"}
          strokeWidth={1.8}
        />
        <Text
          style={[
            styles.actionLabel,
            card.isFavorite && styles.actionLabelFavActive,
          ]}
        >
          {card.isFavorite ? "Favori" : "Favori"}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

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
  closeBtn: {
    padding: 4,
  },
  preview: {
    flexDirection: "row",
    gap: Theme.spacing.md,
    padding: Theme.spacing.md,
  },
  imageWrap: {
    width: 70,
    height: 103,
    borderRadius: Theme.borderRadius.sm,
    overflow: "hidden",
    backgroundColor: Colors.surface2,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imageFallbackEmoji: {
    fontSize: 28,
  },
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
  groupName: {
    fontSize: Theme.fontSize.base,
    color: Colors.accent,
  },
  albumTitle: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
  },
  version: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  typeBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.pillActive,
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
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
    marginTop: 2,
  },
  ownedText: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.accent,
  },
  notOwned: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
    marginTop: 2,
  },
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
    backgroundColor: Colors.accent,
    borderRightWidth: 0.5,
    borderRightColor: Colors.border,
  },
  actionBtnDisabled: {
    backgroundColor: Colors.surface2,
  },
  actionBtnWish: {
    backgroundColor: Colors.surface,
  },
  actionBtnWishActive: {
    backgroundColor: Colors.pillActive,
  },
  actionBtnFav: {
    backgroundColor: Colors.surface,
    borderRightWidth: 0,
  },
  actionBtnFavActive: {
    backgroundColor: "rgba(218,165,32,0.1)",
  },
  actionLabel: {
    fontSize: Theme.fontSize.sm + 1,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.bg,
  },
  actionLabelDisabled: {
    color: Colors.textMuted,
  },
  actionLabelWish: {
    color: Colors.textMuted,
  },
  actionLabelWishActive: {
    color: Colors.accent,
  },
  actionLabelFavActive: {
    color: "#DAA520",
  },
});
