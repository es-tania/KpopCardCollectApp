import { CardCollectionScreen } from "@/src/components/photocard/CardCollectionScreen";
import { CardMode } from "@/src/types";
import { useLocalSearchParams } from "expo-router";
import React from "react";

export default function MyCardsScreen() {
  const { mode: rawMode } = useLocalSearchParams<{ mode?: string }>();
  const mode: CardMode =
    rawMode === "favorites" || rawMode === "wishlist" ? rawMode : "collection";

  return <CardCollectionScreen mode={mode} />;
}
