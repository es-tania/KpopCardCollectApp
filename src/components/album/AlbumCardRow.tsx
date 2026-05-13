import React from "react";
import { StyleSheet, View } from "react-native";
import { PhotocardWithDetails } from "../../types";
import { PhotocardMini } from "../photocard";

const NUM_COLUMNS = 3;

interface AlbumCardRowProps {
  row: PhotocardWithDetails[];
  onPressCard?: (card: PhotocardWithDetails) => void;
}

export const AlbumCardRow = React.memo(
  ({ row, onPressCard }: AlbumCardRowProps) => (
    <View style={styles.row}>
      {row.map((card) => (
        <View key={card.id} style={styles.cardWrap}>
          <PhotocardMini card={card} onPress={() => onPressCard?.(card)} />
        </View>
      ))}
      {row.length < NUM_COLUMNS &&
        Array(NUM_COLUMNS - row.length)
          .fill(null)
          .map((_, i) => <View key={`empty-${i}`} style={styles.cardWrap} />)}
    </View>
  ),
);

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  cardWrap: { flex: 1 },
});
