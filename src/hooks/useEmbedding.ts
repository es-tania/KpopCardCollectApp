// src/hooks/useEmbedding.ts
import * as FileSystem from "expo-file-system/legacy";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { useCallback } from "react";
import {
  CLIP_VIT_BASE_PATCH32_IMAGE,
  useImageEmbeddings,
} from "react-native-executorch";
import { supabase } from "../lib/supabase";

export function useEmbedding() {
  const clipModel = useImageEmbeddings({
    model: CLIP_VIT_BASE_PATCH32_IMAGE,
  });

  // Génère un embedding depuis un URI local
  const generateFromUri = useCallback(
    async (uri: string): Promise<number[]> => {
      const embedding: Float32Array = await clipModel.forward(uri);
      return Array.from(embedding);
    },
    [clipModel],
  );

  // Prépare une image (resize 224x224 + JPEG) depuis une URL distante
  const prepareImageFromUrl = useCallback(
    async (url: string, cardId: string): Promise<string> => {
      const localUri = `${FileSystem.cacheDirectory}emb_${cardId}.jpg`;
      const downloadResult = await FileSystem.downloadAsync(url, localUri);
      if (downloadResult.status !== 200)
        throw new Error(`Download failed: ${downloadResult.status}`);

      // Détecte la taille pour crop carré centré
      const info = await ImageManipulator.manipulate(
        downloadResult.uri,
      ).renderAsync();
      const { width, height } = info;
      const size = Math.min(width, height);
      const originX = (width - size) / 2;
      const originY = (height - size) / 2;

      const context = ImageManipulator.manipulate(downloadResult.uri);
      context.crop({ originX, originY, width: size, height: size });
      context.resize({ width: 224, height: 224 });

      const imageRef = await context.renderAsync();
      const converted = await imageRef.saveAsync({
        format: SaveFormat.JPEG,
        compress: 1.0,
      });

      await FileSystem.deleteAsync(localUri, { idempotent: true });
      return converted.uri;
    },
    [],
  );

  // Génère + sauvegarde l'embedding d'une carte en BDD
  const generateAndSave = useCallback(
    async (cardId: string, imageUrl: string): Promise<void> => {
      // Vérifie si l'embedding existe déjà
      const { data } = await supabase
        .from("photocards")
        .select("embedding")
        .eq("id", cardId)
        .single();

      if (data?.embedding !== null) return;

      const preparedUri = await prepareImageFromUrl(imageUrl, cardId);
      const embedding = await generateFromUri(preparedUri);
      await FileSystem.deleteAsync(preparedUri, { idempotent: true });

      const { error } = await supabase
        .from("photocards")
        .update({ embedding })
        .eq("id", cardId);

      if (error) throw error;
    },
    [generateFromUri, prepareImageFromUrl],
  );
  // Génère un embedding depuis un URI pour le scan
  const generateForScan = useCallback(
    async (uri: string): Promise<number[]> => {
      // Détecte la taille de l'image pour faire un crop carré centré
      const info = await ImageManipulator.manipulate(uri).renderAsync();
      const { width, height } = info;
      const size = Math.min(width, height);
      const originX = (width - size) / 2;
      const originY = (height - size) / 2;

      const context = ImageManipulator.manipulate(uri);
      // 1. Crop carré centré
      context.crop({ originX, originY, width: size, height: size });
      // 2. Resize 224x224
      context.resize({ width: 224, height: 224 });

      const imageRef = await context.renderAsync();
      const converted = await imageRef.saveAsync({
        format: SaveFormat.JPEG,
        compress: 1.0, // qualité max
      });

      const embedding: Float32Array = await clipModel.forward(converted.uri);
      return Array.from(embedding);
    },
    [clipModel],
  );

  return {
    isReady: clipModel.isReady,
    downloadProgress: clipModel.downloadProgress,
    generateFromUri,
    generateForScan,
    generateAndSave,
    prepareImageFromUrl,
  };
}
