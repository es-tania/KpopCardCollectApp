import { Colors } from "@/src/constants/colors";
import {
  PHOTOCARD_TYPE_OPTIONS,
  RARITY_OPTIONS,
  SHOP_OPTIONS,
} from "@/src/constants/options";
import { Theme } from "@/src/constants/theme";
import { MOCK_ALBUMS, MOCK_MEMBERS } from "@/src/data";
import {
  PhotocardEditFormState,
  PhotocardWithDetails,
  SelectOption,
} from "@/src/types";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FormField } from "../../ui/FormField";
import { FormImagePicker } from "../../ui/FormImagePicker";
import { FormSelect } from "../../ui/FormSelect";
import { FormSubmitButton } from "../../ui/FormSubmitButton";

interface EditFormProps {
  card: PhotocardWithDetails;
  onSave: (data: PhotocardEditFormState) => void;
  onCancel: () => void;
  loading: boolean;
}

export const EditForm: React.FC<EditFormProps> = ({
  card,
  onSave,
  onCancel,
  loading,
}) => {
  const [form, setForm] = useState<PhotocardEditFormState>({
    type: card.type,
    version: card.version ?? "",
    shopName: card.shopName ?? "",
    rarity: card.rarity ?? "common",
    imageUri: "",
    backImageUri: "",
    memberId: card.memberId,
    albumId: card.albumId,
  });

  const set = (key: keyof PhotocardEditFormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Options album et membre liés au groupe de la carte
  const albumOptions: SelectOption[] = MOCK_ALBUMS.filter(
    (a) => a.groupId === card.groupId,
  ).map((a) => ({ key: a.id, label: a.title }));

  const memberOptions: SelectOption[] = MOCK_MEMBERS.filter(
    (m) => m.groupId === card.groupId,
  ).map((m) => ({ key: m.id, label: m.stageName }));

  return (
    <ScrollView
      contentContainerStyle={editStyles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Aperçu de la carte */}
      <View style={editStyles.previewCard}>
        <View style={editStyles.previewImage}>
          {card.imageUrl ? (
            <Image
              source={card.imageUrl as any}
              style={editStyles.previewImg}
              resizeMode="cover"
            />
          ) : (
            <Text style={editStyles.previewFallback}>🧑‍🎤</Text>
          )}
        </View>
        <View style={editStyles.previewInfo}>
          <Text style={editStyles.previewMember}>{card.memberName}</Text>
          <Text style={editStyles.previewGroup}>{card.groupName}</Text>
          <Text style={editStyles.previewAlbum}>{card.albumTitle}</Text>
        </View>
      </View>

      {/* Images */}
      <View style={editStyles.section}>
        <Text style={editStyles.sectionTitle}>Images</Text>
        <FormImagePicker
          label="Recto (laisser vide pour ne pas modifier)"
          imageUri={form.imageUri}
          onPick={() => set("imageUri")("https://picsum.photos/400/600")}
          onRemove={() => set("imageUri")("")}
        />
        <FormImagePicker
          label="Verso (optionnel)"
          imageUri={form.backImageUri}
          onPick={() =>
            set("backImageUri")("https://picsum.photos/400/600?blur=1")
          }
          onRemove={() => set("backImageUri")("")}
        />
      </View>

      {/* Identification */}
      <View style={editStyles.section}>
        <Text style={editStyles.sectionTitle}>Identification</Text>
        <FormSelect
          label="Album / Event"
          options={albumOptions}
          value={form.albumId}
          onChange={set("albumId")}
        />
        <FormSelect
          label="Membre"
          options={memberOptions}
          value={form.memberId}
          onChange={set("memberId")}
        />
      </View>

      {/* Détails */}
      <View style={editStyles.section}>
        <Text style={editStyles.sectionTitle}>Détails</Text>
        <FormSelect
          label="Type"
          options={PHOTOCARD_TYPE_OPTIONS}
          value={form.type}
          onChange={set("type")}
        />
        <FormField
          label="Version"
          value={form.version}
          onChangeText={set("version")}
          placeholder="ex: A ver., Digipack..."
        />
        <FormSelect
          label="Shop / Plateforme"
          options={SHOP_OPTIONS}
          value={form.shopName}
          onChange={set("shopName")}
          placeholder="Sélectionner un shop..."
        />
        <FormSelect
          label="Rareté"
          options={RARITY_OPTIONS}
          value={form.rarity}
          onChange={set("rarity")}
        />
      </View>

      {/* Actions */}
      <View style={editStyles.btnGroup}>
        <TouchableOpacity style={editStyles.cancelBtn} onPress={onCancel}>
          <Text style={editStyles.cancelText}>Annuler</Text>
        </TouchableOpacity>
        <View style={editStyles.saveBtn}>
          <FormSubmitButton
            label="Enregistrer"
            onPress={() => onSave(form)}
            loading={loading}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const editStyles = StyleSheet.create({
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
  previewImage: {
    width: 52,
    height: 76,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Colors.surface2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImg: { width: "100%", height: "100%" },
  previewFallback: { fontSize: 24 },
  previewInfo: { flex: 1, justifyContent: "center", gap: 4 },
  previewMember: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  previewGroup: {
    fontSize: Theme.fontSize.base,
    color: Colors.accent,
  },
  previewAlbum: {
    fontSize: Theme.fontSize.base,
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
});
