import { Theme } from "@/src/constants/theme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Colors } from "../../constants/colors";

interface ScanFrameProps {
  width?: number;
  height?: number;
}

export const ScanFrame: React.FC<ScanFrameProps> = ({
  width = 260,
  height = 260 * 1.5,
}) => {
  return (
    <View style={[styles.frame, { width, height }]}>
      <View
        style={[styles.border, { width, height, borderColor: Colors.accent }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  frame: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  border: {
    position: "absolute",
    borderWidth: 2,
    borderRadius: Theme.borderRadius.lg,
  },
});
