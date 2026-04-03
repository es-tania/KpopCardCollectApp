import { Theme } from "@/src/constants/theme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { PhotocardWithDetails } from "../../types";
import { PhotocardCard } from "../photocard/PhotocardCard";

interface PhotocardGridProps {
  cards: PhotocardWithDetails[];
  onPressFavorite: (id: string) => void;
  onPressWishlist: (id: string) => void;
  onPressCollection: (id: string) => void;
}

export const PhotocardGrid: React.FC<PhotocardGridProps> = ({
  cards,
  onPressFavorite,
  onPressWishlist,
  onPressCollection,
}) => (
  <View style={styles.grid}>
    {cards.map((card) => (
      <PhotocardCard
        key={card.id}
        card={card}
        onPressFavorite={() => onPressFavorite(card.id)}
        onPressWishlist={() => onPressWishlist(card.id)}
        onPressCollection={() => onPressCollection(card.id)}
      />
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
});
