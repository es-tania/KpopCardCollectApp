import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { PhotocardWithDetails, ScanStatus } from "../../types";

interface ScanResultCardProps {
  status: ScanStatus;
  card?: PhotocardWithDetails;
  onAddToCollection?: () => void;
  onAddToWishlist?: () => void;
  onSubmitNew?: () => void;
  onDismiss?: () => void;
}

export const ScanResultCard: React.FC<ScanResultCardProps> = ({
  status,
  card,
  onAddToCollection,
  onAddToWishlist,
  onSubmitNew,
  onDismiss,
}) => {
  if (status === "found" && card) {
    return (
      <View style={[styles.container, styles.found]}>
        <View style={styles.header}>
          <Text style={styles.statusFound}>✅ Carte trouvée !</Text>
          <TouchableOpacity onPress={onDismiss}>
            <Text style={styles.dismiss}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cardPreview}>
          <View style={styles.imageBox}>
            {card.imageUrl ? (
              <Image source={card.imageUrl as any} style={styles.image} />
            ) : (
              <Text style={styles.imageFallback}>🧑‍🎤</Text>
            )}
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>
              {card.memberName} — {card.groupName}
            </Text>
            <Text style={styles.cardSub}>
              {card.albumTitle} · {card.type === "pob" ? "POB" : "Normal"}
              {card.version ? ` · Ver. ${card.version}` : ""}
            </Text>
            {card.isInCollection ? (
              <Text style={styles.alreadyOwned}>Déjà dans ta collection</Text>
            ) : (
              <Text style={styles.notOwned}>Pas encore dans ta collection</Text>
            )}
          </View>
        </View>
        {!card.isInCollection && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={onAddToCollection}
            >
              <Text style={styles.btnPrimaryText}>
                + Ajouter à la collection
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={onAddToWishlist}
            >
              <Text style={styles.btnSecondaryText}>🌟 Wishlist</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.notFound]}>
      <View style={styles.header}>
        <Text style={styles.statusNotFound}>❓ Carte inconnue</Text>
        <TouchableOpacity onPress={onDismiss}>
          <Text style={styles.dismiss}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.notFoundText}>
        Cette carte n'existe pas encore dans l'application. Tu peux la soumettre
        pour qu'elle soit ajoutée après validation.
      </Text>
      <TouchableOpacity style={styles.btnPrimary} onPress={onSubmitNew}>
        <Text style={styles.btnPrimaryText}>Proposer l'ajout →</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Theme.borderRadius.lg,
    padding: 14,
    borderWidth: 0.5,
    marginTop: 12,
  },
  found: {
    backgroundColor: "rgba(74, 222, 170, 0.05)",
    borderColor: "rgba(74, 222, 170, 0.3)",
  },
  notFound: {
    backgroundColor: "rgba(125, 211, 240, 0.05)",
    borderColor: Colors.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statusFound: {
    fontSize: Theme.fontSize.md,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
  statusNotFound: {
    fontSize: Theme.fontSize.md,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
  dismiss: {
    fontSize: 14,
    color: Colors.textMuted,
    padding: 4,
  },
  cardPreview: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  imageBox: {
    width: 52,
    height: 66,
    borderRadius: 8,
    backgroundColor: Colors.surface2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageFallback: {
    fontSize: 24,
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardName: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
  },
  cardSub: {
    fontSize: Theme.fontSize.md,
    color: Colors.textMuted,
  },
  alreadyOwned: {
    fontSize: Theme.fontSize.sm,
    color: Colors.accent,
  },
  notOwned: {
    fontSize: Theme.fontSize.sm,
    color: Colors.accent,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: Colors.accent,
    borderRadius: Theme.borderRadius.sm,
    padding: 9,
    alignItems: "center",
  },
  btnPrimaryText: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.bg,
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: Colors.surface2,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Theme.borderRadius.sm,
    padding: 9,
    alignItems: "center",
  },
  btnSecondaryText: {
    fontSize: Theme.fontSize.md,
    color: Colors.textMuted,
  },
  notFoundText: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
    lineHeight: 18,
    marginBottom: 12,
  },
});
