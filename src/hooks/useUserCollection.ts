import { useAuthStore } from "@/src/store/authStore";
import { useCollectionStore } from "@/src/store/collectionStore";
import { useEffect } from "react";

export const useUserCollection = () => {
  const { user } = useAuthStore();
  const store = useCollectionStore();

  // Init automatique au premier appel
  useEffect(() => {
    if (user && !store.initialized) {
      store.init(user.id);
    }
  }, [user, store.initialized]);

  return {
    collectionIds: store.collectionIds,
    favoriteIds: store.favoriteIds,
    wishlistIds: store.wishlistIds,
    loading: store.loading,
    refetch: () => (user ? store.init(user.id) : Promise.resolve()),
    toggleCollection: (photocardId: string) =>
      user ? store.toggleCollection(user.id, photocardId) : Promise.resolve(),
    toggleFavorite: (photocardId: string) =>
      user ? store.toggleFavorite(user.id, photocardId) : Promise.resolve(),
    toggleWishlist: (photocardId: string) =>
      user ? store.toggleWishlist(user.id, photocardId) : Promise.resolve(),
  };
};
