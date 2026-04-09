import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

export type ExportLayout = "grid_3" | "grid_4" | "grid_5" | "list";

interface LayoutOption {
  key: ExportLayout;
  label: string;
  preview: string;
}

const LAYOUTS: LayoutOption[] = [
  { key: "grid_3", label: "3 col.", preview: "▣▣▣" },
  { key: "grid_4", label: "4 col.", preview: "▣▣▣▣" },
  { key: "grid_5", label: "5 col.", preview: "▣▣▣▣▣" },
  { key: "list", label: "Liste", preview: "▬▬▬" },
];

interface ExportLayoutPickerProps {
  value: ExportLayout;
  onChange: (layout: ExportLayout) => void;
}

export const ExportLayoutPicker: React.FC<ExportLayoutPickerProps> = ({
  value,
  onChange,
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>DISPOSITION</Text>
    <View style={styles.options}>
      {LAYOUTS.map((layout) => {
        const isActive = layout.key === value;
        return (
          <TouchableOpacity
            key={layout.key}
            style={[styles.option, isActive && styles.optionActive]}
            onPress={() => onChange(layout.key)}
            activeOpacity={0.75}
          >
            <Text style={[styles.preview, isActive && styles.previewActive]}>
              {layout.preview}
            </Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {layout.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { gap: Theme.spacing.sm },
  title: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
    fontWeight: Theme.fontWeight.medium,
    letterSpacing: 0.6,
  },
  options: {
    flexDirection: "row",
    gap: 8,
  },
  option: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: Theme.spacing.sm + 2,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
  },
  optionActive: {
    backgroundColor: Colors.pillActive,
    borderColor: Colors.borderActive,
  },
  preview: {
    fontSize: 12,
    color: Colors.textMuted,
    letterSpacing: 2,
  },
  previewActive: { color: Colors.accent },
  label: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
  },
  labelActive: {
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
});
