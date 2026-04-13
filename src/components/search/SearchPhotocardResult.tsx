import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { PhotocardWithDetails } from "../../types";

interface SearchPhotocardResultProps {
  card: PhotocardWithDetails;
  onPress: () => void;
}

export const SearchPhotocardResult: React.FC<SearchPhotocardResultProps> = ({
  card,
  onPress,
}) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.imageWrap}>
      {card.imageUrl ? (
        <Image
          source={card.imageUrl as any}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <Text style={styles.fallback}>🧑‍🎤</Text>
      )}
    </View>
    <View style={styles.info}>
      <Text style={styles.title}>{card.memberName}</Text>
      <Text style={styles.subtitle}>
        {card.groupName} · {card.albumTitle}
      </Text>
      {card.version && <Text style={styles.tag}>{card.version}</Text>}
    </View>
    {card.isInCollection && (
      <View style={styles.ownedBadge}>
        <Text style={styles.ownedBadgeText}>✓</Text>
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm + 2,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  imageWrap: {
    width: 36,
    height: 52,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Colors.surface2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  image: { width: "100%", height: "100%" },
  fallback: { fontSize: 18 },
  info: { flex: 1, gap: 2 },
  title: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
  },
  subtitle: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  tag: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.accent,
  },
  ownedBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  ownedBadgeText: {
    fontSize: 11,
    color: Colors.bg,
    fontWeight: Theme.fontWeight.bold,
  },
});
