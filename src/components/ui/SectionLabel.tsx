import React from "react";
import { StyleSheet, Text, TextStyle } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface SectionLabelProps {
  label: string;
  style?: TextStyle | TextStyle[];
}

export const SectionLabel: React.FC<SectionLabelProps> = ({ label, style }) => (
  <Text style={[styles.text, style]}>{label.toUpperCase()}</Text>
);

const styles = StyleSheet.create({
  text: {
    fontSize: Theme.fontSize.md,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginTop: Theme.spacing.xs,
    marginBottom: Theme.spacing.md + 2,
    fontWeight: Theme.fontWeight.medium,
  },
});
