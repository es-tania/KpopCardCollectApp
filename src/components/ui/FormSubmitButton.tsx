import React from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
} from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface FormSubmitButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const FormSubmitButton: React.FC<FormSubmitButtonProps> = ({
  label,
  onPress,
  loading,
  disabled,
}) => (
  <TouchableOpacity
    style={[styles.btn, (disabled || loading) && styles.btnDisabled]}
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.8}
  >
    {loading ? (
      <ActivityIndicator size="small" color={Colors.bg} />
    ) : (
      <Text style={styles.label}>{label}</Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  btn: {
    backgroundColor: Colors.accent,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.bg,
  },
});
