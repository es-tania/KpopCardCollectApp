import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface AdminSectionTitleProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const AdminSectionTitle: React.FC<AdminSectionTitleProps> = ({
  title,
  actionLabel,
  onAction,
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title.toUpperCase()}</Text>
    {actionLabel && onAction && (
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.action}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.sm,
  },
  title: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
    fontWeight: Theme.fontWeight.medium,
    letterSpacing: 0.8,
  },
  action: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.accent,
  },
});
