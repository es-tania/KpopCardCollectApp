import { PHOTOCARD_TYPE_LABELS } from "@/src/constants/options";
import { useUserCollection } from "@/src/hooks/useUserCollection";
import { Check, Plus, ShoppingBasket, Star, Users } from "lucide-react-native";
import React, { useMemo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { PhotocardWithDetails } from "../../types";

interface PhotocardMiniProps {
  card: PhotocardWithDetails;
  onPressFavorite?: () => void;
  onPressWishlist?: () => void;
  onPressCollection?: () => void;
  onPress?: () => void;
}

export const PhotocardMini: React.FC<PhotocardMiniProps> = ({
  card,
  onPress,
}) => {
  const typeLabel = PHOTOCARD_TYPE_LABELS[card.type];
  const isSpecialType = card.type !== "normal";

  const { toggleCollection, toggleFavorite, toggleWishlist } =
    useUserCollection();

  const imageSource = useMemo(() => {
    if (!card.imageUrl) return null;
    if (typeof card.imageUrl === "string") return { uri: card.imageUrl };
    return card.imageUrl as any;
  }, [card.imageUrl]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* ── Image ── */}
      <View style={styles.imageContainer}>
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.image}
            resizeMode="cover"
            fadeDuration={0}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderEmoji}>🧑‍🎤</Text>
          </View>
        )}

        <View style={styles.overlay}>
          {/* Badge type */}
          <View style={styles.topBadges}>
            {isSpecialType && (
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{typeLabel}</Text>
              </View>
            )}
            {card.isMultiMember && (
              <View style={styles.multiMemberBadge}>
                <Users size={10} color={Colors.bg} strokeWidth={2} />
                <Text style={styles.multiMemberText}>
                  {card.cardMembers.length}
                </Text>
              </View>
            )}
          </View>

          {/* Infos bas */}
          <View style={styles.infoOverlay}>
            <Text style={styles.albumTitle} numberOfLines={1}>
              {card.version ? `${card.version}` : "-"}
            </Text>
            <Text style={styles.memberName} numberOfLines={1}>
              {card.albumTitle}
              {!card.isMultiMember && card.memberName
                ? ` · ${card.memberName}`
                : ""}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Actions ── */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={(id) => toggleFavorite(card.id)}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Star
            size={12}
            color={card.isFavorite ? "#DAA520" : Colors.textMuted}
            fill={card.isFavorite ? "#DAA520" : "transparent"}
            strokeWidth={1.8}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={(id) => toggleWishlist(card.id)}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <ShoppingBasket
            size={12}
            color={card.isWishlisted ? Colors.accent : Colors.textMuted}
            fill={card.isWishlisted ? Colors.accent : "transparent"}
            strokeWidth={1.8}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionBtn,
            styles.collectionBtn,
            card.isInCollection && styles.collectionBtnActive,
          ]}
          onPress={(id) => toggleCollection(card.id)}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          {card.isInCollection ? (
            <Check size={10} color={Colors.bg} strokeWidth={2.5} />
          ) : (
            <Plus size={10} color={Colors.textMuted} strokeWidth={2} />
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    // width: "31%",
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: "hidden",
  },

  // Image
  imageContainer: {
    width: "100%",
    aspectRatio: 0.68, // ratio photocard standard
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
  },
  placeholderEmoji: {
    fontSize: 24,
  },

  // Overlay
  overlay: {
    position: "absolute",
    inset: 0,
    justifyContent: "space-between",
  } as any,

  // Badge type
  topBadges: {
    padding: 4,
    alignItems: "flex-end",
  },
  typeBadge: {
    backgroundColor: Colors.accent,
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  typeBadgeText: {
    fontSize: Theme.fontSize.xs,
    color: Colors.bg,
    fontWeight: Theme.fontWeight.semibold,
  },

  // Infos bas
  infoOverlay: {
    backgroundColor: "rgba(9, 12, 18, 0.78)",
    paddingHorizontal: 5,
    paddingTop: 6,
    paddingBottom: 5,
    gap: 1,
  },
  albumTitle: {
    fontSize: Theme.fontSize.sm + 1,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  memberName: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
  },
  shopName: {
    fontSize: Theme.fontSize.xs,
    color: Colors.accent,
  },

  // Actions
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  actionBtn: {
    width: 22,
    height: 22,
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
  multiMemberBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(145,126,255,0.85)",
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  multiMemberText: {
    fontSize: Theme.fontSize.xs,
    color: Colors.bg,
    fontWeight: Theme.fontWeight.bold,
  },
});
