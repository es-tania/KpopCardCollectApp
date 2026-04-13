import { ProgressIndicator } from "@/src/components/ui/ProgressIndicator";
import {
  PHOTOCARD_TYPE_OPTIONS,
  RARITY_OPTIONS,
  SHOP_OPTIONS,
} from "@/src/constants/options";
import { useAlbums } from "@/src/hooks/album/useAlbums";
import { useGroupMembers } from "@/src/hooks/group/useGroupMembers";
import { useGroups } from "@/src/hooks/group/useGroups";
import { useAddPhotocard } from "@/src/hooks/photocard/useAddPhotocard";
import { useAuthStore } from "@/src/store/authStore";
import { PhotocardFormState, SelectOption } from "@/src/types";
import { pickLocalImage } from "@/src/utils/pickLocalImage";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Sparkles } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
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
  memberId: "",
  memberName: "",
  type: "",
  version: "",
  shopName: "",
  eventName: "",
  rarity: "common",
  imageUri: "",
  backImageUri: "",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AddPhotocardScreen() {
  const { isAdmin } = useAuthStore();
  const { groupId: preGroupId, memberId: preMemberId } = useLocalSearchParams<{
    groupId?: string;
    memberId?: string;
  }>();
  const { groups } = useGroups();

  const [form, setForm] = useState<PhotocardFormState>({
    ...INITIAL_FORM,
    groupId: preGroupId ?? "",
    memberId: preMemberId ?? "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof PhotocardFormState, string>>
  >({});
  const [aiDetecting, setAiDetecting] = useState(false);

  const { loading, progress, error, submit } = useAddPhotocard(() => {
    Alert.alert(
      "✅ Succès",
      isAdmin
        ? `Photocard ajoutée et approuvée !`
        : `Photocard soumise ! Elle sera visible après validation par un admin.`,
      [{ text: "OK", onPress: () => router.back() }],
    );
  });
  useEffect(() => {
    if (error) Alert.alert("Erreur", error);
  }, [error]);

  const set = (key: keyof PhotocardFormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const { albums } = useAlbums(form.groupId || undefined);
  const { members } = useGroupMembers(form.groupId || null);

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

  // Simulation détection IA
  const handleAiDetect = async () => {
    if (!form.imageUri) {
      Alert.alert("Image requise", "Ajoute d'abord une image.");
      return;
    }
    setAiDetecting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setAiDetecting(false);
    Alert.alert("✨ IA", "Détection simulée — à implémenter.");
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof PhotocardFormState, string>> = {};
    if (!form.groupId) e.groupId = "Groupe requis";
    if (!form.albumId) e.albumId = "Album requis";
    if (!form.memberId) e.memberId = "Membre requis";
    if (!form.type) e.type = "Type requis";
    if (!form.imageUri) e.imageUri = "Image requise";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await submit(form, isAdmin);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Ajouter une photocard</Text>
        <View style={styles.navBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Image + IA ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Image</Text>
          <FormImagePicker
            label="Recto"
            imageUri={form.imageUri}
            onPick={() => pickLocalImage((uri) => set("imageUri")(uri))}
            onRemove={() => set("imageUri")("")}
            required
            error={errors.imageUri}
            aspectRatio={2 / 3}
          />
          <FormImagePicker
            label="Verso (optionnel)"
            imageUri={form.backImageUri}
            onPick={() => pickLocalImage((uri) => set("backImageUri")(uri))}
            onRemove={() => set("backImageUri")("")}
            aspectRatio={2 / 3}
          />

          {/* Bouton IA */}
          <TouchableOpacity
            style={styles.aiBtn}
            onPress={handleAiDetect}
            disabled={aiDetecting}
            activeOpacity={0.8}
          >
            <Sparkles size={16} color={Colors.accent} strokeWidth={1.8} />
            <Text style={styles.aiBtnText}>
              {aiDetecting ? "Détection en cours..." : "Détecter avec l'IA"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Identification ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identification</Text>
          <FormSelect
            label="Groupe"
            options={groupOptions}
            value={form.groupId}
            onChange={handleSelectGroup}
            required
            error={errors.groupId}
          />
          <FormSelect
            label="Album / Event"
            options={albumOptions}
            value={form.albumId}
            onChange={set("albumId")}
            required
            error={errors.albumId}
          />
          <FormSelect
            label="Membre"
            options={memberOptions}
            value={form.memberId}
            onChange={handleSelectMember}
            required
            error={errors.memberId}
          />
        </View>

        {/* ── Détails ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails</Text>
          <FormSelect
            label="Type"
            options={PHOTOCARD_TYPE_OPTIONS}
            value={form.type}
            onChange={set("type")}
            required
            error={errors.type}
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
          {/* Champ libre si "Autre" sélectionné */}
          {form.shopName === "other" && (
            <FormField
              label="Précise le shop"
              value={form.shopName}
              onChangeText={set("eventName")}
              placeholder="ex: Nom du shop..."
            />
          )}
          <FormSelect
            label="Rareté"
            options={RARITY_OPTIONS}
            value={form.rarity}
            onChange={set("rarity")}
          />
        </View>
        {/* ── Soumettre ── */}
        <FormSubmitButton
          label="Ajouter la photocard"
          onPress={handleSubmit}
          loading={loading}
        />
        <ProgressIndicator message={progress} />
      </ScrollView>
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
});
