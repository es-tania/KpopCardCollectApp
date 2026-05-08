import { BackImagePickerModal } from "@/src/components/photocard/BackImagePickerModal";
import { MemberMultiSelect } from "@/src/components/ui/MemberMultiSelect";
import { Colors } from "@/src/constants/colors";
import { CardFormat } from "@/src/constants/options/cardFormatOptions";
import { Theme } from "@/src/constants/theme";
import { BulkPhotocard } from "@/src/hooks/useBulkAddPhotocards";
import { Member } from "@/src/types";
import { pickCardImage } from "@/src/utils/pickCardImage";
import { History, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BulkPhotocardCardProps {
  card: BulkPhotocard;
  index: number;
  members: Member[];
  groupId?: string;
  albumId?: string;
  onChange: (localId: string, key: keyof BulkPhotocard, value: any) => void;
  onRemove: (localId: string) => void;
  error?: string;
  hasCommonBack?: boolean;
  aspectRatio?: CardFormat;
  currentRatio?: number;
}

export const BulkPhotocardCard: React.FC<BulkPhotocardCardProps> = ({
  card,
  index,
  members,
  groupId,
  albumId,
  onChange,
  onRemove,
  error,
  hasCommonBack,
  aspectRatio = "photocard",
  currentRatio = 2 / 3,
}) => {
  const ratio = currentRatio > 0 ? currentRatio : 2 / 3;
  const cardWidth = 90;
  const cardHeight = Math.round(cardWidth / ratio);

  const [showBackPicker, setShowBackPicker] = useState(false);

  const pickRecto = () =>
    pickCardImage({
      aspectRatio,
      currentRatio: ratio,
      onPicked: (uri) => onChange(card.localId, "imageUri", uri),
    });

  const pickVerso = () =>
    pickCardImage({
      aspectRatio,
      currentRatio: ratio,
      onPicked: (uri) => onChange(card.localId, "backImageUri", uri),
    });

  return (
    <View style={styles.card}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.indexBadge}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>
        <Text style={styles.headerTitle} numberOfLines={1}>
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
          {/* ── Images ── */}
          <View style={styles.imagesCol}>
            {/* Recto */}
            <TouchableOpacity
              style={[
                styles.imagePicker,
                { height: cardHeight },
                error && styles.imagePickerError,
              ]}
              onPress={pickRecto}
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
              style={[
                styles.imagePickerSmall,
                { height: Math.round(cardHeight * 0.45) },
              ]}
              onPress={pickVerso}
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

            {/* Bouton verso existant */}
            {groupId && (
              <TouchableOpacity
                style={styles.backPickerBtn}
                onPress={() => setShowBackPicker(true)}
                activeOpacity={0.75}
              >
                <History size={11} color={Colors.accent} strokeWidth={1.6} />
                <Text style={styles.backPickerText}>Existant</Text>
              </TouchableOpacity>
            )}

            {/* Hint verso commun */}
            {hasCommonBack && !card.backImageUri && (
              <View style={styles.commonBackHint}>
                <Text style={styles.commonBackHintText}>✓ Commun</Text>
              </View>
            )}
          </View>

          {/* ── Membres ── */}
          <View style={styles.memberCol}>
            <MemberMultiSelect
              label="Membre(s) *"
              members={members}
              selectedIds={
                card.memberIds ?? (card.memberId ? [card.memberId] : [])
              }
              onChange={(ids) => {
                onChange(card.localId, "memberIds", ids);
                onChange(card.localId, "memberId", ids[0] ?? "");
                const names = ids
                  .map(
                    (id) => members.find((m) => m.id === id)?.stageName ?? "",
                  )
                  .filter(Boolean)
                  .join(" & ");
                onChange(card.localId, "memberName", names);
              }}
              required
              error={error}
            />
          </View>
        </View>
      </View>

      {/* ── Modal verso existant ── */}
      <BackImagePickerModal
        visible={showBackPicker}
        onClose={() => setShowBackPicker(false)}
        onSelect={(url) => {
          onChange(card.localId, "backImageUri", url);
          setShowBackPicker(false);
        }}
        groupId={groupId}
        albumId={albumId}
      />
    </View>
  );
};

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
  body: { padding: Theme.spacing.md, gap: Theme.spacing.md },
  row: { flexDirection: "row", gap: Theme.spacing.md },
  imagesCol: { gap: 6, width: 90 },
  imagePicker: {
    width: 90,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
    overflow: "hidden",
    backgroundColor: Colors.surface2,
  },
  imagePickerError: { borderColor: Colors.danger },
  imagePickerSmall: {
    width: 90,
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
  imagePlaceholderIcon: { fontSize: 16 },
  imagePlaceholderText: {
    fontSize: Theme.fontSize.xs,
    color: Colors.textMuted,
    textAlign: "center",
  },
  backPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Colors.pillActive,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
  },
  backPickerText: {
    fontSize: Theme.fontSize.xs,
    color: Colors.accent,
  },
  commonBackHint: {
    backgroundColor: "rgba(145,126,255,0.08)",
    borderRadius: Theme.borderRadius.sm,
    paddingVertical: 3,
    borderWidth: 0.5,
    borderColor: Colors.accent + "30",
    alignItems: "center",
  },
  commonBackHintText: {
    fontSize: Theme.fontSize.xs,
    color: Colors.accent,
  },
  memberCol: { flex: 1 },
});
