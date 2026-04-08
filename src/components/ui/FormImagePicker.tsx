import { Camera, Image as ImageIcon, X } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface FormImagePickerProps {
  label: string;
  imageUri?: string;
  onPick: () => void;
  onRemove: () => void;
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
  aspectRatio = 0.68,
  required,
  error,
  previewWidth = 120,
}) => (
  <View style={styles.container}>
    <Text style={styles.label}>
      {label}
      {required && <Text style={styles.required}> *</Text>}
    </Text>

    {imageUri ? (
      <View style={styles.previewWrap}>
        <Image
          source={{ uri: imageUri }}
          style={[styles.preview, { width: previewWidth, aspectRatio }]}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
          <X size={14} color={Colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.changeBtn} onPress={onPick}>
          <Camera size={12} color={Colors.text} strokeWidth={2} />
          <Text style={styles.changeBtnText}>Changer</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <TouchableOpacity
        style={[styles.picker, error ? styles.pickerError : {}]}
        onPress={onPick}
        activeOpacity={0.75}
      >
        <ImageIcon size={28} color={Colors.textMuted} strokeWidth={1.4} />
        <Text style={styles.pickerText}>Appuie pour choisir une image</Text>
        <Text style={styles.pickerSub}>JPG, PNG, WEBP</Text>
      </TouchableOpacity>
    )}

    {error && <Text style={styles.error}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: {
    fontSize: Theme.fontSize.base,
    color: Colors.text,
    fontWeight: Theme.fontWeight.medium,
  },
  required: { color: Colors.danger },
  picker: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
    borderRadius: Theme.borderRadius.sm,
    padding: Theme.spacing.xl,
    alignItems: "center",
    gap: 8,
  },
  pickerError: { borderColor: Colors.danger },
  pickerText: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
  },
  pickerSub: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  previewWrap: {
    position: "relative",
    alignSelf: "flex-start",
  },
  preview: {
    width: 120,
    borderRadius: Theme.borderRadius.md,
  },
  removeBtn: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  changeBtn: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "rgba(9,12,18,0.7)",
    borderRadius: Theme.borderRadius.sm,
    paddingVertical: 5,
  },
  changeBtnText: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.text,
  },
  error: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.danger,
  },
});
