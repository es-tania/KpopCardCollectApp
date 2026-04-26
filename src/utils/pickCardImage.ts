// src/utils/pickCardImage.ts
import { CardFormat } from "@/src/constants/options/cardFormatOptions";
import { Image } from "react-native";
import { pickLocalImage } from "./pickLocalImage";

interface PickCardImageOptions {
  aspectRatio: CardFormat;
  currentRatio: number;
  onPicked: (
    uri: string,
    dimensions?: { width: number; height: number },
  ) => void;
}

export const pickCardImage = async ({
  aspectRatio,
  currentRatio,
  onPicked,
}: PickCardImageOptions): Promise<void> => {
  await pickLocalImage(
    async (uri) => {
      if (aspectRatio === "custom") {
        const dimensions = await new Promise<{ width: number; height: number }>(
          (resolve) =>
            Image.getSize(uri, (w, h) => resolve({ width: w, height: h })),
        );
        onPicked(uri, dimensions);
      } else {
        onPicked(uri);
      }
    },
    {
      allowsEditing: true,
      // ← pour custom : pas d'aspect du tout, peu importe currentRatio
      aspect:
        aspectRatio === "custom"
          ? undefined
          : [Math.round(currentRatio * 100), 100],
    },
  );
};
