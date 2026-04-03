import { useCallback, useRef } from "react";
import { ScrollView } from "react-native";

export const useScrollToTop = () => {
  const scrollRef = useRef<ScrollView>(null);

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  return { scrollRef, scrollToTop };
};
