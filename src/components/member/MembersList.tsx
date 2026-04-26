import { useUserStats } from "@/src/hooks/useUserStats";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { Member } from "../../types";
import { MemberAvatar } from "./MemberAvatar";

interface MembersListProps {
  members: Member[];
  selectedId?: string;
  albumId?: string; // ← nouveau — pour filtrer les stats par album
  onPressMember: (member: Member) => void;
}

// ─── Item individuel — utilise useUserStats ───────────────────────────────────

const MemberItem = React.memo(
  ({
    member,
    selected,
    albumId,
    onPress,
  }: {
    member: Member;
    selected: boolean;
    albumId?: string;
    onPress: () => void;
  }) => {
    console.log(`📊 useUserStats memberId=${member.id} albumId=${albumId}`);
    const stats = useUserStats({ memberId: member.id, albumId });
    console.log(
      `📊 stats pour ${member.stageName}:`,
      stats.totalPhotocards,
      stats.ownedPhotocards,
    );

    const total = albumId
      ? stats.totalPhotocards
      : stats.totalPhotocards || member.totalPhotocards || 0;

    const owned = albumId
      ? stats.ownedPhotocards
      : (stats.ownedPhotocards ?? member.ownedPhotocards ?? 0);

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={onPress}
        activeOpacity={0.75}
      >
        <MemberAvatar member={member} selected={selected} />
        <Text
          style={[styles.name, selected && styles.nameSelected]}
          numberOfLines={1}
        >
          {member.stageName}
        </Text>

        <Text style={styles.count}>
          {owned}/{total}
        </Text>
      </TouchableOpacity>
    );
  },
);

// ─── Liste ────────────────────────────────────────────────────────────────────

export const MembersList: React.FC<MembersListProps> = ({
  members,
  selectedId,
  albumId,
  onPressMember,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.content}
  >
    {members.map((member) => (
      <MemberItem
        key={member.id}
        member={member}
        selected={member.id === selectedId}
        albumId={albumId}
        onPress={() => onPressMember(member)}
      />
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingHorizontal: Theme.spacing.lg,
  },
  item: {
    alignItems: "center",
    width: 62,
    gap: 4,
  },
  name: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textMuted,
    textAlign: "center",
  },
  nameSelected: {
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
  count: {
    fontSize: Theme.fontSize.xs,
    color: Colors.textMuted,
  },
});
