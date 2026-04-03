import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

export type FilterOption = {
  key: string;
  label: string;
};

interface FilterPillsProps {
  options: FilterOption[];
  selected: string;
  onSelect: (key: string) => void;
}

export const FilterPills: React.FC<FilterPillsProps> = ({
  options,
  selected,
  onSelect,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.content}
  >
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
  </ScrollView>
);

const styles = StyleSheet.create({
  content: {
    gap: 6,
    paddingBottom: 4,
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
