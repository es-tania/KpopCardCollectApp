import { useUserStats } from "@/src/hooks/useUserStats";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { Member } from "../../types";

interface MemberGridItemProps {
  member: Member;
  selected: boolean;
  onPress: () => void;
}

export const MemberGridItem: React.FC<MemberGridItemProps> = ({
  member,
  selected,
  onPress,
}) => {
  // ── Stats live depuis le store via useUserStats ───────────────────────
  const stats = useUserStats({ memberId: member.id });

  const owned = stats.ownedPhotocards;
  const total = stats.totalPhotocards || member.totalPhotocards || 0;
  const pct = total > 0 ? Math.round((owned / total) * 100) : 0;

  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Photo */}
      <View style={styles.photoWrap}>
        {member.photoUrl ? (
          <Image
            source={member.photoUrl as any}
            style={styles.photo}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.photoFallback}>
            <Text style={styles.photoInitial}>
              {member.stageName[0].toUpperCase()}
            </Text>
          </View>
        )}
        {selected && <View style={styles.selectedDot} />}
      </View>

      {/* Infos */}
      <View style={styles.info}>
        <Text
          style={[styles.stageName, selected && styles.stageNameSelected]}
          numberOfLines={1}
        >
          {member.stageName}
        </Text>
        {member.position && member.position.length > 0 && (
          <Text style={styles.position} numberOfLines={1}>
            {member.position[0]}
          </Text>
        )}
        {total > 0 && (
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${pct}%` as any }]}
              />
            </View>
            <Text style={styles.progressCount}>
              {owned}/{total}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "31%",
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  cardSelected: {
    borderColor: Colors.accent,
    borderWidth: 1.5,
  },
  photoWrap: {
    width: "100%",
    height: 100,
    backgroundColor: Colors.surface2,
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  photoInitial: {
    fontSize: 40,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.accent,
  },
  selectedDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
    borderWidth: 1.5,
    borderColor: Colors.bg,
  },
  info: {
    padding: Theme.spacing.sm + 2,
    gap: 3,
  },
  stageName: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
  },
  stageNameSelected: {
    color: Colors.accent,
  },
  position: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textMuted,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: Colors.surface2,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  progressCount: {
    fontSize: Theme.fontSize.xs,
    color: Colors.textMuted,
    minWidth: 28,
    textAlign: "right",
  },
});
