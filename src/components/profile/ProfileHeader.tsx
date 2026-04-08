import { Camera, Settings } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { User } from "../../types";

interface ProfileHeaderProps {
  user: User;
  onPressSettings: () => void;
  onPressAvatar: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onPressSettings,
  onPressAvatar,
}) => (
  <View style={styles.container}>
    {/* Avatar */}
    <TouchableOpacity style={styles.avatarWrap} onPress={onPressAvatar}>
      {user.avatarUrl ? (
        <Image
          source={user.avatarUrl as any}
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
        <Camera size={11} color={Colors.bg} strokeWidth={2} />
      </View>
    </TouchableOpacity>

    {/* Infos */}
    <View style={styles.info}>
      <View style={styles.nameRow}>
        <Text style={styles.username}>{user.username}</Text>
        {user.role === "admin" && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminText}>Admin</Text>
          </View>
        )}
      </View>
      <Text style={styles.email}>{user.email}</Text>
      <Text style={styles.since}>
        Membre depuis{" "}
        {new Date(user.createdAt).toLocaleDateString("fr-FR", {
          month: "long",
          year: "numeric",
        })}
      </Text>
    </View>

    {/* Paramètres */}
    <TouchableOpacity style={styles.settingsBtn} onPress={onPressSettings}>
      <Settings size={18} color={Colors.textMuted} strokeWidth={1.6} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
    padding: Theme.spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surface2,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.accent,
  },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.bg,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  username: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  adminBadge: {
    backgroundColor: "rgba(125,211,240,0.15)",
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  adminText: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
  email: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
  },
  since: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.surface2,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
});
