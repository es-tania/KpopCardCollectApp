import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity
} from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { Member } from "../../types";
import { MemberAvatar } from "./MemberAvatar";

interface MembersListProps {
  members: Member[];
  selectedId?: string;
  onPressMember: (member: Member) => void;
}

export const MembersList: React.FC<MembersListProps> = ({
  members,
  selectedId,
  onPressMember,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.content}
  >
    {members.map((member) => {
      const selected = member.id === selectedId;
      return (
        <TouchableOpacity
          key={member.id}
          style={styles.item}
          onPress={() => onPressMember(member)}
          activeOpacity={0.75}
        >
          <MemberAvatar member={member} selected={selected} />
          <Text
            style={[styles.name, selected && styles.nameSelected]}
            numberOfLines={1}
          >
            {member.stageName}
          </Text>
          {member.ownedPhotocards !== undefined && (
            <Text style={styles.count}>
              {member.ownedPhotocards}/{member.totalPhotocards ?? "?"}
            </Text>
          )}
        </TouchableOpacity>
      );
    })}
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
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.surface2,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarSelected: {
    borderColor: Colors.accent,
    borderWidth: 2,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarInitials: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.accent,
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
