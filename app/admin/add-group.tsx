import {
  MemberFormCard,
  newMemberForm,
} from "@/src/components/member/MemberFormCard";
import { useTranslation } from "@/src/hooks/useTranslation";
import { FormDatePicker } from "@/src/components/ui/FormDatePicker";
import { ProgressIndicator } from "@/src/components/ui/ProgressIndicator";
import { GENERATION_OPTIONS, STATUS_OPTIONS } from "@/src/constants/options";
import { useAddGroup } from "@/src/hooks/group/useAddGroup";
import {
  GroupFormErrors,
  GroupFormState,
  MemberFormErrors,
  MemberFormState,
} from "@/src/types";
import { pickLocalImage } from "@/src/utils/pickLocalImage";
import { router } from "expo-router";
import { ChevronLeft, Plus, UserPlus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
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

// ─── Valeurs initiales ────────────────────────────────────────────────────────

const INITIAL_GROUP: GroupFormState = {
  name: "",
  koreanName: "",
  company: "",
  debutDate: "",
  disbandDate: "",
  generation: "",
  fandomName: "",
  status: "active",
  logoUri: "",
  bannerUri: "",
  removeBanner: false,
  removeLogo: false,
};

// ─── Page principale ──────────────────────────────────────────────────────────

export default function AddGroupScreen() {
  const { t } = useTranslation();
  const [form, setForm] = useState<GroupFormState>(INITIAL_GROUP);
  const [errors, setErrors] = useState<
    Partial<Record<keyof GroupFormState, string>>
  >({});
  const [members, setMembers] = useState<MemberFormState[]>([newMemberForm()]);
  const [memberErrors, setMemberErrors] = useState<
    Record<string, MemberFormErrors>
  >({});
  const { loading, progress, error, submit } = useAddGroup(() => {
    Alert.alert(
      "✅ Succès",
      `Groupe "${form.name}" ajouté avec ${members.length} membre${members.length > 1 ? "s" : ""} !`,
      [{ text: "OK", onPress: () => router.back() }],
    );
  });

  const setField = (key: keyof GroupFormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ── Gestion membres ──────────────────────────────────────────────────────

  const handleAddMember = () => {
    setMembers((prev) => [...prev, newMemberForm()]);
  };

  const handleRemoveMember = (localId: string) => {
    if (members.length === 1) {
      Alert.alert("Impossible", "Le groupe doit avoir au moins un membre.");
      return;
    }
    Alert.alert("Supprimer", "Retirer ce membre du formulaire ?", [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: "Retirer",
        style: "destructive",
        onPress: () =>
          setMembers((prev) => prev.filter((m) => m.localId !== localId)),
      },
    ]);
  };

  const handleChangeMember = (
    localId: string,
    key: keyof MemberFormState,
    value: string | boolean | string[],
  ) => {
    setMembers((prev) =>
      prev.map((m) => (m.localId === localId ? { ...m, [key]: value } : m)),
    );
    // Efface l'erreur dès que l'utilisateur corrige
    if (memberErrors[localId]) {
      setMemberErrors((prev) => {
        const next = { ...prev };
        delete next[localId];
        return next;
      });
    }
  };

  // ── Validation ──────────────────────────────────────────────────────────

  const validate = (): boolean => {
    let valid = true;

    // Groupe
    const e: GroupFormErrors = {};
    if (!form.name.trim()) {
      e.name = "Nom requis";
      valid = false;
    }
    if (!form.company.trim()) {
      e.company = "Agence requise";
      valid = false;
    }
    setErrors(e);

    // Membres
    const me: Record<string, MemberFormErrors> = {};
    members.forEach((m) => {
      if (!m.stageName.trim()) {
        me[m.localId] = { stageName: "Nom de scène requis" };
        valid = false;
      }
    });
    setMemberErrors(me);

    return valid;
  };

  // ── Soumission ──────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert("Formulaire incomplet", "Vérifie les champs obligatoires.");
      return;
    }
    await submit(form, members);
  };

  useEffect(() => {
    if (error) Alert.alert("Erreur", error);
  }, [error]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Ajouter un groupe</Text>
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
          {/* ── Médias ── */}
          <View style={styles.section}>
            <FormField
              label={t("fields.name")}
              value={form.name}
              onChangeText={setField("name")}
              placeholder="ex: P1Harmony"
              required
              error={errors.name}
              autoCapitalize="words"
            />
            <FormImagePicker
              label="Logo"
              imageUri={form.logoUri}
              onPick={() =>
                pickLocalImage((uri) => setField("logoUri")(uri), {
                  aspect: [1, 1],
                })
              }
              onRemove={() => setField("logoUri")("")}
              aspectRatio={1}
            />
            <FormImagePicker
              label="Bannière"
              imageUri={form.bannerUri}
              onPick={() =>
                pickLocalImage((uri) => setField("bannerUri")(uri), {
                  aspect: [8, 5],
                })
              }
              onRemove={() => setField("bannerUri")("")}
              aspectRatio={800 / 300}
              previewWidth={300}
            />
          </View>

          {/* ── Identité ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Identité</Text>
            <FormField
              label="Nom coréen"
              value={form.koreanName}
              onChangeText={setField("koreanName")}
              placeholder="ex: 피원하모니"
            />
            <FormField
              label="Agence"
              value={form.company}
              onChangeText={setField("company")}
              placeholder="ex: FNC Ent."
              required
              error={errors.company}
            />
            <FormField
              label="Fandom"
              value={form.fandomName}
              onChangeText={setField("fandomName")}
              placeholder="ex: P1ECE"
            />
          </View>

          {/* ── Infos ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations</Text>
            <FormSelect
              label="Génération"
              options={GENERATION_OPTIONS}
              value={form.generation}
              onChange={setField("generation")}
            />
            <FormSelect
              label={t("fields.status")}
              options={STATUS_OPTIONS}
              value={form.status}
              onChange={setField("status")}
            />
            <FormDatePicker
              label="Date de début"
              value={form.debutDate}
              onChange={setField("debutDate")}
              maxDate={new Date()} // ne peut pas débuter dans le futur
            />
            {form.status === "disbanded" && (
              <FormDatePicker
                label="Date de disband"
                value={form.disbandDate}
                onChange={setField("disbandDate")}
                minDate={form.debutDate ? new Date(form.debutDate) : undefined}
                maxDate={new Date()}
              />
            )}
          </View>

          {/* ── Membres ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Membres ({members.length})
              </Text>
              <TouchableOpacity
                style={styles.addMemberBtn}
                onPress={handleAddMember}
                activeOpacity={0.75}
              >
                <UserPlus size={15} color={Colors.accent} strokeWidth={1.8} />
                <Text style={styles.addMemberText}>Ajouter</Text>
              </TouchableOpacity>
            </View>

            {members.map((member, index) => (
              <MemberFormCard
                key={member.localId}
                member={member}
                index={index}
                errors={memberErrors[member.localId]}
                onChange={handleChangeMember}
                onRemove={handleRemoveMember}
                defaultExpanded={true}
                showAvatar={false}
              />
            ))}

            {/* Bouton ajouter membre en bas de liste */}
            <TouchableOpacity
              style={styles.addMemberRowBtn}
              onPress={handleAddMember}
              activeOpacity={0.75}
            >
              <Plus size={16} color={Colors.accent} strokeWidth={2} />
              <Text style={styles.addMemberRowText}>Ajouter un membre</Text>
            </TouchableOpacity>
          </View>

          {/* ── Soumettre ── */}
          <FormSubmitButton
            label={`Créer le groupe avec ${members.length} membre${members.length > 1 ? "s" : ""}`}
            onPress={handleSubmit}
            loading={loading}
          />
          <ProgressIndicator message={progress} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
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
  addMemberBtn: {
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
  addMemberText: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
  addMemberRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.md,
    backgroundColor: "transparent",
  },
  addMemberRowText: {
    fontSize: Theme.fontSize.base,
    color: Colors.accent,
  },
});
