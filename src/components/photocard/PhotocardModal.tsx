import {
  PHOTOCARD_TYPE_LABELS,
  SUBMISSION_STATUS_LABELS,
} from "@/src/constants/options";
import { useDeletePhotocards } from "@/src/hooks/photocard/useDeletePhotocards";
import { useIsGroupAdmin } from "@/src/hooks/useIsGroupAdmin";
import { useUserCollection } from "@/src/hooks/useUserCollection";
import { useDeletedCardsStore } from "@/src/store/deletedCardsStore";
import { useShopsStore } from "@/src/store/shopsStore";
import { router } from "expo-router";
import {
  Calendar,
  Check,
  Edit2,
  Hash,
  Layers,
  Plus,
  Share,
  ShoppingCart,
  Star,
  Tag,
  Trash2,
  X,
} from "lucide-react-native";
import React, { useCallback } from "react";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { PhotocardWithDetails } from "../../types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.72;
const CARD_HEIGHT = CARD_WIDTH / 0.68;

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ─── Sous-composant ligne d'info ──────────────────────────────────────────────

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => (
  <View style={infoStyles.row}>
    <View style={infoStyles.iconWrap}>{icon}</View>
    <Text style={infoStyles.label}>{label}</Text>
    <Text style={infoStyles.value} numberOfLines={2}>
      {value}
    </Text>
  </View>
);

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.sm,
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  iconWrap: {
    width: 20,
    alignItems: "center",
  },
  label: {
    flex: 1,
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
  },
  value: {
    flex: 2,
    fontSize: Theme.fontSize.base,
    color: Colors.text,
    fontWeight: Theme.fontWeight.medium,
    textAlign: "right",
  },
});

// ─── Props ────────────────────────────────────────────────────────────────────

