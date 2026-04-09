import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface AuthFooterProps {
  text: string;
  linkLabel: string;
  onPress: () => void;
}

export const AuthFooter: React.FC<AuthFooterProps> = ({
  text,
  linkLabel,
  onPress,
}) => (
  <View style={styles.container}>
    <Text style={styles.text}>{text}</Text>
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.link}>{linkLabel}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  text: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
  },
  link: {
    fontSize: Theme.fontSize.base,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
});
