import { ImageCropperModal } from "@/src/components/ui/ImageCropperModal";
import { Camera, Crop, Image as ImageIcon, X } from "lucide-react-native";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface FormImagePickerProps {
  label: string;
  imageUri?: string;
  onPick: () => void;
  onRemove: () => void;
  onImageResized?: (uri: string) => void;
  aspectRatio?: number;
  required?: boolean;
  error?: string;
  previewWidth?: number;
}

export const FormImagePicker: React.FC<FormImagePickerProps> = ({
  label,
  imageUri,
  onPick,
  onRemove,
  onImageResized,
  aspectRatio = 0.68,
  required,
  error,
  previewWidth = 140,
}) => {
  const [cropperOpen, setCropperOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      {imageUri ? (
        <View style={[styles.card, { width: previewWidth }]}>
          <View style={styles.imgWrap}>
            <Image
              source={{ uri: imageUri }}
              style={[styles.img, { aspectRatio }]}
              resizeMode="cover"
            />
            <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
              <X size={13} color={Colors.text} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.actionBar}>
            {onImageResized && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnLeft]}
                onPress={() => setCropperOpen(true)}
                activeOpacity={0.7}
              >
                <Crop size={13} color={Colors.textMuted} strokeWidth={1.8} />
                <Text style={styles.actionBtnText}>Recadrer</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                onImageResized ? styles.actionBtnRight : styles.actionBtnFull,
              ]}
              onPress={onPick}
              activeOpacity={0.7}
            >
              <Camera size={13} color={Colors.textMuted} strokeWidth={1.8} />
              <Text style={styles.actionBtnText}>Changer</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.emptyZone, error ? styles.emptyZoneError : {}]}
          onPress={onPick}
          activeOpacity={0.75}
        >
          <ImageIcon size={28} color={Colors.textMuted} strokeWidth={1.4} />
          <Text style={styles.emptyTitle}>Appuie pour choisir une image</Text>
          <Text style={styles.emptySub}>JPG · PNG · WEBP</Text>
        </TouchableOpacity>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      {/* ── Cropper modal ── */}
      {imageUri && onImageResized && (
        <ImageCropperModal
          visible={cropperOpen}
          imageUri={imageUri}
          aspectRatio={aspectRatio}
          onCrop={(uri) => {
            onImageResized(uri);
            setCropperOpen(false);
          }}
          onClose={() => setCropperOpen(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: {
    fontSize: Theme.fontSize.sm + 1,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
  },
  required: { color: Colors.danger },
  emptyZone: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: "dashed",
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.lg,
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surface,
  },
  emptyZoneError: { borderColor: Colors.danger },
  emptyTitle: { fontSize: Theme.fontSize.sm + 1, color: Colors.textMuted },
  emptySub: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
    opacity: 0.6,
  },
  card: {
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    overflow: "hidden",
  },
  imgWrap: { position: "relative" },
  img: { width: "100%" },
  removeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.bg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBar: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 9,
    backgroundColor: Colors.surface,
  },
  actionBtnLeft: { borderRightWidth: 0.5, borderRightColor: Colors.border },
  actionBtnRight: {},
  actionBtnFull: {},
  actionBtnText: { fontSize: Theme.fontSize.xs + 1, color: Colors.textMuted },
  error: { fontSize: Theme.fontSize.sm + 1, color: Colors.danger },
});
