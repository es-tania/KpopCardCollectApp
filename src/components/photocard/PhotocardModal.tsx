import {
    Calendar,
    Check,
    Hash,
    Layers,
    Plus,
    Share,
    ShoppingCart,
    Star,
    Tag,
    X,
} from "lucide-react-native";
import React from "react";
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

const TYPE_LABELS: Record<string, string> = {
  normal: "Normal",
  pob: "Pre-Order Benefit",
  lucky_draw: "Lucky Draw",
  broadcast: "Broadcast",
  event: "Event",
  benefit: "Benefit",
};

const STATUS_LABELS: Record<string, string> = {
  approved: "Approuvée",
  pending: "En attente",
  rejected: "Refusée",
};

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
  onPressFavorite?: () => void;
  onPressWishlist?: () => void;
  onPressCollection?: () => void;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export const PhotocardModal: React.FC<PhotocardModalProps> = ({
  card,
  visible,
  onClose,
  onPressFavorite,
  onPressWishlist,
  onPressCollection,
}) => {
  if (!card) return null;

  const typeLabel = TYPE_LABELS[card.type] ?? card.type;
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
          <TouchableOpacity style={styles.closeBtn}>
            <Share size={20} color={Colors.text} strokeWidth={1.8} />
          </TouchableOpacity>
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
              style={[
                styles.actionBtn,
                card.isFavorite && styles.actionBtnActive,
              ]}
              onPress={onPressFavorite}
              activeOpacity={0.75}
            >
              <Star
                size={18}
                color={card.isFavorite ? "#DAA520" : Colors.textMuted}
                fill={card.isFavorite ? "#DAA520" : "transparent"}
                strokeWidth={1.8}
              />
              <Text
                style={[
                  styles.actionLabel,
                  card.isFavorite && styles.actionLabelFav,
                ]}
              >
                {card.isFavorite ? "Favori" : "Ajouter aux favoris"}
              </Text>
            </TouchableOpacity>

            {/* Wishlist */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                card.isWishlisted && styles.actionBtnWishActive,
              ]}
              onPress={onPressWishlist}
              activeOpacity={0.75}
            >
              <ShoppingCart
                size={18}
                color={card.isWishlisted ? Colors.accent : Colors.textMuted}
                fill={card.isWishlisted ? Colors.accent : "transparent"}
                strokeWidth={1.8}
              />
              <Text
                style={[
                  styles.actionLabel,
                  card.isWishlisted && styles.actionLabelWish,
                ]}
              >
                {card.isWishlisted ? "Souhaitée" : "Wishlist"}
              </Text>
            </TouchableOpacity>

            {/* Collection */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                card.isInCollection && styles.actionBtnCollActive,
              ]}
              onPress={onPressCollection}
              activeOpacity={0.75}
            >
              {card.isInCollection ? (
                <Check size={18} color={Colors.accent} strokeWidth={2.2} />
              ) : (
                <Plus size={18} color={Colors.textMuted} strokeWidth={2} />
              )}
              <Text
                style={[
                  styles.actionLabel,
                  card.isInCollection && styles.actionLabelColl,
                ]}
              >
                {card.isInCollection ? "Collectée" : "Ma collection"}
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
            {card.number !== undefined && (
              <InfoRow
                icon={
                  <Hash size={14} color={Colors.textMuted} strokeWidth={1.6} />
                }
                label="Numéro"
                value={`#${card.number}`}
              />
            )}
            {card.shopName && (
              <InfoRow
                icon={
                  <Tag size={14} color={Colors.textMuted} strokeWidth={1.6} />
                }
                label="Shop"
                value={card.shopName}
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
              value={STATUS_LABELS[card.status] ?? card.status}
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
