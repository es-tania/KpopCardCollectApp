import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface Stat {
  label: string;
  value: number;
  color?: string;
}

interface ProfileStatsProps {
  stats: Stat[];
  loading?: boolean;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  stats,
  loading = false,
}) => (
  <View style={styles.container}>
    {loading ? (
      <ActivityIndicator color={Colors.accent} />
    ) : (
      stats.map((stat, i) => (
        <React.Fragment key={stat.label}>
          <View style={styles.statItem}>
            <Text
              style={[styles.statNum, stat.color ? { color: stat.color } : {}]}
            >
              {stat.value}
            </Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
          {i < stats.length - 1 && <View style={styles.divider} />}
        </React.Fragment>
      ))
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  statNum: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.accent,
  },
  statLabel: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
    textAlign: "center",
  },
  divider: {
    width: 0.5,
    height: 32,
    backgroundColor: Colors.border,
  },
});
