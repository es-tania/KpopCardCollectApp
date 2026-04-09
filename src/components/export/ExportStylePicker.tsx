import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

export type ExportStyle = "dark" | "light" | "minimal" | "kpop";

interface StyleOption {
  key: ExportStyle;
  label: string;
  sublabel: string;
  bg: string;
  accent: string;
}

const STYLES: StyleOption[] = [
  {
    key: "dark",
    label: "Dark",
    sublabel: "Fond sombre",
    bg: "#090C12",
    accent: "#7DD3F0",
  },
  {
    key: "light",
    label: "Light",
    sublabel: "Fond clair",
    bg: "#F5F5F5",
    accent: "#5A9FC8",
  },
  {
    key: "minimal",
    label: "Minimal",
    sublabel: "Sans couleur",
    bg: "#FFFFFF",
    accent: "#999999",
  },
  {
    key: "kpop",
    label: "K-pop",
    sublabel: "Pastel rose",
    bg: "#1A0A12",
    accent: "#F0A0C0",
  },
];

interface ExportStylePickerProps {
  value: ExportStyle;
  onChange: (style: ExportStyle) => void;
}

export const ExportStylePicker: React.FC<ExportStylePickerProps> = ({
  value,
  onChange,
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>STYLE</Text>
    <View style={styles.options}>
      {STYLES.map((s) => {
        const isActive = s.key === value;
        return (
          <TouchableOpacity
            key={s.key}
            style={[styles.option, isActive && styles.optionActive]}
            onPress={() => onChange(s.key)}
            activeOpacity={0.75}
          >
            {/* Aperçu couleur */}
            <View style={[styles.colorPreview, { backgroundColor: s.bg }]}>
              <View style={[styles.colorDot, { backgroundColor: s.accent }]} />
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {s.label}
            </Text>
            <Text style={styles.sublabel}>{s.sublabel}</Text>
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
    borderColor: Colors.borderActive,
    borderWidth: 1.5,
    backgroundColor: Colors.pillActive,
  },
  colorPreview: {
    width: 36,
    height: 24,
    borderRadius: Theme.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.text,
    fontWeight: Theme.fontWeight.medium,
  },
  labelActive: { color: Colors.accent },
  sublabel: {
    fontSize: Theme.fontSize.xs,
    color: Colors.textMuted,
    textAlign: "center",
  },
});
