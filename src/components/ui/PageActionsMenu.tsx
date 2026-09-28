import { Colors } from "@/src/constants/colors";
import { Theme } from "@/src/constants/theme";
import { useAuthStore } from "@/src/store/authStore";
import { Album, BookPlus, Users, X } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageActionsMenuProps {
  visible: boolean;
  onClose: () => void;
  shareUrl?: string;
  shareTitle?: string;
  onAddCard?: () => void;
  onAddAlbum?: () => void;
  onAddGroup?: () => void;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export const PageActionsMenu: React.FC<PageActionsMenuProps> = ({
  visible,
  onClose,
  shareUrl,
  shareTitle,
  onAddCard,
  onAddAlbum,
  onAddGroup,
}) => {
  const { isAdmin, groupAdminIds } = useAuthStore();
  const canAdmin = isAdmin || (groupAdminIds?.length ?? 0) > 0;

  const translateY = useRef(new Animated.Value(300)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleShare = async () => {
    if (!shareUrl) return;
    try {
      await Share.share({
        message: shareTitle ? `${shareTitle}\n${shareUrl}` : shareUrl,
      });
    } catch {}
    onClose();
  };

  const handleAction = (fn?: () => void) => {
    onClose();
    setTimeout(() => fn?.(), 250); // ← laisse le menu se fermer avant d'ouvrir le form
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* ── Overlay ── */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity }]} />
      </TouchableWithoutFeedback>

      {/* ── Sheet ── */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* ── Ajouter une carte (admin seulement) ── */}
        {onAddCard && (
          <TouchableOpacity
            style={styles.item}
            onPress={() => handleAction(onAddCard)}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrap, styles.iconCard]}>
              <Album size={18} color="#fff" strokeWidth={1.8} />
            </View>
            <View style={styles.itemText}>
              <Text style={styles.itemTitle}>Ajouter une carte</Text>
              <Text style={styles.itemSub}>
                Soumettre une nouvelle photocard
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* ── Ajouter un album (admin seulement) ── */}
        {onAddAlbum && (
          <TouchableOpacity
            style={styles.item}
            onPress={() => handleAction(onAddAlbum)}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrap, styles.iconAlbum]}>
              <BookPlus size={18} color="#fff" strokeWidth={1.8} />
            </View>
            <View style={styles.itemText}>
              <Text style={styles.itemTitle}>Ajouter un album</Text>
              <Text style={styles.itemSub}>Soumettre un nouvel album</Text>
            </View>
          </TouchableOpacity>
        )}

        {onAddGroup && (
          <TouchableOpacity
            style={styles.item}
            onPress={() => handleAction(onAddGroup)}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrap, { backgroundColor: "#E8845B" }]}>
              <Users size={18} color="#fff" strokeWidth={1.8} />
            </View>
            <View style={styles.itemText}>
              <Text style={styles.itemTitle}>Ajouter un groupe</Text>
              <Text style={styles.itemSub}>
                Soumettre un nouveau groupe de K-pop
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* ── Partager ── */}
        {/* {shareUrl && (
          <TouchableOpacity
            style={styles.item}
            onPress={handleShare}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrap, styles.iconShare]}>
              <Share2 size={18} color="#fff" strokeWidth={1.8} />
            </View>
            <View style={styles.itemText}>
              <Text style={styles.itemTitle}>Partager la page</Text>
              <Text style={styles.itemSub}>Copier le lien ou envoyer</Text>
            </View>
          </TouchableOpacity>
        )} */}

        {/* ── Fermer ── */}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={onClose}
          activeOpacity={0.75}
        >
          <X size={16} color={Colors.textMuted} strokeWidth={1.8} />
          <Text style={styles.cancelText}>Fermer</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: 36,
    paddingTop: Theme.spacing.sm,
    gap: 4,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: Theme.spacing.md,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  iconShare: { backgroundColor: Colors.accent },
  iconCard: { backgroundColor: "#5B8DEF" },
  iconAlbum: { backgroundColor: "#7BC67E" },
  itemText: { flex: 1, gap: 2 },
  itemTitle: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
  },
  itemSub: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: Theme.spacing.sm,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Colors.surface2,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  cancelText: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
  },
});
