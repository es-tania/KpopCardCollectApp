import { useCallback } from "react";

interface UsePhotocardActionsOptions {
  onAfterToggle?: (
    cardId: string,
    action: "favorite" | "wishlist" | "collection",
  ) => void;
}

export const usePhotocardActions = (options?: UsePhotocardActionsOptions) => {
  const handleToggleFavorite = useCallback(
    (cardId: string) => {
      // TODO: appel API favoritesApi.toggle(cardId)
      console.log("toggle favorite", cardId);
      options?.onAfterToggle?.(cardId, "favorite");
    },
    [options],
  );

  const handleToggleWishlist = useCallback(
    (cardId: string) => {
      // TODO: appel API wishlistApi.toggle(cardId)
      console.log("toggle wishlist", cardId);
      options?.onAfterToggle?.(cardId, "wishlist");
    },
    [options],
  );

  const handleToggleCollection = useCallback(
    (cardId: string) => {
      // TODO: appel API collectionApi.toggle(cardId)
      console.log("toggle collection", cardId);
      options?.onAfterToggle?.(cardId, "collection");
    },
    [options],
  );

  return {
    handleToggleFavorite,
    handleToggleWishlist,
    handleToggleCollection,
  };
};
