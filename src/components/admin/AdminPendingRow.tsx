import { Check, X } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { PhotocardWithDetails } from "../../types";

interface AdminPendingRowProps {
  card: PhotocardWithDetails;
  submittedBy?: string;
  submittedAt?: string;
  onApprove: () => void;
  onReject: () => void;
}

export const AdminPendingRow: React.FC<AdminPendingRowProps> = ({
  card,
  submittedBy,
  submittedAt,
  onApprove,
  onReject,
}) => (
  <View style={styles.row}>
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
    </View>

    {/* Infos */}
    <View style={styles.info}>
      <Text style={styles.memberName} numberOfLines={1}>
        {card.memberName}
      </Text>
      <Text style={styles.albumTitle} numberOfLines={1}>
        {card.groupName} · {card.albumTitle}
      </Text>
      <Text style={styles.type}>
        {card.type.toUpperCase().replace("_", " ")}
        {card.version ? ` · ${card.version}` : ""}
      </Text>
      {submittedBy && (
        <Text style={styles.submittedBy}>
          Par @{submittedBy}
          {submittedAt ? ` · ${submittedAt}` : ""}
        </Text>
      )}
    </View>

    {/* Actions */}
    <View style={styles.actions}>
      <TouchableOpacity style={styles.approveBtn} onPress={onApprove}>
        <Check size={16} color={Colors.bg} strokeWidth={2.5} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.rejectBtn} onPress={onReject}>
        <X size={16} color={Colors.bg} strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  imageWrap: {
    width: 48,
    height: 70,
    borderRadius: Theme.borderRadius.sm,
    overflow: "hidden",
    backgroundColor: Colors.surface2,
  },
  image: { width: "100%", height: "100%" },
  imageFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imageFallbackEmoji: { fontSize: 20 },
  info: { flex: 1, gap: 3 },
  memberName: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
  },
  albumTitle: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  type: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.accent,
  },
  submittedBy: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
  },
  actions: { gap: 8 },
  approveBtn: {
    width: 32,
    height: 32,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectBtn: {
    width: 32,
    height: 32,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
});
