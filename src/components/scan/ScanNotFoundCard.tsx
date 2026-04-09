import { Plus, X } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface ScanNotFoundCardProps {
  onSubmit: () => void;
  onDismiss: () => void;
  prefilledGroupId?: string;
  prefilledMemberId?: string;
}

export const ScanNotFoundCard: React.FC<ScanNotFoundCardProps> = ({
  onSubmit,
  onDismiss,
}) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>❓ Photocard inconnue</Text>
      <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
        <X size={16} color={Colors.textMuted} strokeWidth={1.8} />
      </TouchableOpacity>
    </View>
    <View style={styles.body}>
      <Text style={styles.text}>
        Cette photocard n'existe pas encore dans l'application. Tu peux la
        proposer — elle sera ajoutée après validation par un admin.
      </Text>
      {/* Info sur le pré-remplissage */}
      {/* <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          ✨ Le formulaire sera pré-rempli avec le groupe et le membre
          sélectionnés ainsi que l'image scannée.
        </Text>
      </View> */}
    </View>
    <TouchableOpacity style={styles.submitBtn} onPress={onSubmit}>
      <Plus size={16} color={Colors.bg} strokeWidth={2} />
      <Text style={styles.submitLabel}>Remplir le formulaire d'ajout</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 0.5,
    borderColor: "rgba(240,112,112,0.3)",
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
    color: Colors.danger,
  },
  closeBtn: { padding: 4 },
  body: {
    padding: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  text: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: Colors.pillActive,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
    padding: Theme.spacing.sm + 2,
  },
  infoText: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.accent,
    lineHeight: 18,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: Theme.spacing.md,
    backgroundColor: Colors.accent,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  submitLabel: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.bg,
  },
});
