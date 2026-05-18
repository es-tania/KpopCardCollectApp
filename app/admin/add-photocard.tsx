import { BackImagePickerModal } from "@/src/components/photocard/BackImagePickerModal";
import { MemberMultiSelect } from "@/src/components/ui/MemberMultiSelect";
import { ProgressIndicator } from "@/src/components/ui/ProgressIndicator";
import {
  PHOTOCARD_TYPE_OPTIONS,
  RARITY_OPTIONS,
} from "@/src/constants/options";
import {
  CARD_FORMAT_OPTIONS,
  CardFormat,
  getCardRatio,
} from "@/src/constants/options/cardFormatOptions";
import { useAlbums } from "@/src/hooks/album/useAlbums";
import { useAccessibleGroups } from "@/src/hooks/group/useAccessibleGroups";
import { useGroupMembers } from "@/src/hooks/group/useGroupMembers";
import { useAddPhotocard } from "@/src/hooks/photocard/useAddPhotocard";
import { useGroupShops } from "@/src/hooks/shops/useGroupShops";
import { useShops } from "@/src/hooks/shops/useShops";
import { useTranslation } from "@/src/hooks/useTranslation";
import { useAuthStore } from "@/src/store/authStore";
import { PhotocardFormState, SelectOption } from "@/src/types";
import { pickCardImage } from "@/src/utils/pickCardImage";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, History } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FormField } from "../../src/components/ui/FormField";
import { FormImagePicker } from "../../src/components/ui/FormImagePicker";
import { FormSelect } from "../../src/components/ui/FormSelect";
import { FormSubmitButton } from "../../src/components/ui/FormSubmitButton";
import { Colors } from "../../src/constants/colors";
import { Theme } from "../../src/constants/theme";

// ─── Formulaire ───────────────────────────────────────────────────────────────

