import { BulkPhotocardCard } from "@/src/components/admin/photocard/BulkPhotocardCard";
import { useTranslation } from "@/src/hooks/useTranslation";
import { FormField } from "@/src/components/ui/FormField";
import { FormSelect } from "@/src/components/ui/FormSelect";
import { FormSubmitButton } from "@/src/components/ui/FormSubmitButton";
import { ProgressIndicator } from "@/src/components/ui/ProgressIndicator";
import { Colors } from "@/src/constants/colors";
import {
  PHOTOCARD_TYPE_OPTIONS,
  RARITY_OPTIONS,
} from "@/src/constants/options";
import { Theme } from "@/src/constants/theme";
import { useAlbums } from "@/src/hooks/album/useAlbums";
import { useGroupMembers } from "@/src/hooks/group/useGroupMembers";
import { useShops } from "@/src/hooks/shops/useShops";
import { useAccessibleGroups } from "@/src/hooks/useAccessibleGroups";
import {
  BulkFormState,
  BulkPhotocard,
  useBulkAddPhotocards,
} from "@/src/hooks/useBulkAddPhotocards";
import { useAuthStore } from "@/src/store/authStore";
import { SelectOption } from "@/src/types";
import { router } from "expo-router";
import { ChevronLeft, Plus } from "lucide-react-native";
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const newCard = (): BulkPhotocard => ({
  localId: Math.random().toString(36).slice(2),
  memberId: "",
  memberName: "",
  imageUri: "",
  backImageUri: "",
});

