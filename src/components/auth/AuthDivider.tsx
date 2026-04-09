import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

export const AuthDivider: React.FC = () => (
  <View style={styles.container}>
    <View style={styles.line} />
    <Text style={styles.text}>ou</Text>
    <View style={styles.line} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
  },
  line: {
    flex: 1,
    height: 0.5,
    backgroundColor: Colors.border,
  },
  text: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
});
