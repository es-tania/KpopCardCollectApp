import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { Group } from "../../types";

interface GroupCardProps {
  group: Group;
  onPress: () => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
    <View style={styles.logoContainer}>
      {group.logoUrl ? (
        <Image
          source={group.logoUrl}
          style={styles.logo}
          resizeMode="contain"
        />
      ) : (
        <Text style={styles.logoFallback}>🎵</Text>
      )}
    </View>
    <Text style={styles.name} numberOfLines={1}>
      {group.name}
    </Text>
    <Text style={styles.count}>{group.totalPhotocards} photocards</Text>
    {group.generation && <Text style={styles.gen}>{group.generation}</Text>}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Theme.borderRadius.lg,
    padding: 14,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  logoContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surface2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  logoFallback: {
    fontSize: 24,
  },
  name: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
    textAlign: "center",
  },
  count: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: "center",
  },
  gen: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.accent,
    marginTop: 4,
  },
});
