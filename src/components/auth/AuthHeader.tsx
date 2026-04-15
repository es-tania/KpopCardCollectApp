import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => (
  <View style={styles.container}>
    {/* Logo app */}
    {/* <View style={styles.logoWrap}>
      <Text style={styles.logoText}>KV</Text>
    </View> */}
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Theme.spacing.sm,
    paddingBottom: Theme.spacing.xl,
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: Theme.borderRadius.xl,
    backgroundColor: Colors.pillActive,
    borderWidth: 1.5,
    borderColor: Colors.borderActive,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Theme.spacing.sm,
  },
  logoText: {
    fontSize: 28,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.accent,
    letterSpacing: 1,
  },
  title: {
    fontSize: Theme.fontSize.title,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
});
