import { FilterPills } from "@/src/components/ui/FilterPills";
import { Colors } from "@/src/constants/colors";
import { Theme } from "@/src/constants/theme";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface FilterGroup {
  id: string;
  label: string;
  options: { key: string; label: string }[];
  selected: string;
  onSelect: (key: string) => void;
}

interface FilterToggleProps {
  options?: { key: string; label: string }[];
  selected?: string;
  onSelect?: (key: string) => void;
  label?: string;
  groups?: FilterGroup[];
}

export const FilterToggle: React.FC<FilterToggleProps> = ({
  options,
  selected,
  onSelect,
  label = "Filtrer",
  groups,
}) => {
  const [open, setOpen] = useState(false);

  // ── Normalise en groupes ──────────────────────────────────────────────
  const filterGroups: FilterGroup[] =
    groups ??
    (options
      ? [
          {
            id: "default",
            label,
            options,
            selected: selected ?? "all",
            onSelect: onSelect ?? (() => {}),
          },
        ]
      : []);

  const hasActiveFilter = filterGroups.some((g) => g.selected !== "all");

  // ── Label du bouton — affiche les filtres actifs ──────────────────────
  const activeLabels = filterGroups
    .filter((g) => g.selected !== "all")
    .map(
      (g) => g.options.find((o) => o.key === g.selected)?.label ?? g.selected,
    );

  const btnLabel =
    activeLabels.length > 0
      ? activeLabels.join(" · ")
      : groups
        ? "Filtrer"
        : label;

  return (
    <>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.75}
      >
        <SlidersHorizontal
          size={15}
          color={open || hasActiveFilter ? Colors.accent : Colors.textMuted}
          strokeWidth={1.6}
        />
        <Text
          style={[styles.text, (open || hasActiveFilter) && styles.textActive]}
        >
          {btnLabel}
        </Text>
        {hasActiveFilter && <View style={styles.dot} />}
        {open ? (
          <ChevronUp size={14} color={Colors.textMuted} strokeWidth={1.6} />
        ) : (
          <ChevronDown size={14} color={Colors.textMuted} strokeWidth={1.6} />
        )}
      </TouchableOpacity>

      {open && (
        <View style={styles.pills}>
          {filterGroups.map((group, i) => (
            <View
              key={group.id}
              style={[
                styles.group,
                i < filterGroups.length - 1 && styles.groupDivider,
              ]}
            >
              {filterGroups.length > 1 && (
                <Text style={styles.groupLabel}>{group.label}</Text>
              )}
              <FilterPills
                options={group.options}
                selected={group.selected}
                onSelect={group.onSelect}
              />
            </View>
          ))}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  text: {
    flex: 1,
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  textActive: { color: Colors.accent },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  pills: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    marginBottom: Theme.spacing.md,
  },
  group: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
  },
  groupDivider: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  groupLabel: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: Theme.spacing.sm,
  },
});
