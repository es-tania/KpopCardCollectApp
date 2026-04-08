import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface AdminStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  onPress?: () => void;
  accentColor?: string;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  icon,
  label,
  value,
  onPress,
  accentColor = Colors.accent,
}) => (
  <TouchableOpacity
    style={styles.card}
    onPress={onPress}
    activeOpacity={onPress ? 0.75 : 1}
  >
    <View style={[styles.iconWrap, { backgroundColor: `${accentColor}18` }]}>
      {icon}
    </View>
    <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Theme.spacing.md,
    alignItems: "center",
    gap: 6,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.semibold,
  },
  label: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
    textAlign: "center",
  },
});
