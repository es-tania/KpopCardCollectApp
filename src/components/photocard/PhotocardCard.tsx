import { PHOTOCARD_TYPE_LABELS } from "@/src/constants/options";
import { Check, Plus, ShoppingBasket, Star } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { PhotocardWithDetails } from "../../types";

interface PhotocardCardProps {
  card: PhotocardWithDetails;
  onPressFavorite?: () => void;
  onPressWishlist?: () => void;
  onPressCollection?: () => void;
  onPress?: () => void;
}

const CARD_WIDTH = 130;
const CARD_HEIGHT = 190;

export const PhotocardCard: React.FC<PhotocardCardProps> = ({
  card,
  onPressFavorite,
  onPressWishlist,
  onPressCollection,
  onPress,
}) => {
  const typeLabel = PHOTOCARD_TYPE_LABELS[card.type];
  const isSpecialType = card.type !== "normal";

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* ── Image pleine taille ── */}
      <View style={styles.imageContainer}>
        <Image
          source={card.imageUrl as any}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Dégradé bas + infos superposées */}
        <View style={styles.overlay}>
          {/* Badges haut droite */}
          <View style={styles.topBadges}>
            {isSpecialType && (
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{typeLabel}</Text>
              </View>
            )}
          </View>

          {/* Infos principales en bas */}
          <View style={styles.infoOverlay}>
            <Text style={styles.albumTitle} numberOfLines={1}>
              {!card.isMultiMember && `${card.memberName} · `}
              {card.version ? `${card.version}` : ""}
            </Text>
            <Text style={styles.memberName} numberOfLines={1}>
              {card.groupName}
            </Text>
            <Text style={styles.groupName} numberOfLines={1}>
              {card.albumTitle ? `${card.albumTitle}` : ""}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Actions ── */}
      <View style={styles.actions}>
        {/* Favori */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onPressFavorite}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Star
            size={15}
            color={card.isFavorite ? "#DAA520" : Colors.textMuted}
            fill={card.isFavorite ? "#DAA520" : "transparent"}
            strokeWidth={1.8}
          />
        </TouchableOpacity>

        {/* Wishlist */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onPressWishlist}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <ShoppingBasket
            size={15}
            color={card.isWishlisted ? Colors.accent : Colors.textMuted}
            fill={card.isWishlisted ? Colors.accent : "transparent"}
            strokeWidth={1.8}
          />
        </TouchableOpacity>

        {/* Collection */}
        <TouchableOpacity
          style={[
            styles.actionBtn,
            styles.collectionBtn,
            card.isInCollection && styles.collectionBtnActive,
          ]}
          onPress={onPressCollection}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          {card.isInCollection ? (
            <Check size={13} color={Colors.bg} strokeWidth={2.5} />
          ) : (
            <Plus size={13} color={Colors.textMuted} strokeWidth={2} />
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: "hidden",
  },

  // ── Image ──
  imageContainer: {
    width: "100%",
    height: CARD_HEIGHT,
    backgroundColor: Colors.surface2,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface2,
  },
  placeholderEmoji: {
    fontSize: 36,
  },

  // ── Overlay dégradé ──
  overlay: {
    position: "absolute",
    inset: 0,
    justifyContent: "space-between",
    // Dégradé simulé via backgroundColor semi-transparent sur la partie basse
  } as any,

  // ── Badges haut ──
  topBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    padding: 6,
    justifyContent: "flex-end",
  },
  typeBadge: {
    backgroundColor: Colors.accent,
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  // limitedBadge: {
  //   backgroundColor: Colors.warning,
  // },
  typeBadgeText: {
    fontSize: Theme.fontSize.xs,
    color: Colors.text,
    fontWeight: Theme.fontWeight.semibold,
  },

  // ── Infos bas ──
  infoOverlay: {
    backgroundColor: "rgba(9, 12, 18, 0.78)",
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 1,
    // Faux dégradé en haut du bloc
    borderTopWidth: 0,
  },
  albumTitle: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  memberName: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  eventName: {
    fontSize: Theme.fontSize.sm,
    color: Colors.accent,
    marginTop: 1,
  },
  groupName: {
    fontSize: Theme.fontSize.sm,
    color: "rgba(232, 239, 247, 0.45)",
    marginTop: 1,
  },

  // ── Actions ──
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
  },
  actionBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.borderRadius.sm,
  },
  collectionBtn: {
    backgroundColor: Colors.surface2,
    borderWidth: 0.5,
    borderColor: Colors.border,
    marginLeft: "auto",
  },
  collectionBtnActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
});
