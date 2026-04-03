import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface BadgeProps {
  label: string;
  color?: string;
  textColor?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = Colors.pillActive,
  textColor = Colors.accent,
}) => (
  <View
    style={[
      styles.container,
      { backgroundColor: color, borderColor: textColor + "66" },
    ]}
  >
    <Text style={[styles.text, { color: textColor }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    borderWidth: 0.5,
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: Theme.fontSize.xs + 1,
  },
});