const INITIAL_FORM: BulkFormState = {
  groupId: "",
  groupName: "",
  albumId: "",
  albumTitle: "",
  version: "",
  shopName: "",
  type: "normal",
  rarity: "common",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AddPhotocardsBulkScreen() {
  const { t } = useTranslation();
  const { isAdmin, groupAdminIds } = useAuthStore();
  const { groups } = useAccessibleGroups();
  const { shopOptions, loading: shopsLoading } = useShops();

  const [form, setForm] = useState<BulkFormState>(INITIAL_FORM);
  const [photocards, setPhotocards] = useState<BulkPhotocard[]>([newCard()]);
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  // Albums selon le groupe sélectionné
  const { albums } = useAlbums(form.groupId || undefined);

  // Membres selon le groupe sélectionné
  const { members } = useGroupMembers(form.groupId || null);

  const accessibleGroups = useMemo(() => {
    if (isAdmin) return groups;
    return groups.filter((g) => groupAdminIds.includes(g.id));
  }, [groups, isAdmin, groupAdminIds]);

  const groupOptions: SelectOption[] = useMemo(
    () => groups.map((g) => ({ key: g.id, label: g.name })),
    [groups],
  );

  const albumOptions: SelectOption[] = useMemo(
    () => albums.map((a) => ({ key: a.id, label: a.title })),
    [albums],
  );

  const memberOptions: SelectOption[] = useMemo(
    () => members.map((m) => ({ key: m.id, label: m.stageName })),
    [members],
  );

  // ── Handlers form ─────────────────────────────────────────────────────

  const setField = (key: keyof BulkFormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSelectGroup = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    setForm((prev) => ({
      ...prev,
      groupId,
      groupName: group?.name ?? "",
      albumId: "",
      albumTitle: "",
    }));
  };

  const handleSelectAlbum = (albumId: string) => {
    const album = albums.find((a) => a.id === albumId);
    setForm((prev) => ({
      ...prev,
      albumId,
      albumTitle: album?.title ?? "",
    }));
  };

  // ── Handlers photocards ───────────────────────────────────────────────

  const handleAddCard = useCallback(() => {
    setPhotocards((prev) => [...prev, newCard()]);
  }, []);

  const handleRemoveCard = useCallback(
    (localId: string) => {
      if (photocards.length === 1) {
        Alert.alert("Impossible", "Tu dois avoir au moins une photocard.");
        return;
      }
      setPhotocards((prev) => prev.filter((c) => c.localId !== localId));
    },
    [photocards.length],
  );

  const handleChangeCard = useCallback(
    (localId: string, key: keyof BulkPhotocard, value: string) => {
      setPhotocards((prev) =>
        prev.map((c) => (c.localId === localId ? { ...c, [key]: value } : c)),
      );
      // Efface l'erreur
      setCardErrors((prev) => {
        const next = { ...prev };
        delete next[localId];
        return next;
      });
    },
    [],
  );

  // ── Submit ────────────────────────────────────────────────────────────

  const { loading, progress, error, submit } = useBulkAddPhotocards((count) => {
    Alert.alert(
      "✅ Succès",
      `${count} photocard${count > 1 ? "s" : ""} ajoutée${count > 1 ? "s" : ""} !`,
      [{ text: "OK", onPress: () => router.back() }],
    );
  });

  useEffect(() => {
    if (error) Alert.alert("Erreur", error);
  }, [error]);

  const validate = (): boolean => {
    let valid = true;
    const errors: Record<string, string> = {};

    if (!form.groupId) {
      Alert.alert("Validation", "Sélectionne un groupe.");
      return false;
    }
    if (!form.albumId) {
      Alert.alert("Validation", "Sélectionne un album.");
      return false;
    }

    photocards.forEach((card) => {
      if (!card.memberId) {
        errors[card.localId] = "Membre requis";
        valid = false;
      }
      if (!card.imageUri) {
        errors[card.localId] = errors[card.localId]
          ? errors[card.localId] + " · Image requise"
          : "Image requise";
        valid = false;
      }
    });

    setCardErrors(errors);
    if (!valid) {
      Alert.alert("Formulaire incomplet", "Vérifie chaque photocard.");
    }
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const isGroupAdmin = groupAdminIds.includes(form.groupId);
    await submit(form, photocards, isAdmin || isGroupAdmin);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Ajout en lot</Text>
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
          {/* ── Infos communes ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Infos communes</Text>
            <Text style={styles.sectionSubtitle}>
              Ces informations s'appliquent à toutes les photocards
            </Text>

            <FormSelect
              label={t("fields.group")}
              options={groupOptions}
              value={form.groupId}
              onChange={handleSelectGroup}
              required
              searchable
            />
            <FormSelect
              label={t("fields.album")}
              options={albumOptions}
              value={form.albumId}
              onChange={handleSelectAlbum}
              required
              placeholder={
                form.groupId
                  ? "Sélectionner un album..."
                  : "Sélectionne d'abord un groupe"
              }
              searchable
            />
            <FormSelect
              label={t("fields.type")}
              options={PHOTOCARD_TYPE_OPTIONS}
              value={form.type}
              onChange={setField("type")}
            />
            <FormField
              label={t("fields.version")}
              value={form.version}
              onChangeText={setField("version")}
              placeholder="ex: A ver., Digipack..."
            />
            <FormSelect
              label={t("fields.shop")}
              options={shopOptions}
              value={form.shopName}
              onChange={setField("shopName")}
              placeholder="Sélectionner un shop..."
              loading={shopsLoading}
              searchable
            />
            <FormSelect
              label={t("fields.rarity")}
              options={RARITY_OPTIONS}
              value={form.rarity}
              onChange={setField("rarity")}
            />
          </View>

          {/* ── Photocards ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Photocards ({photocards.length})
                </Text>
                <Text style={styles.sectionSubtitle}>Une carte par membre</Text>
              </View>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={handleAddCard}
                activeOpacity={0.75}
              >
                <Plus size={15} color={Colors.accent} strokeWidth={2} />
                <Text style={styles.addBtnText}>Ajouter</Text>
              </TouchableOpacity>
            </View>

            {photocards.map((card, index) => (
              <BulkPhotocardCard
                key={card.localId}
                card={card}
                index={index}
                memberOptions={memberOptions}
                onChange={handleChangeCard}
                onRemove={handleRemoveCard}
                error={cardErrors[card.localId]}
              />
            ))}

            {/* Bouton ajouter en bas */}
            <TouchableOpacity
              style={styles.addRowBtn}
              onPress={handleAddCard}
              activeOpacity={0.75}
            >
              <Plus size={16} color={Colors.accent} strokeWidth={2} />
              <Text style={styles.addRowText}>Ajouter une photocard</Text>
            </TouchableOpacity>
          </View>

          {/* ── Progression ── */}
          <ProgressIndicator message={progress} />

          {/* ── Submit ── */}
          <FormSubmitButton
            label={`Ajouter ${photocards.length} photocard${photocards.length > 1 ? "s" : ""}`}
            onPress={handleSubmit}
            loading={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  section: { gap: Theme.spacing.md },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    paddingBottom: Theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.pillActive,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 5,
  },
  addBtnText: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
  addRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.md,
  },
  addRowText: {
    fontSize: Theme.fontSize.base,
    color: Colors.accent,
  },
});
