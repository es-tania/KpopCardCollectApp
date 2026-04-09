import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface ScanHintsProps {
  status: "idle" | "scanning" | "found" | "not_found";
}

const HINTS: Record<ScanHintsProps["status"], string> = {
  idle: "Pointe la caméra vers une photocard",
  scanning: "Analyse en cours...",
  found: "Photocard identifiée !",
  not_found: "Photocard non trouvé",
};

export const ScanHints: React.FC<ScanHintsProps> = ({ status }) => (
  <View
    style={[
      styles.container,
      status === "found" && styles.found,
      status === "not_found" && styles.notFound,
    ]}
  >
    <Text
      style={[
        styles.text,
        status === "found" && styles.textFound,
        status === "not_found" && styles.textNotFound,
      ]}
    >
      {HINTS[status]}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm + 2,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: "rgba(9,12,18,0.7)",
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  found: {
    backgroundColor: "rgba(74,222,170,0.15)",
    borderColor: "rgba(74,222,170,0.4)",
  },
  notFound: {
    backgroundColor: "rgba(240,112,112,0.1)",
    borderColor: "rgba(240,112,112,0.3)",
  },
  text: {
    fontSize: Theme.fontSize.base,
    color: Colors.text,
    textAlign: "center",
  },
  textFound: { color: Colors.accent },
  textNotFound: { color: Colors.danger },
});
