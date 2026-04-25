import { Badge } from "@/src/components/ui/Badge";
import { FormField } from "@/src/components/ui/FormField";
import { FormImagePicker } from "@/src/components/ui/FormImagePicker";
import { FormSelect } from "@/src/components/ui/FormSelect";
import { FormSubmitButton } from "@/src/components/ui/FormSubmitButton";
import { Colors } from "@/src/constants/colors";
import { GENERATION_OPTIONS, STATUS_OPTIONS } from "@/src/constants/options";
import { Theme } from "@/src/constants/theme";
import { useGroupMembers } from "@/src/hooks/group/useGroupMembers";
import {
  Group,
  GroupEditFormState,
  GroupFormState,
  MemberFormErrors,
  MemberFormState,
} from "@/src/types";
import { pickLocalImage } from "@/src/utils/pickLocalImage";
import { Plus, UserPlus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MemberFormCard, newMemberForm } from "../../member/MemberFormCard";
import { FormDatePicker } from "../../ui/FormDatePicker";
import { ProgressIndicator } from "../../ui/ProgressIndicator";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GroupEditFormProps {
  group: Group;
  onSave: (form: GroupFormState, members: MemberFormState[]) => void;
  onCancel: () => void;
  loading: boolean;
  progress: string | null;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export const GroupEditForm: React.FC<GroupEditFormProps> = ({
  group,
  onSave,
  onCancel,
  loading,
  progress,
}) => {
  const { members: fetchedMembers, loading: membersLoading } = useGroupMembers(
    group.id,
  );
  const [form, setForm] = useState<GroupEditFormState>({
    name: group.name,
    koreanName: group.koreanName ?? "",
    company: group.company ?? "",
    generation: group.generation ?? "",
    fandomName: group.fandomName ?? "",
    status: group.status ?? "active",
    debutDate: group.debutDate ?? "",
    disbandDate: group.disbandDate ?? "",
    logoUri: "",
    bannerUri: "",
    removeLogo: false,
    removeBanner: false,
  });

  // ── État membres ─────────────────────────────────────────────────────────

  const [members, setMembers] = useState<MemberFormState[]>([]);
  const [memberErrors, setMemberErrors] = useState<
    Record<string, MemberFormErrors>
  >({});

  useEffect(() => {
    if (fetchedMembers.length > 0) {
      setMembers(
        fetchedMembers.map((m) => ({
          localId: m.id,
          id: m.id,
          stageName: m.stageName,
          realName: m.realName ?? "",
          koreanName: m.koreanName ?? "",
          birthDate: m.birthDate ?? "",
          position: m.position ?? [],
          photoUri: "",
          existingPhotoUrl: (m.photoUrl as any)?.uri ?? undefined,
          removePhoto: false, // ← initialise à false
          isNew: false,
        })),
      );
    }
  }, [fetchedMembers]);

  const set = (key: keyof GroupEditFormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleAddMember = () =>
    setMembers((prev) => [...prev, newMemberForm()]);

  const handleRemoveMember = (localId: string) => {
    const member = members.find((m) => m.localId === localId);
    if (!member) return;

    if (members.length === 1) {
      Alert.alert("Impossible", "Le groupe doit avoir au moins un membre.");
      return;
    }

    Alert.alert(
      "Confirmer",
      member.isNew
        ? "Retirer ce nouveau membre ?"
        : `Supprimer définitivement ${member.stageName} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: member.isNew ? "Retirer" : "Supprimer",
          style: "destructive",
          onPress: () =>
            setMembers((prev) => prev.filter((m) => m.localId !== localId)),
        },
      ],
    );
  };

  const handleChangeMember = (
    localId: string,
    key: keyof MemberFormState,
    value: string | boolean | string[],
  ) => {
    setMembers((prev) =>
      prev.map((m) => (m.localId === localId ? { ...m, [key]: value } : m)),
    );
    if (memberErrors[localId]) {
      setMemberErrors((prev) => {
        const next = { ...prev };
        delete next[localId];
        return next;
      });
    }
  };

  const validateMembers = (): boolean => {
    const me: Record<string, { stageName?: string }> = {};
    members.forEach((m) => {
      if (!m.stageName.trim()) {
        me[m.localId] = { stageName: "Nom de scène requis" };
      }
    });
    setMemberErrors(me);
    return Object.keys(me).length === 0;
  };

  if (membersLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={true}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Aperçu groupe ── */}
        <View style={styles.previewCard}>
          {/* Bannière */}
          {group.bannerUrl && (
            <View style={styles.previewBanner}>
              <Image
                source={group.bannerUrl as any}
                style={styles.previewBannerImg}
                resizeMode="cover"
              />
              <View style={styles.previewBannerOverlay} />
            </View>
          )}

          {/* Logo + infos */}
          <View
            style={[
              styles.previewContent,
              !!group.bannerUrl && styles.previewContentOverBanner,
            ]}
          >
            <View style={styles.previewLogo}>
              {group.logoUrl || group.logoUrl ? (
                <Image
                  source={(group.logoUrl ?? group.logoUrl) as any}
                  style={styles.previewLogoImg}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.previewLogoInitials}>
                  {group.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </Text>
              )}
            </View>
            <View style={styles.previewInfo}>
              <View style={styles.previewNameRow}>
                <Text style={styles.previewName}>{group.name}</Text>
              </View>
              {group.koreanName && (
                <Text style={styles.previewKorean}>{group.koreanName}</Text>
              )}
              {group.fandomName && (
                <Text style={styles.previewFandom}>✦ {group.fandomName}</Text>
              )}
              <View style={styles.previewBadges}>
                {group.generation && <Badge label={group.generation} />}
                {group.company && (
                  <Badge
                    label={group.company}
                    color="rgba(90,106,128,0.3)"
                    textColor={Colors.textMuted}
                  />
                )}
                {group.status === "hiatus" && (
                  <Badge
                    label="Hiatus"
                    color="rgba(250,199,117,0.15)"
                    textColor={Colors.warning}
                  />
                )}
                {group.status === "disbanded" && (
                  <Badge
                    label="Disbandé"
                    color="rgba(240,112,112,0.15)"
                    textColor={Colors.danger}
                  />
                )}
              </View>
            </View>
          </View>

          {/* Stats rapides */}
          <View style={styles.previewStats}>
            <View style={styles.previewStat}>
              <Text style={styles.previewStatNum}>{group.totalPhotocards}</Text>
              <Text style={styles.previewStatLabel}>Photocards</Text>
            </View>
            <View style={styles.previewStatDivider} />
            <View style={styles.previewStat}>
              <Text style={styles.previewStatNum}>
                {group.totalAlbums ?? "—"}
              </Text>
              <Text style={styles.previewStatLabel}>Albums</Text>
            </View>
            {group.debutDate && (
              <>
                <View style={styles.previewStatDivider} />
                <View style={styles.previewStat}>
                  <Text style={styles.previewStatNum}>
                    {new Date(group.debutDate).getFullYear()}
                  </Text>
                  <Text style={styles.previewStatLabel}>Début</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* ── Médias ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Médias</Text>
          <FormImagePicker
            label="Nouveau logo"
            imageUri={form.logoUri}
            onPick={() =>
              pickLocalImage(
                (uri) => {
                  set("logoUri")(uri);
                  setForm((prev) => ({ ...prev, removeLogo: false })); // annule la suppression si on repick
                },
                { aspect: [1, 1] },
              )
            }
            onRemove={() =>
              setForm((prev) => ({
                ...prev,
                logoUri: "",
                removeLogo: true,
              }))
            }
            aspectRatio={1}
          />

          <FormImagePicker
            label="Nouvelle bannière"
            imageUri={form.bannerUri}
            onPick={() =>
              pickLocalImage(
                (uri) => {
                  set("bannerUri")(uri);
                  setForm((prev) => ({ ...prev, removeBanner: false }));
                },
                { aspect: [8, 4] },
              )
            }
            onRemove={() =>
              setForm((prev) => ({
                ...prev,
                bannerUri: "",
                removeBanner: true,
              }))
            }
            aspectRatio={800 / 300}
          />
        </View>

        {/* ── Identité ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identité</Text>
          <FormField
            label="Nom du groupe"
            value={form.name}
            onChangeText={set("name")}
            placeholder="ex: P1Harmony"
            required
            autoCapitalize="words"
          />
          <FormField
            label="Nom coréen"
            value={form.koreanName}
            onChangeText={set("koreanName")}
            placeholder="ex: 피원하모니"
          />
          <FormField
            label="Agence"
            value={form.company}
            onChangeText={set("company")}
            placeholder="ex: FNC Ent."
            required
          />
          <FormField
            label="Fandom"
            value={form.fandomName}
            onChangeText={set("fandomName")}
            placeholder="ex: P1ECE"
          />
        </View>

        {/* ── Informations ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <FormSelect
            label="Génération"
            options={GENERATION_OPTIONS}
            value={form.generation}
            onChange={set("generation")}
          />
          <FormSelect
            label="Statut"
            options={STATUS_OPTIONS}
            value={form.status}
            onChange={set("status")}
          />
          <FormDatePicker
            label="Date de début"
            value={form.debutDate}
            onChange={set("debutDate")}
            minDate={form.debutDate ? new Date(form.debutDate) : undefined}
            maxDate={new Date()}
          />
          {/* Disband uniquement si disbanded */}
          {form.status === "disbanded" && (
            <FormField
              label="Date de disband"
              value={form.disbandDate}
              onChangeText={set("disbandDate")}
              placeholder="YYYY-MM-DD"
            />
          )}
        </View>

        {/* ── Membres ── */}
        <View style={styles.section}>
          <View style={memberSectionStyles.header}>
            <Text style={styles.sectionTitle}>Membres ({members.length})</Text>
            <TouchableOpacity
              style={memberSectionStyles.addBtn}
              onPress={handleAddMember}
              activeOpacity={0.75}
            >
              <UserPlus size={15} color={Colors.accent} strokeWidth={1.8} />
              <Text style={memberSectionStyles.addBtnText}>Ajouter</Text>
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
              defaultExpanded={false}
              showAvatar={true}
            />
          ))}

          {/* Bouton ajouter en bas */}
          <TouchableOpacity
            style={memberSectionStyles.addRowBtn}
            onPress={handleAddMember}
            activeOpacity={0.75}
          >
            <Plus size={16} color={Colors.accent} strokeWidth={2} />
            <Text style={memberSectionStyles.addRowText}>
              Ajouter un membre
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Progression ── */}
        <ProgressIndicator message={progress} />

        {/* ── Actions ── */}
        <View style={styles.btnGroup}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
          <View style={styles.saveBtn}>
            <FormSubmitButton
              label="Enregistrer"
              onPress={() => {
                if (!validateMembers()) {
                  Alert.alert(
                    "Formulaire incomplet",
                    "Vérifie les noms de scène.",
                  );
                  return;
                }
                onSave(form, members);
              }}
              loading={loading}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  content: {
    padding: Theme.spacing.lg,
    gap: Theme.spacing.xl,
  },

  // Aperçu
  previewCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
    overflow: "hidden",
  },
  previewBanner: {
    height: 80,
    position: "relative",
  },
  previewBannerImg: {
    width: "100%",
    height: "100%",
  },
  previewBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(9,12,18,0.4)",
  },
  previewContent: {
    flexDirection: "row",
    gap: Theme.spacing.md,
    padding: Theme.spacing.md,
    alignItems: "flex-end",
  },
  previewContentOverBanner: {
    marginTop: -40,
  },
  previewLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface2,
    borderWidth: 2,
    borderColor: Colors.accent,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  previewLogoImg: { width: "100%", height: "100%" },
  previewLogoInitials: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.accent,
  },
  previewInfo: { flex: 1, gap: 3 },
  previewNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  previewName: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  previewKorean: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
  },
  previewFandom: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.accent,
  },
  previewBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 2,
  },

  // Stats
  previewStats: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  previewStat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  previewStatNum: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.accent,
  },
  previewStatLabel: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
  },
  previewStatDivider: {
    width: 0.5,
    height: 28,
    backgroundColor: Colors.border,
  },

  // Sections
  section: { gap: Theme.spacing.md },
  sectionTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    paddingBottom: Theme.spacing.sm,
  },

  // Boutons
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

const memberSectionStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    paddingBottom: Theme.spacing.sm,
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