interface PhotocardModalProps {
  card: PhotocardWithDetails | null;
  visible: boolean;
  onClose: () => void;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export const PhotocardModal: React.FC<PhotocardModalProps> = ({
  card,
  visible,
  onClose,
}) => {
  const isGroupAdmin = useIsGroupAdmin(card?.groupId);

  const { confirmDeleteOne } = useDeletePhotocards();
  const { getLabel } = useShopsStore();

  const {
    collectionIds,
    favoriteIds,
    wishlistIds,
    toggleCollection,
    toggleFavorite,
    toggleWishlist,
  } = useUserCollection();

  const markDeleted = useDeletedCardsStore((s) => s.markDeleted);

  const handleDelete = useCallback(() => {
    if (!card) return;
    confirmDeleteOne(card, () => onClose());
  }, [card, confirmDeleteOne, onClose]);

  if (!card) return null;

  // États calculés depuis les Sets
  const isInCollection = collectionIds.has(card.id);
  const isFavorite = favoriteIds.has(card.id);
  const isWishlisted = wishlistIds.has(card.id);

  const typeLabel = PHOTOCARD_TYPE_LABELS[card.type] ?? card.type;
  const isSpecialType = card.type !== "normal";

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        {/* ── Navbar ── */}
        <View style={styles.navbar}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={20} color={Colors.text} strokeWidth={1.8} />
          </TouchableOpacity>
          <Text style={styles.navTitle} numberOfLines={1}>
            {card.memberName} — {card.albumTitle}
          </Text>
          <View style={styles.navRight}>
            <TouchableOpacity style={styles.closeBtn}>
              <Share size={20} color={Colors.text} strokeWidth={1.8} />
            </TouchableOpacity>
            {isGroupAdmin && (
              <>
                {/* Bouton éditer */}
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => {
                    onClose();
                    router.push({
                      pathname: "/edit-photocard/[id]",
                      params: { id: card.id },
                    });
                  }}
                >
                  <Edit2 size={17} color={Colors.accent} strokeWidth={1.6} />
                </TouchableOpacity>

                {/* Bouton supprimer */}
                <TouchableOpacity
                  style={[styles.closeBtn, styles.deleteBtnActive]}
                  onPress={handleDelete}
                >
                  <Trash2 size={17} color={Colors.danger} strokeWidth={1.6} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Image grande ── */}
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

            {/* Badge type */}
            {isSpecialType && (
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{typeLabel}</Text>
              </View>
            )}
            {card.isLimited && (
              <View style={[styles.typeBadge, styles.limitedBadge]}>
                <Text style={styles.typeBadgeText}>✦ Limited</Text>
              </View>
            )}
          </View>

          {/* ── Actions ── */}
          <View style={styles.actions}>
            {/* Favori */}
            <TouchableOpacity
              style={[styles.actionBtn, isFavorite && styles.actionBtnActive]}
              onPress={() => toggleFavorite(card.id)}
              activeOpacity={0.75}
            >
              <Star
                size={18}
                color={isFavorite ? "#DAA520" : Colors.textMuted}
                fill={isFavorite ? "#DAA520" : "transparent"}
                strokeWidth={1.8}
              />
              <Text
                style={[
                  styles.actionLabel,
                  isFavorite && styles.actionLabelFav,
                ]}
              >
                {isFavorite ? "Favori" : "Favoris"}
              </Text>
            </TouchableOpacity>

            {/* Wishlist */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                isWishlisted && styles.actionBtnWishActive,
              ]}
              onPress={() => toggleWishlist(card.id)}
              activeOpacity={0.75}
            >
              <ShoppingCart
                size={18}
                color={isWishlisted ? Colors.accent : Colors.textMuted}
                fill={isWishlisted ? Colors.accent : "transparent"}
                strokeWidth={1.8}
              />
              <Text
                style={[
                  styles.actionLabel,
                  isWishlisted && styles.actionLabelWish,
                ]}
              >
                {isWishlisted ? "Souhaitée" : "Wishlist"}
              </Text>
            </TouchableOpacity>
            {/* Collection */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                isInCollection && styles.actionBtnCollActive,
              ]}
              onPress={() => toggleCollection(card.id)}
              activeOpacity={0.75}
            >
              {isInCollection ? (
                <Check size={18} color={Colors.accent} strokeWidth={2.2} />
              ) : (
                <Plus size={18} color={Colors.textMuted} strokeWidth={2} />
              )}
              <Text
                style={[
                  styles.actionLabel,
                  isInCollection && styles.actionLabelColl,
                ]}
              >
                {isInCollection ? "Collectée" : "Collection"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Infos ── */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Informations</Text>

            <InfoRow
              icon={
                <Tag size={14} color={Colors.textMuted} strokeWidth={1.6} />
              }
              label="Membre"
              value={card.memberName}
            />
            <InfoRow
              icon={
                <Layers size={14} color={Colors.textMuted} strokeWidth={1.6} />
              }
              label="Groupe"
              value={card.groupName}
            />
            <InfoRow
              icon={
                <Calendar
                  size={14}
                  color={Colors.textMuted}
                  strokeWidth={1.6}
                />
              }
              label="Album"
              value={card.albumTitle}
            />
            <InfoRow
              icon={
                <Tag size={14} color={Colors.textMuted} strokeWidth={1.6} />
              }
              label="Type"
              value={typeLabel}
            />
            {card.version && (
              <InfoRow
                icon={
                  <Hash size={14} color={Colors.textMuted} strokeWidth={1.6} />
                }
                label="Version"
                value={card.version}
              />
            )}
            {card.shopName && (
              <InfoRow
                icon={
                  <Tag size={14} color={Colors.textMuted} strokeWidth={1.6} />
                }
                label="Shop"
                value={getLabel(card.shopName)}
              />
            )}
            {card.rarity && (
              <InfoRow
                icon={
                  <Star size={14} color={Colors.textMuted} strokeWidth={1.6} />
                }
                label="Rareté"
                value={
                  card.rarity === "very_rare"
                    ? "Très rare"
                    : card.rarity === "rare"
                      ? "Rare"
                      : "Commune"
                }
              />
            )}
            <InfoRow
              icon={
                <Check size={14} color={Colors.textMuted} strokeWidth={1.6} />
              }
              label="Statut"
              value={SUBMISSION_STATUS_LABELS[card.status] ?? card.status}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

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
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  navTitle: {
    flex: 1,
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
    textAlign: "center",
    marginHorizontal: Theme.spacing.sm,
  },
  navRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.sm,
  },
  deleteBtnActive: {
    backgroundColor: "rgba(240,112,112,0.1)",
    borderColor: "rgba(240,112,112,0.3)",
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Image
  imageWrap: {
    alignItems: "center",
    paddingVertical: Theme.spacing.xl,
    gap: Theme.spacing.sm,
    position: "relative",
  },
  image: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: Theme.borderRadius.lg,
  },
  imageFallback: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  imageFallbackEmoji: {
    fontSize: 64,
  },
  typeBadge: {
    backgroundColor: Colors.accent,
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  limitedBadge: {
    backgroundColor: "rgba(250,199,117,0.85)",
  },
  typeBadgeText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.bg,
    fontWeight: Theme.fontWeight.semibold,
  },

  // Actions
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  actionBtnActive: {
    backgroundColor: "rgba(218,165,32,0.1)",
    borderColor: "rgba(218,165,32,0.4)",
  },
  actionBtnWishActive: {
    backgroundColor: Colors.pillActive,
    borderColor: Colors.borderActive,
  },
  actionBtnCollActive: {
    backgroundColor: "rgba(74,222,170,0.1)",
    borderColor: "rgba(74,222,170,0.3)",
  },
  actionLabel: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
    textAlign: "center",
  },
  actionLabelFav: {
    color: "#DAA520",
  },
  actionLabelWish: {
    color: Colors.accent,
  },
  actionLabelColl: {
    color: Colors.accent,
  },

  // Infos
  infoSection: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
  },
  infoTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Theme.spacing.md,
  },
});
