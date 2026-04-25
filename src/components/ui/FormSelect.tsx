import { SelectOption } from "@/src/types";
import { ChevronDown, Search, X } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface FormSelectProps {
  label: string;
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  loading?: boolean;
  searchable?: boolean;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  options,
  value,
  placeholder = "Sélectionner...",
  onChange,
  required,
  error,
  loading = false,
  searchable = false,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((o) => o.key === value);

  const filteredOptions = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter(
      (o) => !o.disabled && o.label.toLowerCase().includes(q),
    );
  }, [options, query, searchable]);

  const handleOpen = () => {
    setQuery("");
    setOpen(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <TouchableOpacity
        style={[styles.trigger, error ? styles.triggerError : null]}
        onPress={handleOpen}
        activeOpacity={0.75}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.accent} />
        ) : (
          <Text style={[styles.triggerText, !selected && styles.placeholder]}>
            {selected ? selected.label : placeholder}
          </Text>
        )}
        <ChevronDown size={16} color={Colors.textMuted} strokeWidth={1.6} />
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}

      <Modal visible={open} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContent} edges={["bottom"]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Text style={styles.modalClose}>Fermer</Text>
              </TouchableOpacity>
            </View>

            {/* Barre de recherche */}
            {searchable && (
              <View style={styles.searchWrap}>
                <Search size={15} color={Colors.textMuted} strokeWidth={1.6} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Rechercher..."
                  placeholderTextColor={Colors.textMuted}
                  value={query}
                  onChangeText={setQuery}
                  autoFocus
                />
                {query.length > 0 && (
                  <TouchableOpacity onPress={() => setQuery("")}>
                    <X size={14} color={Colors.textMuted} strokeWidth={1.6} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Liste */}
            <ScrollView keyboardShouldPersistTaps="handled">
              {filteredOptions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Aucun résultat</Text>
                </View>
              ) : (
                filteredOptions.map((opt) => {
                  // ── Séparateur ────────────────────────────────────────────────────
                  if (opt.disabled) {
                    return (
                      <View key={opt.key} style={styles.separator}>
                        <Text style={styles.separatorText}>{opt.label}</Text>
                      </View>
                    );
                  }

                  // ── Option normale ────────────────────────────────────────────────
                  return (
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
                  );
                })
              )}
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
  triggerText: { fontSize: Theme.fontSize.base, color: Colors.text },
  placeholder: { color: Colors.textMuted },
  error: { fontSize: Theme.fontSize.sm + 1, color: Colors.danger },

  // ── Modal ─────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
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

  // ── Recherche ─────────────────────────────────────────────────────────
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Colors.surface2,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: Theme.fontSize.base,
    color: Colors.text,
    padding: 0,
  },

  // ── Options ───────────────────────────────────────────────────────────
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
  optionCheck: { color: Colors.accent, fontSize: Theme.fontSize.base },
  emptyState: { padding: Theme.spacing.xl, alignItems: "center" },
  emptyText: { fontSize: Theme.fontSize.base, color: Colors.textMuted },
  separator: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Colors.surface2,
  },
  separatorText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textMuted,
    fontWeight: Theme.fontWeight.medium,
  },
});
