import React from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
} from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  ...props
}) => (
  <View style={styles.container}>
    <Text style={styles.label}>
      {label}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
    <TextInput
      style={[styles.input, error ? styles.inputError : {}]}
      placeholderTextColor={Colors.textMuted}
      {...props}
    />
    {error && <Text style={styles.error}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: Theme.fontSize.base,
    color: Colors.text,
    fontWeight: Theme.fontWeight.medium,
  },
  required: {
    color: Colors.danger,
  },
  input: {
    backgroundColor: Colors.surface2,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm + 2,
    fontSize: Theme.fontSize.base,
    color: Colors.text,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  error: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.danger,
  },
});
