import { ChevronDown } from "lucide-react-native";
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

export interface SelectOption {
  key: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  options,
  value,
  placeholder = "Sélectionner...",
  onChange,
  required,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.key === value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <TouchableOpacity
        style={[styles.trigger, error ? styles.triggerError : {}]}
        onPress={() => setOpen(true)}
        activeOpacity={0.75}
      >
        <Text style={[styles.triggerText, !selected && styles.placeholder]}>
          {selected ? selected.label : placeholder}
        </Text>
        <ChevronDown size={16} color={Colors.textMuted} strokeWidth={1.6} />
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
            <ScrollView>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.option,
                    opt.key === value && styles.optionSelected,
                  ]}
                  onPress={() => {
                    onChange(opt.key);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      opt.key === value && styles.optionTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {opt.key === value && (
                    <Text style={styles.optionCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
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
  },
  triggerError: { borderColor: Colors.danger },
  triggerText: {
    fontSize: Theme.fontSize.base,
    color: Colors.text,
  },
  placeholder: { color: Colors.textMuted },
  error: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.danger,
  },
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
  modalClose: {
    fontSize: Theme.fontSize.base,
    color: Colors.accent,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  optionSelected: {
    backgroundColor: Colors.pillActive,
  },
  optionText: {
    fontSize: Theme.fontSize.base,
    color: Colors.text,
  },
  optionTextSelected: {
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
  optionCheck: {
    color: Colors.accent,
    fontSize: Theme.fontSize.base,
  },
});
