import { Colors } from "@/src/constants/colors";
import { Theme } from "@/src/constants/theme";
import { PhotocardWithDetails } from "@/src/types";
import { Edit2, Eye, Trash2 } from "lucide-react-native";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PhotocardManageRowProps {
  card: PhotocardWithDetails;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const PhotocardManageRow: React.FC<PhotocardManageRowProps> = ({
  card,
  onPreview,
  onEdit,
  onDelete,
}) => (
  <TouchableOpacity style={rowStyles.row} onPress={onEdit} activeOpacity={0.75}>
    <View style={rowStyles.imageWrap}>
      {card.imageUrl ? (
        <Image
          source={card.imageUrl as any}
          style={rowStyles.image}
          resizeMode="cover"
        />
      ) : (
        <Text style={rowStyles.imageFallback}>🧑‍🎤</Text>
      )}
    </View>
    <View style={rowStyles.info}>
      <Text style={rowStyles.memberName} numberOfLines={1}>
        {card.memberName}
      </Text>
      <Text style={rowStyles.meta} numberOfLines={1}>
        {card.groupName} · {card.albumTitle}
      </Text>
      <Text style={rowStyles.type}>
        {card.type.toUpperCase().replace("_", " ")}
        {card.version ? ` · ${card.version}` : ""}
      </Text>
    </View>
    <View style={rowStyles.editBadge}>
      <TouchableOpacity style={rowStyles.editBtn} onPress={onEdit}>
        <Edit2 size={14} color={Colors.accent} strokeWidth={1.8} />
      </TouchableOpacity>
      <TouchableOpacity style={rowStyles.editBtn} onPress={onPreview}>
        <Eye size={14} color={Colors.accent} strokeWidth={1.8} />
      </TouchableOpacity>
      <TouchableOpacity style={rowStyles.deleteBtn} onPress={onDelete}>
        <Trash2 size={14} color={Colors.danger} strokeWidth={1.8} />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const rowStyles = StyleSheet.create({
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
  imageWrap: {
    width: 44,
    height: 64,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Colors.surface2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  image: { width: "100%", height: "100%" },
  imageFallback: { fontSize: 20 },
  info: { flex: 1, gap: 3 },
  memberName: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
  },
  meta: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  type: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.accent,
  },
  editBadge: {
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
