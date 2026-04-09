import { Edit2, Trash2 } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../../constants/colors";
import { Theme } from "../../../constants/theme";
import { Group } from "../../../types";

interface GroupManageRowProps {
  group: Group;
  onEdit: () => void;
  onDelete: () => void;
}

export const GroupManageRow: React.FC<GroupManageRowProps> = ({
  group,
  onEdit,
  onDelete,
}) => (
  <View style={styles.row}>
    {/* Logo */}
    <View style={styles.logoWrap}>
      {group.logoUrl || group.logoUrl ? (
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
      <Text style={styles.name} numberOfLines={1}>
        {group.name}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        {[group.company, group.generation].filter(Boolean).join(" · ")}
      </Text>
      <Text style={styles.count}>
        {group.totalPhotocards} photocards · {group.memberCount ?? "?"} membres
      </Text>
    </View>

    {/* Actions */}
    <View style={styles.actions}>
      <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
        <Edit2 size={15} color={Colors.accent} strokeWidth={1.8} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
        <Trash2 size={15} color={Colors.danger} strokeWidth={1.8} />
      </TouchableOpacity>
    </View>
  </View>
);

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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logo: { width: "100%", height: "100%" },
  logoInitials: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.accent,
  },
  info: { flex: 1, gap: 2 },
  name: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
  },
  meta: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  count: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  actions: {
    flexDirection: "row",
    gap: Theme.spacing.sm,
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Colors.pillActive,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: "rgba(240,112,112,0.1)",
    borderWidth: 0.5,
    borderColor: "rgba(240,112,112,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
});
