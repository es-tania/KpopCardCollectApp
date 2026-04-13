import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { Group } from "../../types";

interface GroupRowProps {
  group: Group;
  onPress: () => void;
}

export const GroupRow: React.FC<GroupRowProps> = ({ group, onPress }) => {
  const completionPct =
    group.totalPhotocards > 0
      ? Math.round(((group.ownedPhotocards ?? 0) / group.totalPhotocards) * 100)
      : 0;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
      {/* Logo */}
      <View style={styles.logoWrap}>
        {group.logoUrl ? (
          <Image
            source={group.logoUrl as any}
            style={styles.logo}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.logoInitials}>
            {group.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </Text>
        )}
      </View>

      {/* Infos */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{group.name}</Text>
          {group.koreanName && (
            <Text style={styles.koreanName}>{group.koreanName}</Text>
          )}
        </View>

        <View style={styles.metaRow}>
          {group.company && <Text style={styles.meta}>{group.company}</Text>}
          {group.generation && (
            <>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.meta}>{group.generation}</Text>
            </>
          )}
          {group.status && group.status !== "active" && (
            <>
              <Text style={styles.metaDot}>·</Text>
              <Text
                style={[
                  styles.meta,
                  group.status === "disbanded" && { color: Colors.danger },
                  group.status === "hiatus" && { color: Colors.warning },
                ]}
              >
                {group.status === "disbanded" ? "Disbandé" : "Hiatus"}
              </Text>
            </>
          )}
        </View>

        {/* Barre de progression */}
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${completionPct}%` as any },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {group.ownedPhotocards ?? 0}/{group.totalPhotocards}
          </Text>
          <Text style={styles.progressPct}>{completionPct}%</Text>
        </View>
      </View>

      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  logoWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surface2,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logo: { width: "100%", height: "100%" },
  logoInitials: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.accent,
  },
  info: { flex: 1, gap: 3 },
  nameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    flexWrap: "wrap",
  },
  name: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  koreanName: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  meta: { fontSize: Theme.fontSize.sm + 1, color: Colors.textMuted },
  metaDot: { fontSize: Theme.fontSize.sm + 1, color: Colors.textMuted },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
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
  progressText: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
  },
  progressPct: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
    minWidth: 30,
    textAlign: "right",
  },
  chevron: { fontSize: 20, color: Colors.textMuted },
});
