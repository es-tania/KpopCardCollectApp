// src/components/ui/MemberMultiSelect.tsx
import { Check, Users } from "lucide-react-native";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { Member } from "../../types";

interface MemberMultiSelectProps {
  label: string;
  members: Member[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  required?: boolean;
  error?: string;
}

export const MemberMultiSelect: React.FC<MemberMultiSelectProps> = ({
  label,
  members,
  selectedIds,
  onChange,
  required,
  error,
}) => {
  const [open, setOpen] = useState(false);

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectedNames = members
    .filter((m) => selectedIds.includes(m.id))
    .map((m) => m.stageName)
    .join(", ");

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <TouchableOpacity
        style={[styles.trigger, error ? styles.triggerError : null]}
        onPress={() => setOpen(true)}
        activeOpacity={0.75}
      >
        <View style={styles.triggerLeft}>
          <Users size={15} color={Colors.textMuted} strokeWidth={1.6} />
          <Text
            style={[styles.triggerText, !selectedNames && styles.placeholder]}
            numberOfLines={1}
          >
            {selectedNames || "Sélectionner les membres..."}
          </Text>
        </View>
        {selectedIds.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{selectedIds.length}</Text>
          </View>
        )}
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}

      <Modal visible={open} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContent} edges={["bottom"]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Text style={styles.modalClose}>Fermer</Text>
              </TouchableOpacity>
            </View>

            {/* Info type de carte */}
            <View style={styles.infoBar}>
              <Text style={styles.infoText}>
                {selectedIds.length === 0 && "Solo — sélectionne 1 membre"}
                {selectedIds.length === 1 && "Solo ✅"}
                {selectedIds.length === 2 && "Duo ✅"}
                {selectedIds.length === 3 && "Trio ✅"}
                {selectedIds.length >= 4 && `Groupe (${selectedIds.length}) ✅`}
              </Text>
            </View>

            <ScrollView>
              {members.map((member) => {
                const isSelected = selectedIds.includes(member.id);
                return (
                  <TouchableOpacity
                    key={member.id}
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => toggle(member.id)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {member.stageName}
                    </Text>
                    {isSelected && (
                      <Check
                        size={16}
                        color={Colors.accent}
                        strokeWidth={2.5}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: {
    fontSize: Theme.fontSize.base,
    color: Colors.text,
    fontWeight: Theme.fontWeight.medium,
  },
  required: { color: Colors.danger },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface2,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm + 2,
    minHeight: 44,
  },
  triggerError: { borderColor: Colors.danger },
  triggerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  triggerText: { fontSize: Theme.fontSize.base, color: Colors.text, flex: 1 },
  placeholder: { color: Colors.textMuted },
  badge: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.bg,
    fontWeight: Theme.fontWeight.bold,
  },
  error: { fontSize: Theme.fontSize.sm + 1, color: Colors.danger },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Theme.spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  modalClose: { fontSize: Theme.fontSize.base, color: Colors.accent },
  infoBar: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Colors.surface2,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  infoText: { fontSize: Theme.fontSize.sm + 1, color: Colors.accent },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  optionSelected: { backgroundColor: Colors.pillActive },
  optionText: { fontSize: Theme.fontSize.base, color: Colors.text },
  optionTextSelected: {
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
});
