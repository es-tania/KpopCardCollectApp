import { SettingsRowType } from "@/src/types";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface SettingsRowProps {
  icon?: React.ReactNode;
  label: string;
  sublabel?: string;
  type?: SettingsRowType;
  value?: boolean;
  valueLabel?: string;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  destructive?: boolean;
  showSeparator?: boolean;
  disabled?: boolean;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  label,
  sublabel,
  type = "navigate",
  value,
  valueLabel,
  onPress,
  onToggle,
  destructive = false,
  showSeparator = true,
  disabled = false,
}) => {
  const content = (
    <View style={[styles.row, !showSeparator && styles.rowNoSep]}>
      {/* Icône */}
      {icon && (
        <View
          style={[styles.iconWrap, destructive && styles.iconWrapDestructive]}
        >
          {icon}
        </View>
      )}

      {/* Label */}
      <View style={styles.labelWrap}>
        <Text
          style={[
            styles.label,
            destructive && styles.labelDestructive,
            disabled && styles.labelDisabled,
          ]}
        >
          {label}
        </Text>
        {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
      </View>

      {/* Droite */}
      <View style={styles.right}>
        {type === "toggle" && onToggle && (
          <Switch
            value={value ?? false}
            onValueChange={onToggle}
            trackColor={{
              false: Colors.surface2,
              true: Colors.accent,
            }}
            thumbColor={Colors.text}
            disabled={disabled}
          />
        )}
        {type === "navigate" && (
          <>
            {valueLabel && <Text style={styles.valueLabel}>{valueLabel}</Text>}
            <ChevronRight
              size={16}
              color={Colors.textMuted}
              strokeWidth={1.6}
            />
          </>
        )}
        {type === "info" && valueLabel && (
          <Text style={styles.valueLabel}>{valueLabel}</Text>
        )}
      </View>
    </View>
  );

  if (type === "toggle" || type === "info") {
    return content;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      disabled={disabled}
    >
      {content}
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
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  rowNoSep: {
    borderBottomWidth: 0,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Colors.surface2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconWrapDestructive: {
    backgroundColor: "rgba(240,112,112,0.1)",
  },
  labelWrap: { flex: 1, gap: 2 },
  label: {
    fontSize: Theme.fontSize.base,
    color: Colors.text,
  },
  labelDestructive: { color: Colors.danger },
  labelDisabled: { color: Colors.textMuted },
  sublabel: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  valueLabel: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
});
