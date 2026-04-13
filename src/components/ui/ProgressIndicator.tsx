import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface ProgressIndicatorProps {
  message: string | null;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  message,
}) => {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color={Colors.accent} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
    padding: Theme.spacing.md,
  },
  text: {
    fontSize: Theme.fontSize.base,
    color: Colors.accent,
  },
});
