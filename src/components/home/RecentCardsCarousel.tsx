import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { PhotocardWithDetails } from "../../types";
import { PhotocardCard } from "../photocard/PhotocardCard";

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
}) => (
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
      />
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  content: {
    gap: 10,
    paddingBottom: 4,
  },
});
