import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface SearchSectionHeaderProps {
  title: string;
  count: number;
}

export const SearchSectionHeader: React.FC<SearchSectionHeaderProps> = ({
  title,
  count,
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title.toUpperCase()}</Text>
    <Text style={styles.count}>{count}</Text>
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
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
    fontWeight: Theme.fontWeight.medium,
    letterSpacing: 0.6,
  },
  count: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
});
