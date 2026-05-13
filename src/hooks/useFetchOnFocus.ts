import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";

/**
 * Recharge les données à chaque fois que la page devient active.
 * À utiliser dans les hooks de fetch.
 */
export const useFetchOnFocus = (fetch: () => void, cooldownMs = 30_000) => {
  const lastFetch = useRef(0);

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      if (now - lastFetch.current < cooldownMs) return;
      lastFetch.current = now;
      fetch();
    }, [fetch]),
  );
};
