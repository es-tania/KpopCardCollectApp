import { Colors } from "@/src/constants/colors";
import {
  PHOTOCARD_TYPE_OPTIONS,
  RARITY_OPTIONS,
} from "@/src/constants/options";
import {
  CARD_FORMAT_OPTIONS,
  CardFormat,
  getCardRatio,
} from "@/src/constants/options/cardFormatOptions";
import { Theme } from "@/src/constants/theme";
import { useAlbums } from "@/src/hooks/album/useAlbums";
import { useGroupMembers } from "@/src/hooks/group/useGroupMembers";
import { useGroupShops } from "@/src/hooks/shops/useGroupShops";
import { useShops } from "@/src/hooks/shops/useShops";
import {
  PhotocardEditFormState,
  PhotocardWithDetails,
  SelectOption,
} from "@/src/types";
import { pickCardImage } from "@/src/utils/pickCardImage";
import { useCallback, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
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
import { MemberMultiSelect } from "../../ui/MemberMultiSelect";
import { ProgressIndicator } from "../../ui/ProgressIndicator";

interface EditFormProps {
  card: PhotocardWithDetails;
  onSave: (data: PhotocardEditFormState) => void;
  onCancel: () => void;
  loading: boolean;
  progress: string | null;
}

export const EditForm: React.FC<EditFormProps> = ({
  card,
  onSave,
  onCancel,
  loading,
  progress,
}) => {
  const [form, setForm] = useState<PhotocardEditFormState>({
    type: card.type,
    version: card.version ?? "",
    shopName: card.shopName ?? "",
    rarity: card.rarity ?? "common",
    memberId: card.memberId,
    memberIds: card.cardMembers?.map((m) => m.id) ?? [card.memberId],
    albumId: card.albumId,
    imageUri: "",
    backImageUri: "",
    removeImage: false,
    removeBackImage: false,
    aspectRatio: (card.aspectRatio as CardFormat) ?? "photocard",
    customWidth: card.customWidth,
    customHeight: card.customHeight,
  });

  const { albums } = useAlbums(card.groupId);
  const { members } = useGroupMembers(card.groupId);
  const { shopOptions, loading: shopsLoading } = useShops();
  const { sortedOptions } = useGroupShops(card.groupId, shopOptions);

  const set = (key: keyof PhotocardEditFormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Options album et membre liés au groupe de la carte
  const albumOptions: SelectOption[] = albums.map((a) => ({
    key: a.id,
    label: a.title,
  }));

  const currentRatio = getCardRatio(
    form.aspectRatio,
    form.customWidth,
    form.customHeight,
  );
  const previewHeight = currentRatio > 0 ? Math.round(52 / currentRatio) : 76;

  const pickImage = useCallback(
    (
      field: "imageUri" | "backImageUri",
      removeField: "removeImage" | "removeBackImage",
    ) => {
      pickCardImage({
        aspectRatio: form.aspectRatio,
        currentRatio,
        onPicked: (uri, dimensions) => {
          setForm((prev) => ({
            ...prev,
            [field]: uri,
            [removeField]: false,
            ...(dimensions && {
              customWidth: dimensions.width,
              customHeight: dimensions.height,
            }),
          }));
        },
      });
    },
    [form.aspectRatio, currentRatio],
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={editStyles.content}
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={true}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        {/* Aperçu de la carte */}
        <View style={editStyles.previewCard}>
          <View style={[editStyles.previewImage, { height: previewHeight }]}>
            {form.imageUri ? (
              <Image
                source={{ uri: form.imageUri }}
                style={editStyles.previewImg}
                resizeMode="cover"
              />
            ) : card.imageUrl && !form.removeImage ? (
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

        <View style={editStyles.section}>
          <Text style={editStyles.sectionTitle}>Format</Text>
          <FormSelect
            label="Format de la carte"
            options={CARD_FORMAT_OPTIONS.map((f) => ({
              key: f.key,
              label: f.label,
            }))}
            value={form.aspectRatio}
            onChange={(v) =>
              setForm((prev) => ({
                ...prev,
                aspectRatio: v as CardFormat,
                customWidth: undefined,
                customHeight: undefined,
              }))
            }
          />
        </View>

        {/* Images */}
        <View style={editStyles.section}>
          <Text style={editStyles.sectionTitle}>Images</Text>
          <FormImagePicker
            label="Recto"
            imageUri={form.imageUri || (card.imageUrl as any)?.uri || ""}
            onPick={() => pickImage("imageUri", "removeImage")}
            onRemove={() =>
              setForm((prev) => ({ ...prev, imageUri: "", removeImage: true }))
            }
          />
          <FormImagePicker
            label="Verso (optionnel)"
            imageUri={
              form.backImageUri || (card.backImageUrl as any)?.uri || ""
            }
            onPick={() => pickImage("backImageUri", "removeBackImage")}
            onRemove={() =>
              setForm((prev) => ({
                ...prev,
                backImageUri: "",
                removeBackImage: true,
              }))
            }
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
            searchable
          />
          <MemberMultiSelect
            label="Membre(s)"
            members={members}
            selectedIds={form.memberIds}
            onChange={(ids) =>
              setForm((prev) => ({
                ...prev,
                memberIds: ids,
                memberId: ids[0] ?? "",
              }))
            }
            required
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
            options={sortedOptions}
            value={form.shopName}
            onChange={set("shopName")}
            placeholder="Sélectionner un shop..."
            loading={shopsLoading}
            searchable
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
          <ProgressIndicator message={progress} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    alignItems: "center",
  },
  previewImage: {
    width: 52,
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
  previewGroup: { fontSize: Theme.fontSize.base, color: Colors.accent },
  previewAlbum: { fontSize: Theme.fontSize.base, color: Colors.textMuted },
  section: { gap: Theme.spacing.md },
  sectionTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    paddingBottom: Theme.spacing.sm,
  },
  customSizeRow: {
    flexDirection: "row",
    gap: Theme.spacing.md,
    alignItems: "flex-start",
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
