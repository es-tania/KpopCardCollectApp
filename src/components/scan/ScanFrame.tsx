import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Colors } from "../../constants/colors";

interface ScanFrameProps {
  size?: number;
}

export const ScanFrame: React.FC<ScanFrameProps> = ({ size = 260 }) => {
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const scanLineY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, size - 4],
  });

  const cornerSize = 24;
  const cornerThickness = 3;

  return (
    <View style={[styles.frame, { width: size, height: size * 1.47 }]}>
      {/* Coins du cadre */}
      {/* Top Left */}
      <View
        style={[
          styles.corner,
          styles.cornerTL,
          {
            width: cornerSize,
            height: cornerSize,
            borderTopWidth: cornerThickness,
            borderLeftWidth: cornerThickness,
          },
        ]}
      />
      {/* Top Right */}
      <View
        style={[
          styles.corner,
          styles.cornerTR,
          {
            width: cornerSize,
            height: cornerSize,
            borderTopWidth: cornerThickness,
            borderRightWidth: cornerThickness,
          },
        ]}
      />
      {/* Bottom Left */}
      <View
        style={[
          styles.corner,
          styles.cornerBL,
          {
            width: cornerSize,
            height: cornerSize,
            borderBottomWidth: cornerThickness,
            borderLeftWidth: cornerThickness,
          },
        ]}
      />
      {/* Bottom Right */}
      <View
        style={[
          styles.corner,
          styles.cornerBR,
          {
            width: cornerSize,
            height: cornerSize,
            borderBottomWidth: cornerThickness,
            borderRightWidth: cornerThickness,
          },
        ]}
      />

      {/* Ligne de scan animée */}
      <Animated.View
        style={[
          styles.scanLine,
          { width: size, transform: [{ translateY: scanLineY }] },
        ]}
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
  corner: {
    position: "absolute",
    borderColor: Colors.accent,
  },
  cornerTL: { top: 0, left: 0, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderBottomRightRadius: 4 },
  scanLine: {
    height: 2,
    backgroundColor: Colors.accent,
    opacity: 0.7,
    position: "absolute",
    top: 0,
    left: 0,
  },
});
