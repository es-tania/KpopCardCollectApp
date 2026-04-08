import { FormField } from "@/src/components/ui/FormField";
import { FormImagePicker } from "@/src/components/ui/FormImagePicker";
import { FormSelect } from "@/src/components/ui/FormSelect";
import { Colors } from "@/src/constants/colors";
import { POSITION_OPTIONS } from "@/src/constants/options";
import { Theme } from "@/src/constants/theme";
import { Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MemberFormState {
  localId: string;
  id?: string; // undefined = nouveau membre
  stageName: string;
  realName: string;
  koreanName: string;
  birthDate: string;
  position: string;
  photoUri: string;
  isNew?: boolean;
}

export interface MemberFormErrors {
  stageName?: string;
}

interface MemberFormCardProps {
  member: MemberFormState;
  index: number;
  errors?: MemberFormErrors;
  onChange: (
    localId: string,
    key: keyof MemberFormState,
    value: string,
  ) => void;
  onRemove: (localId: string) => void;
  // ── Variantes visuelles ──
  defaultExpanded?: boolean; // true pour add-group, false pour edit
  showAvatar?: boolean; // true pour edit (avatar miniature), false pour add (badge numéroté)
}

// ─── Composant ────────────────────────────────────────────────────────────────

export const MemberFormCard: React.FC<MemberFormCardProps> = ({
  member,
  index,
  errors,
  onChange,
  onRemove,
  defaultExpanded = true,
  showAvatar = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={styles.card}>
      {/* ── Header ── */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.75}
      >
        <View style={styles.headerLeft}>
          {showAvatar ? (
            // Mode edit : avatar miniature
            <View style={styles.miniAvatar}>
              {member.photoUri ? (
                <Image
                  source={{ uri: member.photoUri }}
                  style={styles.miniAvatarImg}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.miniAvatarInitial}>
                  {member.stageName?.[0]?.toUpperCase() ??
                    (index + 1).toString()}
                </Text>
              )}
            </View>
          ) : (
            // Mode add : badge numéroté
            <View style={styles.indexBadge}>
              <Text style={styles.indexText}>{index + 1}</Text>
            </View>
          )}

          <View style={styles.headerInfo}>
            <View style={styles.headerNameRow}>
              <Text style={styles.headerStageName}>
                {member.stageName.trim() || `Membre ${index + 1}`}
              </Text>
              {member.isNew && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>Nouveau</Text>
                </View>
              )}
            </View>
            {member.position && (
              <Text style={styles.headerPosition}>{member.position}</Text>
            )}
          </View>
        </View>

        <View style={styles.headerActions}>
          <Text style={styles.expandIcon}>{expanded ? "▲" : "▼"}</Text>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => onRemove(member.localId)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Trash2 size={15} color={Colors.danger} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* ── Corps ── */}
      {expanded && (
        <View style={styles.body}>
          <View style={styles.bodyRow}>
            <View style={styles.photoCol}>
              <FormImagePicker
                label="Photo"
                imageUri={member.photoUri}
                onPick={() =>
                  onChange(
                    member.localId,
                    "photoUri",
                    "https://picsum.photos/200/300",
                  )
                }
                onRemove={() => onChange(member.localId, "photoUri", "")}
                aspectRatio={2 / 3}
                previewWidth={100}
              />
            </View>

            <View style={styles.fieldsCol}>
              <FormField
                label="Nom de scène"
                value={member.stageName}
                onChangeText={(v) => onChange(member.localId, "stageName", v)}
                placeholder="ex: Keeho"
                required
                error={errors?.stageName}
                autoCapitalize="words"
              />
              <FormField
                label="Nom réel"
                value={member.realName}
                onChangeText={(v) => onChange(member.localId, "realName", v)}
                placeholder="ex: Kim Sanggyun"
                autoCapitalize="words"
              />
              <FormField
                label="Nom coréen"
                value={member.koreanName}
                onChangeText={(v) => onChange(member.localId, "koreanName", v)}
                placeholder="ex: 김상균"
              />
            </View>
          </View>

          <FormSelect
            label="Position principale"
            options={POSITION_OPTIONS}
            value={member.position}
            onChange={(v) => onChange(member.localId, "position", v)}
            placeholder="Sélectionner une position..."
          />
          <FormField
            label="Date de naissance"
            value={member.birthDate}
            onChangeText={(v) => onChange(member.localId, "birthDate", v)}
            placeholder="YYYY-MM-DD"
            keyboardType="numeric"
          />
        </View>
      )}
    </View>
  );
};

// ─── Factory ──────────────────────────────────────────────────────────────────

export const newMemberForm = (): MemberFormState => ({
  localId: Math.random().toString(36).slice(2),
  stageName: "",
  realName: "",
  koreanName: "",
  birthDate: "",
  position: "",
  photoUri: "",
  isNew: true,
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.sm,
    flex: 1,
  },

  // Badge numéroté (mode add)
  indexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.pillActive,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
    alignItems: "center",
    justifyContent: "center",
  },
  indexText: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.semibold,
  },

  // Avatar miniature (mode edit)
  miniAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  miniAvatarImg: { width: "100%", height: "100%" },
  miniAvatarInitial: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.accent,
  },

  headerInfo: { flex: 1, gap: 2 },
  headerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerStageName: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
  },
  newBadge: {
    backgroundColor: "rgba(74,222,170,0.12)",
    borderRadius: Theme.borderRadius.full,
    borderWidth: 0.5,
    borderColor: "rgba(74,222,170,0.3)",
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  newBadgeText: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.accent,
  },
  headerPosition: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
  },
  expandIcon: { fontSize: 10, color: Colors.textMuted },
  removeBtn: { padding: 2 },
  body: {
    padding: Theme.spacing.md,
    gap: Theme.spacing.md,
  },
  bodyRow: {
    gap: Theme.spacing.md,
  },
  photoCol: { width: "100%" },
  fieldsCol: { flex: 1, gap: Theme.spacing.sm },
});
