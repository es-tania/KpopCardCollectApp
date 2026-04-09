import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface SocialButtonProps {
  provider: "google" | "apple";
  onPress: () => void;
  loading?: boolean;
}

const PROVIDER_CONFIG = {
  google: {
    label: "Continuer avec Google",
    icon: "G",
    iconColor: "#EA4335",
    iconBg: "#fff",
  },
  apple: {
    label: "Continuer avec Apple",
    icon: "",
    iconColor: Colors.text,
    iconBg: Colors.surface2,
  },
};

export const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  onPress,
  loading,
}) => {
  const config = PROVIDER_CONFIG[provider];

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={loading}
    >
      <View style={[styles.iconWrap, { backgroundColor: config.iconBg }]}>
        <Text style={[styles.icon, { color: config.iconColor }]}>
          {config.icon}
        </Text>
      </View>
      <Text style={styles.label}>{config.label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: Theme.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 16,
    fontWeight: Theme.fontWeight.bold,
  },
  label: {
    flex: 1,
    fontSize: Theme.fontSize.base,
    color: Colors.text,
    fontWeight: Theme.fontWeight.medium,
    textAlign: "center",
  },
});
