import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { Member } from "../../types";

interface MemberAvatarProps {
  member: Member;
  selected?: boolean;
  size?: number;
}

export const MemberAvatar: React.FC<MemberAvatarProps> = ({
  member,
  selected = false,
  size = 54,
}) => (
  <View
    style={[
      styles.circle,
      selected && styles.circleSelected,
      { width: size, height: size, borderRadius: size / 2 },
    ]}
  >
    {member.photoUrl ? (
      <Image
        source={member.photoUrl as any}
        style={styles.image}
        resizeMode="cover"
      />
    ) : (
      <Text style={[styles.initial, { fontSize: size * 0.35 }]}>
        {member.stageName[0].toUpperCase()}
      </Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  circle: {
    backgroundColor: Colors.surface2,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  circleSelected: {
    borderColor: Colors.accent,
    borderWidth: 2,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  initial: {
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.accent,
  },
});
