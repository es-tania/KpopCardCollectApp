import { ALBUM_TYPE_LABELS } from "@/src/constants/options";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { Album } from "../../types";
import { ProgressBar } from "../ui/ProgressBar";

interface AlbumGridProps {
  albums: Album[];
  onPressAlbum: (album: Album) => void;
}

const AlbumCard: React.FC<{
  album: Album;
  onPress: () => void;
}> = ({ album, onPress }) => {
  const typeLabel = ALBUM_TYPE_LABELS[album.type] ?? album.type;
  const isComplete = album.isComplete;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Cover */}
      <View style={styles.coverContainer}>
        {album.coverUrl ? (
          <Image
            source={album.coverUrl}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.coverFallback}>
            <Text style={styles.coverEmoji}>📀</Text>
          </View>
        )}
        {/* Badges superposés */}
        {isComplete && (
          <View style={styles.completeBadge}>
            <Text style={styles.completeText}>✓</Text>
          </View>
        )}
      </View>

      {/* Infos */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {album.title}
        </Text>
        <Text style={styles.meta}>
          {typeLabel}
          {album.releaseDate
            ? ` · ${new Date(album.releaseDate).getFullYear()}`
            : ""}
        </Text>

        <ProgressBar
          label=""
          current={album.ownedPhotocards ?? 0}
          total={album.totalPhotocards}
        />
      </View>
    </TouchableOpacity>
  );
};

export const AlbumGrid: React.FC<AlbumGridProps> = ({
  albums,
  onPressAlbum,
}) => (
  <View style={styles.grid}>
    {albums.map((album) => (
      <View key={album.id} style={styles.gridItem}>
        <AlbumCard album={album} onPress={() => onPressAlbum(album)} />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: Theme.spacing.lg,
  },
  gridItem: {
    width: "47.5%",
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  coverContainer: {
    height: 110,
    backgroundColor: Colors.surface2,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  coverEmoji: {
    fontSize: 32,
  },
  coverBadges: {
    position: "absolute",
    top: 6,
    left: 6,
    flexDirection: "row",
    gap: 4,
  },
  pobBadge: {
    backgroundColor: "rgba(125,211,240,0.85)",
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pobText: {
    fontSize: Theme.fontSize.xs,
    color: Colors.bg,
    fontWeight: Theme.fontWeight.semibold,
  },
  limitedBadge: {
    backgroundColor: "rgba(250,199,117,0.85)",
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  limitedText: {
    fontSize: Theme.fontSize.xs,
    color: Colors.bg,
    fontWeight: Theme.fontWeight.semibold,
  },
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
  info: {
    padding: 8,
    gap: 2,
  },
  title: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
  },
  meta: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textMuted,
  },
  eventName: {
    fontSize: Theme.fontSize.sm,
    color: Colors.accent,
  },
});
