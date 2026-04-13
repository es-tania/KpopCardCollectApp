import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

/**
 * Recharge les données à chaque fois que la page devient active.
 * À utiliser dans les hooks de fetch.
 */
export const useFetchOnFocus = (fetch: () => void) => {
  useFocusEffect(
    useCallback(() => {
      fetch();
    }, [fetch]),
  );
};
