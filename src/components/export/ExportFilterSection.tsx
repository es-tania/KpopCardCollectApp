import { SelectOption } from "@/src/types";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface ExportFilterSectionProps {
  title: string;
  chips: SelectOption[];
  selected: string[];
  multiSelect?: boolean;
  onSelect: (key: string) => void;
}

export const ExportFilterSection: React.FC<ExportFilterSectionProps> = ({
  title,
  chips,
  selected,
  multiSelect = false,
  onSelect,
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chips}
    >
      {chips.map((chip) => {
        const isActive = selected.includes(chip.key);
        return (
          <TouchableOpacity
            key={chip.key}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onSelect(chip.key)}
            activeOpacity={0.75}
          >
            {isActive && <Text style={styles.checkmark}>✓ </Text>}
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: { gap: Theme.spacing.sm },
  title: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
    fontWeight: Theme.fontWeight.medium,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  chips: { gap: 8, paddingVertical: 2 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
  },
  chipActive: {
    backgroundColor: Colors.pillActive,
    borderColor: Colors.borderActive,
  },
  checkmark: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.accent,
  },
  chipText: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  chipTextActive: {
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
});
