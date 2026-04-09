import { AdminTab } from "@/src/types";
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

interface AdminTabBarProps {
  tabs: AdminTab[];
  activeKey: string;
  onSelect: (key: string) => void;
}

export const AdminTabBar: React.FC<AdminTabBarProps> = ({
  tabs,
  activeKey,
  onSelect,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.content}
    style={styles.scroll}
  >
    {tabs.map((tab) => {
      const active = tab.key === activeKey;
      return (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, active && styles.tabActive]}
          onPress={() => onSelect(tab.key)}
          activeOpacity={0.75}
        >
          <Text style={[styles.label, active && styles.labelActive]}>
            {tab.label}
          </Text>
          {tab.count !== undefined && (
            <View style={[styles.badge, active && styles.badgeActive]}>
              <Text
                style={[styles.badgeText, active && styles.badgeTextActive]}
              >
                {tab.count}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  scroll: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  content: {
    paddingHorizontal: Theme.spacing.lg,
    gap: 0,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: Theme.spacing.sm + 2,
    paddingHorizontal: Theme.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: Colors.accent,
  },
  label: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
  },
  labelActive: {
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
  badge: {
    backgroundColor: Colors.surface2,
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
    // minWidth: 55,
    alignItems: "center",
  },
  badgeActive: {
    backgroundColor: Colors.pillActive,
  },
  badgeText: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
  },
  badgeTextActive: {
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
});
