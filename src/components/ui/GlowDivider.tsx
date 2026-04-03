import React from "react";
import { StyleSheet, View } from "react-native";

export const GlowDivider: React.FC = () => <View style={styles.line} />;

const styles = StyleSheet.create({
  line: {
    height: 1,
    backgroundColor: "rgba(125, 211, 240, 0.15)",
    marginVertical: 12,
  },
});
