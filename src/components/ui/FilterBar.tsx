import { Colors } from "@/src/constants/colors";
import { Theme } from "@/src/constants/theme";
import { ChevronDown, X } from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterOption {
  key: string;
  label: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  selected: string;
  onChange: (key: string) => void;
}

interface FilterBarProps {
  filters: FilterGroup[];
}

// ─── Chip — affiche un filtre actif ──────────────────────────────────────────

const FilterChip: React.FC<{
  group: FilterGroup;
  onPress: () => void;
}> = ({ group, onPress }) => {
  const isActive = group.selected !== "all";
  const selectedLabel =
    group.options.find((o) => o.key === group.selected)?.label ?? group.label;

  return (
    <TouchableOpacity
      style={[styles.chip, isActive && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
        {isActive ? selectedLabel : group.label}
      </Text>
      {isActive ? (
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            group.onChange("all");
          }}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <X size={11} color={Colors.accent} strokeWidth={2.5} />
        </TouchableOpacity>
      ) : (
        <ChevronDown size={11} color={Colors.textMuted} strokeWidth={2} />
      )}
    </TouchableOpacity>
  );
};

// ─── Bottom Sheet — sélecteur d'options ──────────────────────────────────────

const FilterSheet: React.FC<{
  group: FilterGroup;
  visible: boolean;
  onClose: () => void;
}> = ({ group, visible, onClose }) => {
  const slideAnim = useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    } else {
      slideAnim.setValue(300);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          <SafeAreaView edges={["bottom"]}>
            {/* Handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{group.label}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={18} color={Colors.textMuted} strokeWidth={1.8} />
              </TouchableOpacity>
            </View>

            {/* Options */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.optionsList}
            >
              {group.options.map((opt) => {
                const isSelected = opt.key === group.selected;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => {
                      group.onChange(opt.key);
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    {/* Indicateur sélection */}
                    <View
                      style={[
                        styles.optionDot,
                        isSelected && styles.optionDotSelected,
                      ]}
                    />
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {isSelected && (
                      <View style={styles.optionCheck}>
                        <Text style={styles.optionCheckText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

// ─── FilterBar ────────────────────────────────────────────────────────────────

export const FilterBar: React.FC<FilterBarProps> = ({ filters }) => {
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const activeCount = filters.filter((f) => f.selected !== "all").length;

  const handleClearAll = useCallback(() => {
    filters.forEach((f) => f.onChange("all"));
  }, [filters]);

  if (filters.length === 0) return null;

  return (
    <>
      <View style={styles.bar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.barContent}
        >
          {/* Bouton reset si filtres actifs */}
          {activeCount > 0 && (
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={handleClearAll}
              activeOpacity={0.75}
            >
              <X size={11} color={Colors.danger} strokeWidth={2.5} />
              <Text style={styles.resetText}>Réinitialiser</Text>
            </TouchableOpacity>
          )}

          {/* Chips des filtres */}
          {filters.map((group) => (
            <FilterChip
              key={group.id}
              group={group}
              onPress={() =>
                setOpenFilter(openFilter === group.id ? null : group.id)
              }
            />
          ))}
        </ScrollView>
      </View>

      {/* Bottom Sheets */}
      {filters.map((group) => (
        <FilterSheet
          key={group.id}
          group={group}
          visible={openFilter === group.id}
          onClose={() => setOpenFilter(null)}
        />
      ))}
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Bar ──────────────────────────────────────────────────────────────
  bar: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  barContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm + 2,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  // ── Chip ──────────────────────────────────────────────────────────────
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: "rgba(145,126,255,0.12)",
    borderColor: Colors.accent,
  },
  chipLabel: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  chipLabelActive: {
    color: Colors.accent,
  },

  // ── Reset ─────────────────────────────────────────────────────────────
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: "rgba(240,112,112,0.1)",
    borderWidth: 0.5,
    borderColor: "rgba(240,112,112,0.3)",
  },
  resetText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.danger,
    fontWeight: "500",
  },

  // ── Overlay ───────────────────────────────────────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  // ── Sheet ─────────────────────────────────────────────────────────────
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginTop: Theme.spacing.sm,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  sheetTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: "600",
    color: Colors.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.surface2,
  },

  // ── Options ───────────────────────────────────────────────────────────
  optionsList: {
    paddingVertical: Theme.spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
  },
  optionSelected: {
    backgroundColor: "rgba(145,126,255,0.06)",
  },
  optionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surface2,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  optionDotSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  optionLabel: {
    flex: 1,
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
  },
  optionLabelSelected: {
    color: Colors.text,
    fontWeight: "500",
  },
  optionCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  optionCheckText: {
    fontSize: Theme.fontSize.xs,
    color: Colors.bg,
    fontWeight: "700",
  },
});
