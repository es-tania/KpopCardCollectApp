import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface ProfileSectionTitleProps {
  title: string;
}

export const ProfileSectionTitle: React.FC<ProfileSectionTitleProps> = ({
  title,
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title.toUpperCase()}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.sm,
  },
  title: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
    fontWeight: Theme.fontWeight.medium,
    letterSpacing: 0.8,
  },
});
