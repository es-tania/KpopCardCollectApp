import { Colors } from "@/src/constants/colors";
import { Theme } from "@/src/constants/theme";
import { useUserStats } from "@/src/hooks/useUserStats";
import { Album } from "@/src/types";
import React, { useMemo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ProgressBar } from "../ui/ProgressBar";

export const AlbumCard = React.memo(
  ({
    album,
    onPress,
    memberId,
  }: {
    album: Album;
    onPress: () => void;
    memberId?: string;
  }) => {
    const stats = useUserStats({
      albumId: album.id,
      memberId,
    });

    const imageSource = useMemo(() => {
      if (!album.coverUrl) return null;
      if (typeof album.coverUrl === "string") return { uri: album.coverUrl };
      return album.coverUrl;
    }, [album.coverUrl]);

    return (
      <TouchableOpacity
        style={styles.albumCard}
        onPress={onPress}
        activeOpacity={0.75}
      >
        <View style={styles.albumCover}>
          {imageSource ? (
            <Image
              source={imageSource}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
              fadeDuration={0}
            />
          ) : (
            <Text style={styles.albumEmoji}>📀</Text>
          )}
          {album.isComplete && (
            <View style={styles.completeBadge}>
              <Text style={styles.completeText}>✓</Text>
            </View>
          )}
        </View>
        <View style={styles.albumInfo}>
          <Text style={styles.albumTitle} numberOfLines={1}>
            {album.title}
          </Text>
          <Text style={styles.albumMeta}>
            {album.releaseDate ? new Date(album.releaseDate).getFullYear() : ""}
          </Text>
          <ProgressBar
            label=""
            current={stats.ownedPhotocards ?? 0}
            total={album.totalPhotocards}
          />
        </View>
      </TouchableOpacity>
    );
  },
);

const styles = StyleSheet.create({
  albumCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  albumCover: {
    height: 110,
    backgroundColor: Colors.surface2,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  albumEmoji: { fontSize: 32 },
  completeBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: Colors.accent,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  completeText: {
    fontSize: Theme.fontSize.xs,
    color: Colors.bg,
    fontWeight: Theme.fontWeight.bold,
  },
  albumInfo: { padding: 8, gap: 2 },
  albumTitle: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
  },
  albumMeta: { fontSize: Theme.fontSize.sm, color: Colors.textMuted },
});
