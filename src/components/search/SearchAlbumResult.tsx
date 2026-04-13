import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { Album } from "../../types";

interface SearchAlbumResultProps {
  album: Album;
  onPress: () => void;
}

export const SearchAlbumResult: React.FC<SearchAlbumResultProps> = ({
  album,
  onPress,
}) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
    <View style={styles.coverWrap}>
      {album.coverUrl ? (
        <Image
          source={album.coverUrl as any}
          style={styles.cover}
          resizeMode="cover"
        />
      ) : (
        <Text style={styles.coverEmoji}>📀</Text>
      )}
    </View>
    <View style={styles.info}>
      <Text style={styles.title}>{album.title}</Text>
      <Text style={styles.subtitle}>
        {album.groupName}
        {album.releaseDate
          ? ` · ${new Date(album.releaseDate).getFullYear()}`
          : ""}
      </Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm + 2,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  coverWrap: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Colors.surface2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cover: { width: "100%", height: "100%" },
  coverEmoji: { fontSize: 22 },
  info: { flex: 1, gap: 2 },
  title: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
  },
  subtitle: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
});
