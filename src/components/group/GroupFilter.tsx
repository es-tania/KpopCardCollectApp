import { View } from "@/components/Themed";
import { Colors } from "@/src/constants/colors";
import { Theme } from "@/src/constants/theme";
import { Group } from "@/src/types";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
} from "react-native";

const ALL_KEY = "all";

interface GroupFilterProps {
  groups: Group[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const GroupFilter: React.FC<GroupFilterProps> = ({
  groups,
  selectedId,
  onSelect,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.groupFilterContent}
  >
    {/* Pill "Tous" */}
    <TouchableOpacity
      style={styles.groupItem}
      onPress={() => onSelect(ALL_KEY)}
      activeOpacity={0.75}
    >
      <View
        style={[
          styles.groupAvatar,
          selectedId === ALL_KEY && styles.groupAvatarActive,
        ]}
      >
        <Text style={styles.groupAvatarAll}>✦</Text>
      </View>
      <Text
        style={[
          styles.groupName,
          selectedId === ALL_KEY && styles.groupNameActive,
        ]}
      >
        Tous
      </Text>
    </TouchableOpacity>

    {/* Groupes */}
    {groups.map((g) => (
      <TouchableOpacity
        key={g.id}
        style={styles.groupItem}
        onPress={() => onSelect(g.id)}
        activeOpacity={0.75}
      >
        <View
          style={[
            styles.groupAvatar,
            selectedId === g.id && styles.groupAvatarActive,
          ]}
        >
          {g.logoUrl || g.logoUrl ? (
            <Image
              source={(g.logoUrl ?? g.logoUrl) as any}
              style={styles.groupLogo}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.groupInitials}>
              {g.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </Text>
          )}
        </View>
        <Text
          style={[
            styles.groupName,
            selectedId === g.id && styles.groupNameActive,
          ]}
          numberOfLines={1}
        >
          {g.name}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  // Pills groupe
  groupFilterContent: {
    gap: 14,
    paddingVertical: Theme.spacing.xs,
  },
  groupItem: {
    alignItems: "center",
    gap: 5,
    width: 58,
  },
  groupAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface2,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  groupAvatarActive: {
    borderColor: Colors.accent,
    borderWidth: 2,
    backgroundColor: Colors.pillActive,
  },
  groupLogo: {
    width: "100%",
    height: "100%",
  },
  groupInitials: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.accent,
  },
  groupAvatarAll: {
    fontSize: 18,
    color: Colors.accent,
  },
  groupName: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
    textAlign: "center",
  },
  groupNameActive: {
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
});
