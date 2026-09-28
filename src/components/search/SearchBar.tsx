import { Search, X } from "lucide-react-native";
import React, { forwardRef } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export const SearchBar = forwardRef<TextInput, SearchBarProps>(
  (
    {
      value,
      onChangeText,
      onClear,
      placeholder = "Groupe, membre, album, photocard...",
    },
    ref,
  ) => (
    <View style={styles.container}>
      <Search size={16} color={Colors.textMuted} strokeWidth={1.6} />
      <TextInput
        ref={ref}
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={onClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <X size={16} color={Colors.textMuted} strokeWidth={1.8} />
        </TouchableOpacity>
      )}
    </View>
  ),
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.sm,
    marginVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm + 2,
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontSize: Theme.fontSize.base,
    color: Colors.text,
    padding: 0,
  },
});
