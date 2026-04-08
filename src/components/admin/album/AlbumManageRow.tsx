import { Edit2, Trash2 } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ALBUM_TYPE_LABELS } from "../../../constants/albumTypeLabels";
import { Colors } from "../../../constants/colors";
import { Theme } from "../../../constants/theme";
import { Album } from "../../../types";

interface AlbumManageRowProps {
  album: Album;
  groupName?: string;
  onEdit: () => void;
  onDelete: () => void;
}

export const AlbumManageRow: React.FC<AlbumManageRowProps> = ({
  album,
  groupName,
  onEdit,
  onDelete,
}) => (
  <View style={styles.row}>
    {/* Cover */}
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

    {/* Infos */}
    <View style={styles.info}>
      <Text style={styles.title} numberOfLines={1}>
        {album.title}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        {groupName && `${groupName} · `}
        {ALBUM_TYPE_LABELS[album.type] ?? album.type}
      </Text>
      <Text style={styles.count}>
        {album.totalPhotocards} photocards
        {album.releaseDate
          ? ` · ${new Date(album.releaseDate).getFullYear()}`
          : ""}
      </Text>
    </View>

    {/* Actions */}
    <View style={styles.actions}>
      <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
        <Edit2 size={15} color={Colors.accent} strokeWidth={1.8} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
        <Trash2 size={15} color={Colors.danger} strokeWidth={1.8} />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  coverWrap: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Colors.surface2,
    borderWidth: 0.5,
    borderColor: Colors.border,
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
  meta: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  count: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  actions: {
    flexDirection: "row",
    gap: Theme.spacing.sm,
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Colors.pillActive,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: "rgba(240,112,112,0.1)",
    borderWidth: 0.5,
    borderColor: "rgba(240,112,112,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
});
