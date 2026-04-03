import { Plus } from "lucide-react-native";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { Group } from "../../types";

interface FollowedGroupsRowProps {
  groups: Group[];
  onPressGroup: (groupId: string) => void;
  onPressAdd: () => void;
}

interface GroupAvatarProps {
  group: Group;
}

const GroupAvatar: React.FC<GroupAvatarProps> = ({ group }) => {
  if (!group.logoUrl) {
    return <Text style={styles.initials}>{group.name[0]}</Text>;
  }

  return (
    <Image
      source={group.logoUrl}
      style={styles.logoImage}
      resizeMode="contain"
    />
  );
};

export const FollowedGroupsRow: React.FC<FollowedGroupsRowProps> = ({
  groups,
  onPressGroup,
  onPressAdd,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.content}
  >
    {groups.map((group) => (
      <TouchableOpacity
        key={group.id}
        style={styles.item}
        onPress={() => onPressGroup(group.id)}
        activeOpacity={0.75}
      >
        <View style={styles.avatarCircle}>
          <GroupAvatar group={group} />
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {group.name}
        </Text>
      </TouchableOpacity>
    ))}
    <TouchableOpacity
      style={styles.item}
      onPress={onPressAdd}
      activeOpacity={0.75}
    >
      <View style={[styles.avatarCircle, styles.addCircle]}>
        <Plus size={20} color={Colors.textMuted} strokeWidth={1.6} />
      </View>
      <Text style={[styles.name, { color: Colors.textMuted }]}>Ajouter</Text>
    </TouchableOpacity>
  </ScrollView>
);

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingBottom: 8,
  },
  item: {
    alignItems: "center",
    width: 64,
  },
  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.surface2,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
    overflow: "hidden",
  },
  addCircle: {
    backgroundColor: "transparent",
    borderStyle: "dashed",
    borderColor: "rgba(125, 211, 240, 0.25)",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  initials: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  name: {
    fontSize: Theme.fontSize.sm,
    color: Colors.text,
    textAlign: "center",
  },
  addLabel: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textMuted,
    textAlign: "center",
  },
});
