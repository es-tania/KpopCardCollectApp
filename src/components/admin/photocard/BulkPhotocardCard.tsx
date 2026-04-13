import { FormSelect } from "@/src/components/ui/FormSelect";
import { Colors } from "@/src/constants/colors";
import { Theme } from "@/src/constants/theme";
import { BulkPhotocard } from "@/src/hooks/useBulkAddPhotocards";
import { SelectOption } from "@/src/types";
import { pickLocalImage } from "@/src/utils/pickLocalImage";
import { Trash2 } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BulkPhotocardCardProps {
  card: BulkPhotocard;
  index: number;
  memberOptions: SelectOption[];
  onChange: (localId: string, key: keyof BulkPhotocard, value: string) => void;
  onRemove: (localId: string) => void;
  error?: string;
}

export const BulkPhotocardCard: React.FC<BulkPhotocardCardProps> = ({
  card,
  index,
  memberOptions,
  onChange,
  onRemove,
  error,
}) => (
  <View style={styles.card}>
    {/* ── Header ── */}
    <View style={styles.header}>
      <View style={styles.indexBadge}>
        <Text style={styles.indexText}>{index + 1}</Text>
      </View>
      <Text style={styles.headerTitle}>
        {card.memberName || `Photocard ${index + 1}`}
      </Text>
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => onRemove(card.localId)}
      >
        <Trash2 size={15} color={Colors.danger} strokeWidth={1.8} />
      </TouchableOpacity>
    </View>

    {/* ── Contenu ── */}
    <View style={styles.body}>
      <View style={styles.row}>
        {/* Images */}
        <View style={styles.imagesCol}>
          {/* Recto */}
          <TouchableOpacity
            style={[styles.imagePicker, error && styles.imagePickerError]}
            onPress={() =>
              pickLocalImage((uri) => onChange(card.localId, "imageUri", uri), {
                aspect: [2, 3],
              })
            }
            activeOpacity={0.8}
          >
            {card.imageUri ? (
              <Image
                source={{ uri: card.imageUri }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderIcon}>📷</Text>
                <Text style={styles.imagePlaceholderText}>Recto *</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Verso */}
          <TouchableOpacity
            style={styles.imagePickerSmall}
            onPress={() =>
              pickLocalImage(
                (uri) => onChange(card.localId, "backImageUri", uri),
                { aspect: [2, 3] },
              )
            }
            activeOpacity={0.8}
          >
            {card.backImageUri ? (
              <Image
                source={{ uri: card.backImageUri }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderIcon}>🔄</Text>
                <Text style={styles.imagePlaceholderText}>Verso</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Membre */}
        <View style={styles.memberCol}>
          <FormSelect
            label="Membre *"
            options={memberOptions}
            value={card.memberId}
            onChange={(v) => {
              const member = memberOptions.find((m) => m.key === v);
              onChange(card.localId, "memberId", v);
              onChange(card.localId, "memberName", member?.label ?? "");
            }}
            placeholder="Sélectionner..."
            error={error}
          />
        </View>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.sm,
    padding: Theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  indexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.pillActive,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
    alignItems: "center",
    justifyContent: "center",
  },
  indexText: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.semibold,
  },
  headerTitle: {
    flex: 1,
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
  },
  removeBtn: { padding: 4 },
  body: {
    padding: Theme.spacing.md,
    gap: Theme.spacing.md,
  },
  row: {
    flexDirection: "row",
    gap: Theme.spacing.md,
  },
  imagesCol: {
    gap: 8,
    width: 90,
  },
  imagePicker: {
    width: 90,
    height: 132,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
    overflow: "hidden",
    backgroundColor: Colors.surface2,
  },
  imagePickerError: {
    borderColor: Colors.danger,
  },
  imagePickerSmall: {
    width: 90,
    height: 60,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
    overflow: "hidden",
    backgroundColor: Colors.surface2,
  },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  imagePlaceholderIcon: { fontSize: 20 },
  imagePlaceholderText: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
    textAlign: "center",
  },
  memberCol: { flex: 1 },
});
