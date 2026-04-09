import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { Group, Member } from "../../types";

interface ScanFiltersProps {
  groups: Group[];
  members: Member[];
  selectedGroupId: string | null;
  selectedMemberId: string | null;
  onSelectGroup: (id: string | null) => void;
  onSelectMember: (id: string | null) => void;
}

export const ScanFilters: React.FC<ScanFiltersProps> = ({
  groups,
  members,
  selectedGroupId,
  selectedMemberId,
  onSelectGroup,
  onSelectMember,
}) => {
  const filteredMembers = selectedGroupId
    ? members.filter((m) => m.groupId === selectedGroupId)
    : [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Affiner la recherche (optionnel)</Text>

      {/* Groupes */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsRow}
      >
        <TouchableOpacity
          style={[styles.pill, selectedGroupId === null && styles.pillActive]}
          onPress={() => {
            onSelectGroup(null);
            onSelectMember(null);
          }}
        >
          <Text
            style={[
              styles.pillText,
              selectedGroupId === null && styles.pillTextActive,
            ]}
          >
            Tous
          </Text>
        </TouchableOpacity>
        {groups.map((g) => (
          <TouchableOpacity
            key={g.id}
            style={[styles.pill, selectedGroupId === g.id && styles.pillActive]}
            onPress={() => {
              onSelectGroup(g.id);
              onSelectMember(null);
            }}
          >
            <Text
              style={[
                styles.pillText,
                selectedGroupId === g.id && styles.pillTextActive,
              ]}
            >
              {g.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Membres — apparaît uniquement si un groupe est sélectionné */}
      {selectedGroupId && filteredMembers.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
        >
          <TouchableOpacity
            style={[
              styles.pill,
              styles.pillSm,
              selectedMemberId === null && styles.pillActive,
            ]}
            onPress={() => onSelectMember(null)}
          >
            <Text
              style={[
                styles.pillText,
                selectedMemberId === null && styles.pillTextActive,
              ]}
            >
              Tous les membres
            </Text>
          </TouchableOpacity>
          {filteredMembers.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[
                styles.pill,
                styles.pillSm,
                selectedMemberId === m.id && styles.pillActive,
              ]}
              onPress={() => onSelectMember(m.id)}
            >
              <Text
                style={[
                  styles.pillText,
                  selectedMemberId === m.id && styles.pillTextActive,
                ]}
              >
                {m.stageName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
  },
  title: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
    textAlign: "center",
  },
  pillsRow: {
    gap: 6,
    paddingVertical: 2,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  pillSm: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pillActive: {
    backgroundColor: Colors.pillActive,
    borderColor: Colors.borderActive,
  },
  pillText: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  pillTextActive: {
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
});
