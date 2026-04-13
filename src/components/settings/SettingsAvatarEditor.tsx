import { Camera } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { User } from "../../types";

interface SettingsAvatarEditorProps {
  user: User;
  onPressAvatar: () => void;
}

export const SettingsAvatarEditor: React.FC<SettingsAvatarEditorProps> = ({
  user,
  onPressAvatar,
}) => (
  <View style={styles.container}>
    <TouchableOpacity
      style={styles.avatarWrap}
      onPress={onPressAvatar}
      activeOpacity={0.8}
    >
      {user.avatarUrl ? (
        <Image
          source={{ uri: user.avatarUrl }}
          style={styles.avatar}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarInitial}>
            {user.username[0].toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.cameraBtn}>
        <Camera size={13} color={Colors.bg} strokeWidth={2} />
      </View>
    </TouchableOpacity>
    <Text style={styles.username}>{user.username}</Text>
    <Text style={styles.email}>{user.email}</Text>
    <TouchableOpacity onPress={onPressAvatar}>
      <Text style={styles.changePhoto}>Changer la photo</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: Theme.spacing.xl,
    gap: 6,
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  avatarWrap: {
    position: "relative",
    marginBottom: Theme.spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface2,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.accent,
  },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.bg,
  },
  username: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  email: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
  },
  changePhoto: {
    fontSize: Theme.fontSize.base,
    color: Colors.accent,
    marginTop: Theme.spacing.xs,
  },
});
