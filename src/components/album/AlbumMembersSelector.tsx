import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../../constants/colors";
import { ALL_MEMBERS_ID } from "../../constants/filterOptions";
import { Theme } from "../../constants/theme";
import { Member } from "../../types";
import { MembersList } from "../member/MembersList";

interface AlbumMembersSelectorProps {
  members: Member[];
  selectedMemberId: string;
  onSelectAll: () => void;
  onSelectMember: (member: Member) => void;
}

export const AlbumMembersSelector: React.FC<AlbumMembersSelectorProps> = ({
  members,
  selectedMemberId,
  onSelectAll,
  onSelectMember,
}) => (
  <View style={styles.container}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {/* Bouton Tous */}
      <TouchableOpacity
        style={styles.item}
        onPress={onSelectAll}
        activeOpacity={0.75}
      >
        <View
          style={[
            styles.allCircle,
            selectedMemberId === ALL_MEMBERS_ID && styles.allCircleSelected,
          ]}
        >
          <Text style={styles.allCircleText}>✦</Text>
        </View>
        <Text
          style={[
            styles.name,
            selectedMemberId === ALL_MEMBERS_ID && styles.nameSelected,
          ]}
        >
          Tous
        </Text>
      </TouchableOpacity>

      {/* Membres */}
      <MembersList
        members={members}
        selectedId={
          selectedMemberId !== ALL_MEMBERS_ID ? selectedMemberId : undefined
        }
        onPressMember={onSelectMember}
      />
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    paddingBottom: Theme.spacing.md,
  },
  scroll: {
    paddingHorizontal: Theme.spacing.lg,
    gap: 12,
    alignItems: "flex-start",
  },
  item: {
    alignItems: "center",
    width: 62,
    gap: 4,
  },
  allCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.surface2,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  allCircleSelected: {
    borderColor: Colors.accent,
    borderWidth: 2,
    backgroundColor: Colors.pillActive,
  },
  allCircleText: {
    fontSize: 20,
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
});
