// src/utils/pickCardImage.ts
import { CardFormat } from "@/src/constants/options/cardFormatOptions";
import { Image } from "react-native";
import { optimizeImage } from "./optimizeImage";
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
      const optimizedUri = await optimizeImage({ uri });

      if (aspectRatio === "custom") {
        const dimensions = await new Promise<{ width: number; height: number }>(
          (resolve) =>
            Image.getSize(optimizedUri, (w, h) =>
              resolve({ width: w, height: h }),
            ),
        );
        onPicked(optimizedUri, dimensions);
      } else {
        onPicked(optimizedUri);
      }
    },
    {
      allowsEditing: true,
      aspect:
        aspectRatio === "custom"
          ? undefined
          : [Math.round(currentRatio * 100), 100],
    },
  );
};
