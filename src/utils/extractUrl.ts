import { ImageSourcePropType } from "react-native";
import { StorageBucket } from "../services/storageService";

/**
 * Extrait une URL string depuis différents formats :
 * - undefined      → undefined  (ne pas toucher la colonne en BDD)
 * - null           → null       (effacer la colonne en BDD)
 * - "https://..."  → string     (URL directe)
 * - { uri: "..." } → string     (ImageSourcePropType)
 */
export const extractUrl = (
  source: ImageSourcePropType | string | null | undefined,
): string | null | undefined => {
  if (source === undefined) return undefined;
  if (source === null) return null;
  if (typeof source === "string") return source || undefined;
  if (typeof source === "object" && "uri" in source && source.uri) {
    return source.uri as string;
  }
  return undefined;
};

export const extractPathFromUrl = (
  url: string,
  bucket: StorageBucket,
): string | null => {
  try {
    // Nettoie les paramètres de query string
    const cleanUrl = url.split("?")[0];

    // Essaie les deux formats (public et sign)
    const markers = [`/object/public/${bucket}/`, `/object/sign/${bucket}/`];

    for (const marker of markers) {
      const index = cleanUrl.indexOf(marker);
      if (index !== -1) {
        const path = cleanUrl.slice(index + marker.length);
        console.log(`Path extrait depuis "${marker}" :`, path);
        return path;
      }
    }

    console.warn("Marker non trouvé dans l'URL :", cleanUrl);
    return null;
  } catch (err) {
    console.error("Erreur extraction path :", err);
    return null;
  }
};
