import { Theme } from "@/src/constants/theme";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { PhotocardWithDetails } from "../../types";
import { PhotocardCard } from "./PhotocardCard";
import { PhotocardModal } from "./PhotocardModal";

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
}) => {
  const [selectedCard, setSelectedCard] = useState<PhotocardWithDetails | null>(
    null,
  );
  return (
    <View style={styles.grid}>
      {cards.map((card) => (
        <PhotocardCard
          key={card.id}
          card={card}
          onPressFavorite={() => onPressFavorite(card.id)}
          onPressWishlist={() => onPressWishlist(card.id)}
          onPressCollection={() => onPressCollection(card.id)}
          onPress={() => setSelectedCard(card)}
        />
      ))}
      <PhotocardModal
        card={selectedCard}
        visible={selectedCard !== null}
        onClose={() => setSelectedCard(null)}
        onPressFavorite={() => console.log("toggle fav", selectedCard?.id)}
        onPressWishlist={() => console.log("toggle wish", selectedCard?.id)}
        onPressCollection={() => console.log("toggle coll", selectedCard?.id)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: Theme.spacing.lg,
  },
});
