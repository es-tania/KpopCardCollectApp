import { ChevronRight } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface AdminActionRowProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  badge?: string | number;
  badgeColor?: string;
  onPress: () => void;
  destructive?: boolean;
}

export const AdminActionRow: React.FC<AdminActionRowProps> = ({
  icon,
  label,
  sublabel,
  badge,
  badgeColor = Colors.accent,
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
        <View
          style={[
            styles.badge,
            {
              backgroundColor: `${badgeColor}20`,
              borderColor: `${badgeColor}50`,
            },
          ]}
        >
          <Text style={[styles.badgeText, { color: badgeColor }]}>{badge}</Text>
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
    width: 36,
    height: 36,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapDestructive: {
    backgroundColor: "rgba(240,112,112,0.1)",
  },
  labelWrap: { flex: 1, gap: 2 },
  label: {
    fontSize: Theme.fontSize.base,
    color: Colors.text,
    fontWeight: Theme.fontWeight.medium,
  },
  labelDestructive: { color: Colors.danger },
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
    borderRadius: Theme.borderRadius.full,
    borderWidth: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: Theme.fontSize.xs + 1,
    fontWeight: Theme.fontWeight.medium,
  },
});
