import * as ImageManipulator from "expo-image-manipulator";

interface OptimizeOptions {
  uri: string;
  maxWidth?: number;
  quality?: number;
}

export async function optimizeImage({
  uri,
  maxWidth = 1000,
  quality = 0.8,
}: OptimizeOptions): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxWidth } }],
    {
      compress: quality,
      format: ImageManipulator.SaveFormat.WEBP,
    },
  );
  return result.uri;
}
