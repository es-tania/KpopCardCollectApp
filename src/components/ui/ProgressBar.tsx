import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface ProgressBarProps {
  label: string;
  current: number;
  total: number;
  accentColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  current,
  total,
  accentColor = Colors.accent,
}) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.count, { color: accentColor }]}>
          {current} / {total}
        </Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${percentage}%` as any, backgroundColor: accentColor },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.sm + 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  label: {
    fontSize: Theme.fontSize.base,
    color: Colors.text,
  },
  count: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
  },
  track: {
    height: 4,
    backgroundColor: Colors.surface2,
    borderRadius: 2,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 2,
  },
});
