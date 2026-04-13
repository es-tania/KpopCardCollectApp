import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

interface PickLocalImageOptions {
  aspect?: [number, number];
  quality?: number;
}

export const pickLocalImage = async (
  onPicked: (uri: string) => void,
  options?: PickLocalImageOptions,
): Promise<void> => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert(
      "Permission refusée",
      "L'accès à la galerie est nécessaire pour sélectionner une image.",
    );
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: options?.aspect ?? [2, 3],
    quality: options?.quality ?? 0.85,
  });

  if (!result.canceled) {
    onPicked(result.assets[0].uri);
  }
};
