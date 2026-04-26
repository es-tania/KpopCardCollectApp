import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

interface PickLocalImageOptions {
  aspect?: [number, number];
  quality?: number;
  allowsEditing?: boolean;
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

  const allowsEditing = options?.allowsEditing ?? true;
  const aspect = options?.aspect;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing,
    ...(aspect !== undefined ? { aspect } : {}),
    quality: options?.quality ?? 0.85,
  });

  if (!result.canceled) {
    onPicked(result.assets[0].uri);
  }
};
