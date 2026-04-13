import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { Group } from "../../types";

interface SearchGroupResultProps {
  group: Group;
  isFollowing: boolean;
  onPress: () => void;
  onFollow: () => void;
}

export const SearchGroupResult: React.FC<SearchGroupResultProps> = ({
  group,
  isFollowing,
  onPress,
  onFollow,
}) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
    <View style={styles.avatarWrap}>
      {group.logoUrl ? (
        <Image
          source={group.logoUrl as any}
          style={styles.avatar}
          resizeMode="contain"
        />
      ) : (
        <Text style={styles.avatarInitial}>
          {group.name.slice(0, 2).toUpperCase()}
        </Text>
      )}
    </View>
    <View style={styles.info}>
      <Text style={styles.title}>{group.name}</Text>
      <Text style={styles.subtitle}>
        {[group.company, group.generation].filter(Boolean).join(" · ")}
      </Text>
    </View>
    <TouchableOpacity
      style={[styles.followBtn, isFollowing && styles.followBtnActive]}
      onPress={onFollow}
    >
      <Text
        style={[
          styles.followBtnText,
          isFollowing && styles.followBtnTextActive,
        ]}
      >
        {isFollowing ? "Suivi ✓" : "Suivre"}
      </Text>
    </TouchableOpacity>
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
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatar: { width: "100%", height: "100%" },
  avatarInitial: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.accent,
  },
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
  followBtn: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
  },
  followBtnActive: {
    backgroundColor: Colors.pillActive,
    borderColor: Colors.borderActive,
  },
  followBtnText: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  followBtnTextActive: {
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
});
