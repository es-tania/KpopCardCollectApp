import { Colors } from "@/src/constants/colors";
import { Theme } from "@/src/constants/theme";
import { Trash2 } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FormField } from "../ui/FormField";
import { FormImagePicker } from "../ui/FormImagePicker";
import { FormSelect, SelectOption } from "../ui/FormSelect";

const POSITION_OPTIONS: SelectOption[] = [
  { key: "Leader", label: "Leader" },
  { key: "Main Vocal", label: "Main Vocal" },
  { key: "Lead Vocal", label: "Lead Vocal" },
  { key: "Sub Vocal", label: "Sub Vocal" },
  { key: "Main Dancer", label: "Main Dancer" },
  { key: "Lead Dancer", label: "Lead Dancer" },
  { key: "Rapper", label: "Rapper" },
  { key: "Visual", label: "Visual" },
  { key: "Maknae", label: "Maknae" },
];

interface MemberForm {
  localId: string; // id temporaire pour le rendu
  stageName: string;
  realName: string;
  koreanName: string;
  birthDate: string;
  position: string;
  photoUri: string;
}

interface MemberErrors {
  stageName?: string;
}

const newMember = (): MemberForm => ({
  localId: Math.random().toString(36).slice(2),
  stageName: "",
  realName: "",
  koreanName: "",
  birthDate: "",
  position: "",
  photoUri: "",
});

interface MemberFormCardProps {
  member: MemberForm;
  index: number;
  errors?: MemberErrors;
  onChange: (localId: string, key: keyof MemberForm, value: string) => void;
  onRemove: (localId: string) => void;
}

export const MemberFormCard: React.FC<MemberFormCardProps> = ({
  member,
  index,
  errors,
  onChange,
  onRemove,
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <View style={memberStyles.card}>
      {/* Header carte membre */}
      <TouchableOpacity
        style={memberStyles.header}
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.75}
      >
        <View style={memberStyles.headerLeft}>
          <View style={memberStyles.indexBadge}>
            <Text style={memberStyles.indexText}>{index + 1}</Text>
          </View>
          <Text style={memberStyles.headerTitle}>
            {member.stageName.trim() || `Membre ${index + 1}`}
          </Text>
          {member.position && (
            <Text style={memberStyles.headerPosition}>{member.position}</Text>
          )}
        </View>
        <View style={memberStyles.headerActions}>
          <Text style={memberStyles.expandIcon}>{expanded ? "▲" : "▼"}</Text>
          <TouchableOpacity
            style={memberStyles.removeBtn}
            onPress={() => onRemove(member.localId)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Trash2 size={15} color={Colors.danger} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Corps du formulaire */}
      {expanded && (
        <View style={memberStyles.body}>
          <View style={memberStyles.row}>
            {/* Photo */}
            <View style={memberStyles.photoCol}>
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
              />
            </View>

            {/* Champs principaux */}
            <View style={memberStyles.fieldsCol}>
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

          {/* Champs supplémentaires */}
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

const memberStyles = StyleSheet.create({
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
  headerTitle: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
    flex: 1,
  },
  headerPosition: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
    marginRight: Theme.spacing.sm,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
  },
  expandIcon: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  removeBtn: {
    padding: 2,
  },
  body: {
    padding: Theme.spacing.md,
    gap: Theme.spacing.md,
  },
  row: {
    gap: Theme.spacing.md,
  },
  photoCol: {
    width: "100%",
  },
  fieldsCol: {
    flex: 1,
    gap: Theme.spacing.sm,
  },
});
