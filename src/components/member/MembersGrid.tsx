import React from "react";
import { StyleSheet, View } from "react-native";
import { Theme } from "../../constants/theme";
import { Member } from "../../types";
import { MemberGridItem } from "./MemberGridItem";

interface MembersGridProps {
  members: Member[];
  selectedId?: string;
  onPressMember: (member: Member) => void;
}

export const MembersGrid: React.FC<MembersGridProps> = ({
  members,
  selectedId,
  onPressMember,
}) => (
  <View style={styles.grid}>
    {members.map((member) => (
      <MemberGridItem
        key={member.id}
        member={member}
        selected={member.id === selectedId}
        onPress={() => onPressMember(member)}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: Theme.spacing.lg,
  },
});
