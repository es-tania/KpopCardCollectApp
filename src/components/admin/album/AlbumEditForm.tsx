import { FormField } from "@/src/components/ui/FormField";
import { FormImagePicker } from "@/src/components/ui/FormImagePicker";
import { FormSelect } from "@/src/components/ui/FormSelect";
import { FormSubmitButton } from "@/src/components/ui/FormSubmitButton";
import { Colors } from "@/src/constants/colors";
import {
  ALBUM_TYPE_LABELS,
  ALBUM_TYPE_OPTIONS,
  CATEGORY_OPTIONS,
  YES_NO_OPTIONS,
} from "@/src/constants/options";
import { Theme } from "@/src/constants/theme";
import { Album, AlbumEditFormState } from "@/src/types";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AlbumEditFormProps {
  album: Album;
  onSave: (data: AlbumEditFormState) => void;
  onCancel: () => void;
  loading: boolean;
  progress: string | null; // ← nouveau
}

const pickLocalImage = async (
  onPicked: (uri: string) => void,
  aspect?: [number, number],
) => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: aspect ?? [1, 1],
    quality: 0.85,
  });

  if (!result.canceled) onPicked(result.assets[0].uri);
};

// ─── Composant ────────────────────────────────────────────────────────────────

export const AlbumEditForm: React.FC<AlbumEditFormProps> = ({
  album,
  onSave,
  onCancel,
  loading,
  progress,
}) => {
  const [form, setForm] = useState<AlbumEditFormState>({
    title: album.title,
    koreanTitle: album.koreanTitle ?? "",
    type: album.type,
    category: album.category ?? "music",
    releaseDate: album.releaseDate ?? "",
    eventName: album.eventName ?? "",
    eventLocation: album.eventLocation ?? "",
    eventDate: album.eventDate ?? "",
    versions: album.versions?.join(", ") ?? "",
    hasPOB: album.hasPOB ? "oui" : "non",
    isLimited: album.isLimited ? "oui" : "non",
    coverUri: "",
    tags: album.tags?.join(", ") ?? "",
    removeCover: false,
  });

  const set = (key: keyof AlbumEditFormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Aperçu album ── */}
      <View style={styles.previewCard}>
        <View style={styles.previewCover}>
          {album.coverUrl ? (
            <Image
              source={album.coverUrl as any}
              style={styles.previewCoverImg}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.previewCoverEmoji}>📀</Text>
          )}
        </View>
        <View style={styles.previewInfo}>
          <Text style={styles.previewTitle}>{album.title}</Text>
          {album.koreanTitle && (
            <Text style={styles.previewKorean}>{album.koreanTitle}</Text>
          )}
          <Text style={styles.previewMeta}>
            {ALBUM_TYPE_LABELS[album.type]}
            {album.releaseDate
              ? ` · ${new Date(album.releaseDate).getFullYear()}`
              : ""}
          </Text>
          <Text style={styles.previewCount}>
            {album.totalPhotocards} photocards
          </Text>
        </View>
      </View>

      {/* ── Cover ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Couverture</Text>
        <FormImagePicker
          label="Nouvelle couverture"
          imageUri={form.coverUri || (album.coverUrl as any)?.uri || ""}
          onPick={() =>
            pickLocalImage(
              (uri) => {
                set("coverUri")(uri);
                setForm((prev) => ({ ...prev, removeCover: false }));
              },
              [1, 1],
            )
          }
          onRemove={() =>
            setForm((prev) => ({
              ...prev,
              coverUri: "",
              removeCover: true,
            }))
          }
          aspectRatio={1}
        />
      </View>

      {/* ── Identité ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Identité</Text>
        <FormField
          label="Titre"
          value={form.title}
          onChangeText={set("title")}
          placeholder="ex: UNIQUE"
          required
          autoCapitalize="words"
        />
        <FormField
          label="Titre coréen"
          value={form.koreanTitle}
          onChangeText={set("koreanTitle")}
          placeholder="ex: 유니크"
        />
        <FormSelect
          label="Type"
          options={ALBUM_TYPE_OPTIONS}
          value={form.type}
          onChange={set("type")}
          required
        />
        <FormSelect
          label="Catégorie"
          options={CATEGORY_OPTIONS}
          value={form.category}
          onChange={set("category")}
        />
      </View>

      {/* ── Dates ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dates</Text>
        <FormField
          label="Date de sortie"
          value={form.releaseDate}
          onChangeText={set("releaseDate")}
          placeholder="YYYY-MM-DD"
        />
        <FormField
          label="Date de l'event"
          value={form.eventDate}
          onChangeText={set("eventDate")}
          placeholder="YYYY-MM-DD"
        />
      </View>

      {/* ── Event ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Event (optionnel)</Text>
        <FormField
          label="Nom de l'event"
          value={form.eventName}
          onChangeText={set("eventName")}
          placeholder="ex: Weverse Fansign Vol.3"
        />
        <FormField
          label="Lieu"
          value={form.eventLocation}
          onChangeText={set("eventLocation")}
          placeholder="ex: Seoul, Corée du Sud"
        />
      </View>

      {/* ── Détails ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Détails</Text>
        <FormField
          label="Versions"
          value={form.versions}
          onChangeText={set("versions")}
          placeholder="ex: A, B, Digipack (séparées par virgule)"
        />
        <FormField
          label="Tags"
          value={form.tags}
          onChangeText={set("tags")}
          placeholder="ex: 1st mini, debut (séparés par virgule)"
        />
        <FormSelect
          label="Contient des POB ?"
          options={YES_NO_OPTIONS}
          value={form.hasPOB}
          onChange={set("hasPOB")}
        />
        <FormSelect
          label="Édition limitée ?"
          options={YES_NO_OPTIONS}
          value={form.isLimited}
          onChange={set("isLimited")}
        />
      </View>

      {/* ── Actions ── */}
      <View style={styles.btnGroup}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Annuler</Text>
        </TouchableOpacity>
        <View style={styles.saveBtn}>
          <FormSubmitButton
            label="Enregistrer"
            onPress={() => onSave(form)}
            loading={loading}
          />
        </View>
      </View>

      {/* Progression */}
      {progress && (
        <View style={styles.progressWrap}>
          <ActivityIndicator size="small" color={Colors.accent} />
          <Text style={styles.progressText}>{progress}</Text>
        </View>
      )}
    </ScrollView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  content: {
    padding: Theme.spacing.lg,
    gap: Theme.spacing.xl,
  },
  previewCard: {
    flexDirection: "row",
    gap: Theme.spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
    padding: Theme.spacing.md,
  },
  previewCover: {
    width: 64,
    height: 64,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Colors.surface2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  previewCoverImg: { width: "100%", height: "100%" },
  previewCoverEmoji: { fontSize: 28 },
  previewInfo: { flex: 1, justifyContent: "center", gap: 3 },
  previewTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  previewKorean: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
  },
  previewMeta: {
    fontSize: Theme.fontSize.base,
    color: Colors.accent,
  },
  previewCount: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  section: { gap: Theme.spacing.md },
  sectionTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    paddingBottom: Theme.spacing.sm,
  },
  btnGroup: {
    flexDirection: "row",
    gap: Theme.spacing.md,
    alignItems: "center",
  },
  cancelBtn: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  cancelText: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
    fontWeight: Theme.fontWeight.medium,
  },
  saveBtn: { flex: 1 },
  progressWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
    padding: Theme.spacing.md,
  },
  progressText: {
    fontSize: Theme.fontSize.base,
    color: Colors.accent,
  },
});
