import { Colors } from "@/src/constants/colors";
import { Theme } from "@/src/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface NotificationBadgeProps {
  count: number;
  size?: "sm" | "md";
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  size = "md",
}) => {
  if (count === 0) return null;
  const label = count > 99 ? "99+" : String(count);
  return (
    <View style={[styles.badge, size === "sm" && styles.badgeSm]}>
      <Text style={[styles.text, size === "sm" && styles.textSm]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: Colors.bg,
  },
  badgeSm: { minWidth: 14, height: 14, borderRadius: 7 },
  text: { fontSize: Theme.fontSize.xs, color: "#fff", fontWeight: "700" },
  textSm: { fontSize: 9 },
});
