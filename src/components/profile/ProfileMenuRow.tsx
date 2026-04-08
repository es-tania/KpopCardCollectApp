import { ChevronRight } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface ProfileMenuRowProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  badge?: string | number;
  onPress: () => void;
  destructive?: boolean;
}

export const ProfileMenuRow: React.FC<ProfileMenuRowProps> = ({
  icon,
  label,
  sublabel,
  badge,
  onPress,
  destructive = false,
}) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
    <View style={[styles.iconWrap, destructive && styles.iconWrapDestructive]}>
      {icon}
    </View>
    <View style={styles.labelWrap}>
      <Text style={[styles.label, destructive && styles.labelDestructive]}>
        {label}
      </Text>
      {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
    </View>
    <View style={styles.right}>
      {badge !== undefined && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <ChevronRight size={16} color={Colors.textMuted} strokeWidth={1.6} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapDestructive: {
    backgroundColor: "rgba(240,112,112,0.1)",
  },
  labelWrap: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: Theme.fontSize.base,
    color: Colors.text,
    fontWeight: Theme.fontWeight.medium,
  },
  labelDestructive: {
    color: Colors.danger,
  },
  sublabel: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    backgroundColor: Colors.pillActive,
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
  },
  badgeText: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
});
