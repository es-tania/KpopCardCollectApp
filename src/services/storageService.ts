import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";
import { extractPathFromUrl } from "../utils/extractUrl";

export type StorageBucket =
  | "photocards"
  | "album-covers"
  | "group-logos"
  | "group-banners"
  | "member-photos"
  | "avatars";

// ─── Helpers de nommage ───────────────────────────────────────────────────────

// Normalise un nom pour en faire un slug de dossier
// "P1Harmony" → "p1harmony", "Stray Kids" → "stray-kids"
const slugify = (name: string): string => {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");

  // Ne retourne jamais une chaîne vide
  return slug || "unknown";
};

// ─── Builders de path par type ────────────────────────────────────────────────

export const buildStoragePath = {
  // group-logos/p1harmony/logo_1234567890.jpg
  groupLogo: (groupName: string): string => {
    const folder = slugify(groupName);
    return `${folder}/logo_${Date.now()}.jpg`;
  },

  // group-banners/p1harmony/banner_1234567890.jpg
  groupBanner: (groupName: string): string => {
    const folder = slugify(groupName);
    return `${folder}/banner_${Date.now()}.jpg`;
  },

  // member-photos/p1harmony/keeho_1234567890.jpg
  memberPhoto: (groupName: string, stageName: string): string => {
    const groupFolder = slugify(groupName);
    const memberFolder = slugify(stageName);
    return `${groupFolder}/${memberFolder}_${Date.now()}.jpg`;
  },

  // album-covers/p1harmony/unique_1234567890.jpg
  albumCover: (groupName: string, albumTitle: string): string => {
    const groupFolder = slugify(groupName);
    const albumSlug = slugify(albumTitle);
    return `${groupFolder}/${albumSlug}_${Date.now()}.jpg`;
  },

  // photocards/p1harmony/keeho/albums/unique/unique_a_1234567890.jpg
  photocard: (
    groupName: string,
    memberName: string,
    albumTitle: string,
    version?: string,
  ): string => {
    const groupFolder = slugify(groupName);
    const memberFolder = slugify(memberName);
    const albumFolder = slugify(albumTitle);
    const versionSlug = version ? `${slugify(version)}_` : "";
    return `${groupFolder}/${memberFolder}/albums/${albumFolder}/${versionSlug}${Date.now()}.jpg`;
  },

  // avatars/user-id/avatar_1234567890.jpg
  avatar: (userId: string): string => `${userId}/avatar_${Date.now()}.jpg`,
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const storageService = {
  // ── Upload depuis une URI locale (file://) ────────────────────────────

  uploadImage: async (
    bucket: StorageBucket,
    path: string,
    uri: string,
  ): Promise<string> => {
    // Détermine l'extension
    const ext = uri.split(".").pop()?.toLowerCase() ?? "jpg";
    const contentType = ext === "png" ? "image/png" : "image/jpeg";

    // FormData fonctionne avec les URIs locales React Native
    const formData = new FormData();
    formData.append("file", {
      uri,
      name: path.split("/").pop() ?? "image.jpg",
      type: contentType,
    } as any);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, formData, {
        contentType,
        upsert: true,
      });

    if (error)
      throw new Error(`Upload échoué (${bucket}/${path}) : ${error.message}`);

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  },

  // ── Ouvre la galerie et upload directement ────────────────────────────

  pickAndUpload: async (
    bucket: StorageBucket,
    path: string,
    options?: {
      aspectRatio?: [number, number];
      quality?: number;
    },
  ): Promise<string | null> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      throw new Error("Permission galerie refusée");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: options?.aspectRatio,
      quality: options?.quality ?? 0.85,
    });

    if (result.canceled) return null;

    const asset = result.assets[0];

    // Taille max 8 Mo
    const MAX_BYTES = 8 * 1024 * 1024;
    if (asset.fileSize && asset.fileSize > MAX_BYTES) {
      throw new Error("L'image dépasse la limite de 8 Mo");
    }

    // Extensions autorisées
    const ext = asset.uri.split(".").pop()?.toLowerCase();
    if (ext && !["jpg", "jpeg", "png", "webp"].includes(ext)) {
      throw new Error("Format non supporté. Utilisez JPG, PNG ou WebP");
    }

    return storageService.uploadImage(bucket, path, asset.uri);
  },

  // ── Supprime un fichier ───────────────────────────────────────────────

  deleteImage: async (bucket: StorageBucket, path: string): Promise<void> => {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw new Error(`Suppression échouée : ${error.message}`);
  },

  // ── Supprime depuis une URL publique ──────────────────────────────────
  deleteFromUrl: async (bucket: StorageBucket, url: string): Promise<void> => {
    console.log(`🗑️ deleteFromUrl — bucket: ${bucket}`);
    console.log(`🔗 URL: ${url}`);

    const path = extractPathFromUrl(url, bucket);
    console.log(`📂 Path extrait: ${path}`);

    if (!path) {
      console.warn(`⚠️ Path non extrait depuis : ${url}`);
      return;
    }

    const { data, error } = await supabase.storage.from(bucket).remove([path]);
    console.log(`✅ Résultat:`, data, error);
  },

  // ── URL publique depuis un path ───────────────────────────────────────

  getPublicUrl: (bucket: StorageBucket, path: string): string => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },
};
