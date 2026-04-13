import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface SearchEmptyStateProps {
  query: string;
}

export const SearchEmptyState: React.FC<SearchEmptyStateProps> = ({
  query,
}) => {
  const hasQuery = query.trim().length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{hasQuery ? "😕" : "🔍"}</Text>
      <Text style={styles.title}>
        {hasQuery ? "Aucun résultat" : "Rechercher"}
      </Text>
      <Text style={styles.subtitle}>
        {hasQuery
          ? `Aucun résultat pour "${query}"`
          : "Groupes, membres, albums ou photocards"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
  },
  emoji: { fontSize: 48 },
  title: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
    textAlign: "center",
  },
});
