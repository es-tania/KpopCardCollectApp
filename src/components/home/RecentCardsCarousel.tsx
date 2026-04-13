import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { PhotocardWithDetails } from "../../types";
import { PhotocardCard } from "../photocard/PhotocardCard";
import { PhotocardModal } from "../photocard/PhotocardModal";

interface RecentCardsCarouselProps {
  cards: PhotocardWithDetails[];
  onPressFavorite?: (id: string) => void;
  onPressWishlist?: (id: string) => void;
  onPressCollection?: (id: string) => void;
}

export const RecentCardsCarousel: React.FC<RecentCardsCarouselProps> = ({
  cards,
  onPressFavorite,
  onPressWishlist,
  onPressCollection,
}) => {
  const [selectedCard, setSelectedCard] = useState<PhotocardWithDetails | null>(
    null,
  );
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {cards.map((card) => (
        <PhotocardCard
          key={card.id}
          card={card}
          onPressFavorite={() => onPressFavorite?.(card.id)}
          onPressWishlist={() => onPressWishlist?.(card.id)}
          onPressCollection={() => onPressCollection?.(card.id)}
          onPress={() => setSelectedCard(card)}
        />
      ))}
      <PhotocardModal
        card={selectedCard}
        visible={selectedCard !== null}
        onClose={() => setSelectedCard(null)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 10,
    paddingBottom: 4,
  },
});
