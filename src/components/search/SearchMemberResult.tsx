import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { Member } from "../../types";

interface SearchMemberResultProps {
  member: Member;
  onPress: () => void;
}

export const SearchMemberResult: React.FC<SearchMemberResultProps> = ({
  member,
  onPress,
}) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
    <View style={styles.avatarWrap}>
      {member.photoUrl ? (
        <Image
          source={member.photoUrl as any}
          style={styles.avatar}
          resizeMode="cover"
        />
      ) : (
        <Text style={styles.avatarInitial}>
          {member.stageName[0].toUpperCase()}
        </Text>
      )}
    </View>
    <View style={styles.info}>
      <Text style={styles.title}>{member.stageName}</Text>
      <Text style={styles.subtitle}>
        {[member.realName, member.position?.slice(0, 2).join(", ")]
          .filter(Boolean)
          .join(" · ")}
      </Text>
    </View>
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
});
