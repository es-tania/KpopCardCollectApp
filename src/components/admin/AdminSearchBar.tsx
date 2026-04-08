import { Search, X } from "lucide-react-native";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface AdminSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const AdminSearchBar: React.FC<AdminSearchBarProps> = ({
  value,
  onChangeText,
  placeholder = "Rechercher...",
}) => (
  <View style={styles.container}>
    <Search size={15} color={Colors.textMuted} strokeWidth={1.6} />
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.textMuted}
      autoCorrect={false}
      autoCapitalize="none"
    />
    {value.length > 0 && (
      <TouchableOpacity onPress={() => onChangeText("")}>
        <X size={14} color={Colors.textMuted} strokeWidth={1.8} />
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surface2,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm + 2,
  },
  input: {
    flex: 1,
    fontSize: Theme.fontSize.base,
    color: Colors.text,
    padding: 0,
  },
});
