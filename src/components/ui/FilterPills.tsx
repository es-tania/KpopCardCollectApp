import { SelectOption } from "@/src/types";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface FilterPillsProps {
  options: SelectOption[];
  selected: string;
  onSelect: (key: string) => void;
}

export const FilterPills: React.FC<FilterPillsProps> = ({
  options,
  selected,
  onSelect,
}) => (
  <View style={styles.filtersWrap}>
    {options.map((opt) => {
      const isActive = opt.key === selected;
      return (
        <TouchableOpacity
          key={opt.key}
          onPress={() => onSelect(opt.key)}
          style={[styles.pill, isActive && styles.pillActive]}
        >
          <Text style={[styles.label, isActive && styles.labelActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  content: {
    gap: 6,
    paddingBottom: 4,
  },
  filtersWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingBottom: Theme.spacing.md,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.pillActive,
    borderColor: Colors.borderActive,
  },
  label: {
    fontSize: Theme.fontSize.md,
    color: Colors.textMuted,
  },
  labelActive: {
    color: Colors.accent,
  },
});
