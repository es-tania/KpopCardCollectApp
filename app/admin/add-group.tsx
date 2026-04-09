import {
  MemberFormCard,
  newMemberForm,
} from "@/src/components/member/MemberFormCard";
import { GENERATION_OPTIONS, STATUS_OPTIONS } from "@/src/constants/options";
import {
  GroupFormErrors,
  GroupFormState,
  MemberFormErrors,
  MemberFormState,
} from "@/src/types";
import { router } from "expo-router";
import { ChevronLeft, Plus, UserPlus } from "lucide-react-native";
import React, { useState } from "react";
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

// ─── Valeurs initiales ────────────────────────────────────────────────────────

const INITIAL_GROUP: GroupFormState = {
  name: "",
  koreanName: "",
  company: "",
  debutDate: "",
  disbandDate: "",
  generation: "",
  fandomName: "",
  memberCount: "",
  status: "active",
  logoUri: "",
  bannerUri: "",
};

// ─── Page principale ──────────────────────────────────────────────────────────

export default function AddGroupScreen() {
  const [form, setForm] = useState<GroupFormState>(INITIAL_GROUP);
  const [errors, setErrors] = useState<GroupFormErrors>({});
  const [members, setMembers] = useState<MemberFormState[]>([newMemberForm()]);
  const [memberErrors, setMemberErrors] = useState<
    Record<string, MemberFormErrors>
  >({});
  const [loading, setLoading] = useState(false);

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
      { text: "Annuler", style: "cancel" },
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
    value: string,
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
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    Alert.alert(
      "✅ Succès",
      `Groupe "${form.name}" ajouté avec ${members.length} membre${members.length > 1 ? "s" : ""} !`,
      [{ text: "OK", onPress: () => router.back() }],
    );
  };

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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Médias ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Médias</Text>
          <FormImagePicker
            label="Logo"
            imageUri={form.logoUri}
            onPick={() => setField("logoUri")("https://picsum.photos/200/200")}
            onRemove={() => setField("logoUri")("")}
            aspectRatio={1}
          />
          <FormImagePicker
            label="Bannière"
            imageUri={form.bannerUri}
            onPick={() =>
              setField("bannerUri")("https://picsum.photos/800/300")
            }
            onRemove={() => setField("bannerUri")("")}
            aspectRatio={800 / 300}
          />
        </View>

        {/* ── Identité ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identité</Text>
          <FormField
            label="Nom du groupe"
            value={form.name}
            onChangeText={setField("name")}
            placeholder="ex: P1Harmony"
            required
            error={errors.name}
            autoCapitalize="words"
          />
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
            label="Statut"
            options={STATUS_OPTIONS}
            value={form.status}
            onChange={setField("status")}
          />
          <FormField
            label="Date de début"
            value={form.debutDate}
            onChangeText={setField("debutDate")}
            placeholder="YYYY-MM-DD"
          />
          <FormField
            label="Nombre de membres"
            value={form.memberCount}
            onChangeText={setField("memberCount")}
            placeholder="ex: 6"
            keyboardType="numeric"
          />
        </View>

        {/* ── Membres ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Membres ({members.length})</Text>
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
              defaultExpanded={true} // ← ouvert par défaut pour l'ajout
              showAvatar={false} // ← badge numéroté
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
      </ScrollView>
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
