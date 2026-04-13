import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { Group } from "../../types";
import { GroupRow } from "./GroupRow";

interface GroupAlphaListProps {
  groups: Group[];
  onPressGroup: (groupId: string) => void;
}

export const GroupAlphaList: React.FC<GroupAlphaListProps> = ({
  groups,
  onPressGroup,
}) => {
  // Groupe par lettre alphabétique
  const groupedByLetter = useMemo(() => {
    const map = new Map<string, Group[]>();
    [...groups]
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((g) => {
        const letter = g.name[0].toUpperCase();
        if (!map.has(letter)) map.set(letter, []);
        map.get(letter)!.push(g);
      });
    return map;
  }, [groups]);

  if (groups.length === 0) return null;

  return (
    <>
      {Array.from(groupedByLetter.entries()).map(([letter, letterGroups]) => (
        <View key={letter}>
          {/* Séparateur alphabétique */}
          <View style={styles.alphaHeader}>
            <Text style={styles.alphaText}>{letter}</Text>
          </View>

          {/* Lignes du groupe */}
          {letterGroups.map((group) => (
            <GroupRow
              key={group.id}
              group={group}
              onPress={() => onPressGroup(group.id)}
            />
          ))}
        </View>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  alphaHeader: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xs,
  },
  alphaText: {
    fontSize: Theme.fontSize.sm + 1,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.accent,
    letterSpacing: 0.5,
  },
});