const INITIAL_FORM: PhotocardFormState = {
  groupId: "",
  groupName: "",
  albumId: "",
  memberIds: [],
  memberId: "",
  albumTitle: "",
  memberName: "",
  type: "",
  version: "",
  shopName: "",
  eventName: "",
  rarity: "common",
  imageUri: "",
  backImageUri: "",
  aspectRatio: "photocard",
  customWidth: undefined,
  customHeight: undefined,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AddPhotocardScreen() {
  const { t } = useTranslation();
  const { isAdmin, groupAdminIds } = useAuthStore();
  const { groupId: preGroupId, memberId: preMemberId } = useLocalSearchParams<{
    groupId?: string;
    memberId?: string;
  }>();
  const { groups } = useAccessibleGroups();
  const { userSubmission } = useLocalSearchParams<{
    userSubmission?: string;
  }>();
  const { shopOptions, loading: shopsLoading } = useShops();
  const isUserSubmission = userSubmission === "true";

  const [form, setForm] = useState<PhotocardFormState>({
    ...INITIAL_FORM,
    groupId: preGroupId ?? "",
    memberId: preMemberId ?? "",
    aspectRatio: "photocard" as CardFormat,
    customWidth: undefined as number | undefined,
    customHeight: undefined as number | undefined,
  });

  const { sortedOptions } = useGroupShops(form.groupId, shopOptions);

  const [showBackPicker, setShowBackPicker] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof PhotocardFormState, string>>
  >({});

  const { loading, progress, error, submit } = useAddPhotocard(() => {
    Alert.alert(t("success.cardAdded"), "", [
      { text: "OK", onPress: () => router.back() },
    ]);
  });

  useEffect(() => {
    if (error) Alert.alert(t("common.error"), error);
  }, [error, t]);

  const set = (key: keyof PhotocardFormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const { albums } = useAlbums(form.groupId || undefined);
  const { members } = useGroupMembers(form.groupId || null);

  const currentRatio = getCardRatio(
    form.aspectRatio,
    form.customWidth,
    form.customHeight,
  );

  const accessibleGroups = useMemo(() => {
    if (isAdmin) return groups;
    return groups.filter((g) => groupAdminIds.includes(g.id));
  }, [groups, isAdmin, groupAdminIds]);

  // Options dynamiques selon les sélections
  const groupOptions: SelectOption[] = groups.map((g) => ({
    key: g.id,
    label: g.name,
  }));

  const albumOptions: SelectOption[] = albums.map((a) => ({
    key: a.id,
    label: a.title,
  }));

  const memberOptions: SelectOption[] = members.map((m) => ({
    key: m.id,
    label: m.stageName,
  }));

  const handleSelectGroup = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    setForm((prev) => ({
      ...prev,
      groupId,
      groupName: group?.name ?? "",
      albumId: "",
      albumTitle: "",
      memberId: "",
      memberName: "",
    }));
  };

  const handleSelectMember = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    setForm((prev) => ({
      ...prev,
      memberId,
      memberName: member?.stageName ?? "",
    }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof PhotocardFormState, string>> = {};
    if (!form.groupId) e.groupId = t("errors.required");
    if (!form.albumId) e.albumId = t("errors.required");
    if (!form.memberId) e.memberId = t("errors.required");
    if (!form.type) e.type = t("errors.required");
    if (!form.imageUri) e.imageUri = t("errors.required");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const isGroupAdmin = groupAdminIds.includes(form.groupId);
    await submit(form, isAdmin || isGroupAdmin);
  };

  const handleSelectAlbum = (albumId: string) => {
    const album = albums.find((a) => a.id === albumId);
    setForm((prev) => ({
      ...prev,
      albumId,
      albumTitle: album?.title ?? "", // ← récupère le titre
    }));
  };

  const screenTitle = isUserSubmission
    ? t("admin.sections.addPhotocard")
    : t("admin.sections.addPhotocard");

  const pickImage = useCallback(
    (field: "imageUri" | "backImageUri") => {
      pickCardImage({
        aspectRatio: form.aspectRatio,
        currentRatio,
        onPicked: (uri, dimensions) => {
          setForm((prev) => ({
            ...prev,
            [field]: uri,
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
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{screenTitle}</Text>
        <View style={styles.navBtn} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={true}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Identification ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("fields.group")}</Text>
            <FormSelect
              label={t("fields.group")}
              options={groupOptions}
              value={form.groupId}
              onChange={handleSelectGroup}
              required
              error={errors.groupId}
              searchable
            />
            <FormSelect
              label={t("fields.album")}
              options={albumOptions}
              value={form.albumId}
              onChange={handleSelectAlbum}
              required
              error={errors.albumId}
              searchable
            />
            <MemberMultiSelect
              label={t("fields.member")}
              members={members}
              selectedIds={form.memberIds}
              onChange={(ids) =>
                setForm((prev) => ({
                  ...prev,
                  memberIds: ids,
                  memberId: ids[0] ?? "",
                  memberName:
                    members.find((m) => m.id === ids[0])?.stageName ?? "",
                }))
              }
              required
              error={errors.memberId}
            />
          </View>

          {/* ── Image ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("fields.front")}</Text>
            <FormSelect
              label="Format"
              options={CARD_FORMAT_OPTIONS.map((f) => ({
                key: f.key,
                label: f.label,
              }))}
              value={form.aspectRatio}
              onChange={(v) => set("aspectRatio")(v)}
            />

            {/* Dimensions custom */}
            {form.aspectRatio === "custom" && (
              <View style={styles.customSizeRow}>
                <FormField
                  label="Largeur (mm)"
                  value={form.customWidth?.toString() ?? ""}
                  onChangeText={(v) =>
                    setForm((prev) => ({
                      ...prev,
                      customWidth: parseInt(v) || undefined,
                    }))
                  }
                  keyboardType="numeric"
                  style={{ flex: 1 }}
                />
                <FormField
                  label="Hauteur (mm)"
                  value={form.customHeight?.toString() ?? ""}
                  onChangeText={(v) =>
                    setForm((prev) => ({
                      ...prev,
                      customHeight: parseInt(v) || undefined,
                    }))
                  }
                  keyboardType="numeric"
                  style={{ flex: 1 }}
                />
              </View>
            )}

            <FormImagePicker
              label="Recto"
              imageUri={form.imageUri}
              onPick={() => pickImage("imageUri")}
              onRemove={() => set("imageUri")("")}
              onImageResized={(uri) => set("imageUri")(uri)}
              aspectRatio={currentRatio}
            />
            <FormImagePicker
              label="Verso (optionnel)"
              imageUri={form.backImageUri}
              onPick={() => pickImage("backImageUri")}
              onRemove={() => set("backImageUri")("")}
              onImageResized={(uri) => set("backImageUri")(uri)}
              aspectRatio={currentRatio}
            />

            {form.groupId && (
              <TouchableOpacity
                style={styles.backPickerBtn}
                onPress={() => setShowBackPicker(true)}
                activeOpacity={0.75}
              >
                <History size={15} color={Colors.accent} strokeWidth={1.6} />
                <Text style={styles.backPickerText}>
                  Choisir un verso existant
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Détails ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("fields.type")}</Text>

            <FormSelect
              label={t("fields.type")}
              options={PHOTOCARD_TYPE_OPTIONS}
              value={form.type}
              onChange={set("type")}
              required
              error={errors.type}
            />
            <FormField
              label={t("fields.version")}
              value={form.version}
              onChangeText={set("version")}
              placeholder="ex: A ver., Digipack..."
            />
            <FormSelect
              label={t("fields.shop")}
              options={sortedOptions}
              value={form.shopName}
              onChange={set("shopName")}
              loading={shopsLoading}
              searchable
            />
            <FormSelect
              label={t("fields.rarity")}
              options={RARITY_OPTIONS}
              value={form.rarity}
              onChange={set("rarity")}
            />
          </View>
          {/* ── Soumettre ── */}
          <FormSubmitButton
            label={t("common.add")}
            onPress={handleSubmit}
            loading={loading}
          />
          <ProgressIndicator message={progress} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Modal verso existant ── */}
      <BackImagePickerModal
        visible={showBackPicker}
        onClose={() => setShowBackPicker(false)}
        onSelect={(url) => setForm((prev) => ({ ...prev, backImageUri: url }))}
        groupId={form.groupId}
        albumId={form.albumId}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  navTitle: {
    flex: 1,
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
    textAlign: "center",
    marginHorizontal: Theme.spacing.sm,
  },
  scroll: { flex: 1 },
  content: {
    padding: Theme.spacing.lg,
    gap: Theme.spacing.xl,
  },
  section: {
    gap: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    paddingBottom: Theme.spacing.sm,
  },
  aiBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: Theme.spacing.sm + 2,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Colors.pillActive,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
  },
  aiBtnText: {
    fontSize: Theme.fontSize.base,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
  customSizeRow: {
    flexDirection: "row",
    gap: Theme.spacing.md,
    alignItems: "flex-start",
  },
  backPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: Theme.spacing.sm + 2,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Colors.pillActive,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
  },
  backPickerText: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
});
