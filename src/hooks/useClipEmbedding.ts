import * as FileSystem from "expo-file-system/legacy";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { useCallback } from "react";
import { supabase } from "../lib/supabase";

async function getToken(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return (
    session?.access_token ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ""
  );
}

async function callGenerateEmbedding(imageBase64: string): Promise<number[]> {
  const token = await getToken();
  const res = await fetch(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/generate-embedding`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ imageBase64 }),
    },
  );
  const text = await res.text();
  const data = JSON.parse(text);
  if (data.error) throw new Error(data.error);
  return data.embedding;
}

export function useClipEmbedding() {
  const uriToBase64 = useCallback(async (uri: string): Promise<string> => {
    return await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }, []);

  const prepareImageFromUrl = useCallback(
    async (url: string, cardId: string): Promise<string> => {
      const localUri = `${FileSystem.cacheDirectory}emb_${cardId}.jpg`;
      const downloadResult = await FileSystem.downloadAsync(url, localUri);
      if (downloadResult.status !== 200)
        throw new Error(`Download failed: ${downloadResult.status}`);

      const context = ImageManipulator.manipulate(downloadResult.uri);
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

  // const generateForScan = useCallback(
  //   async (uri: string): Promise<number[]> => {
  //     const context = ImageManipulator.manipulate(uri);
  //     const imageRef = await context.renderAsync();
  //     const converted = await imageRef.saveAsync({
  //       format: SaveFormat.JPEG,
  //       compress: 1.0,
  //     });
  //     const base64 = await uriToBase64(converted.uri);
  //     return callGenerateEmbedding(base64);
  //   },
  //   [uriToBase64],
  // );

  const generateForScan = useCallback(
    async (uri: string): Promise<number[]> => {
      // Envoie l'image brute sans preprocessing
      const base64 = await uriToBase64(uri);
      return callGenerateEmbedding(base64);
    },
    [uriToBase64],
  );

  const generateAndSave = useCallback(
    async (cardId: string, imageUrl: string): Promise<void> => {
      const localUri = `${FileSystem.cacheDirectory}emb_${cardId}.jpg`;
      const downloadResult = await FileSystem.downloadAsync(imageUrl, localUri);
      if (downloadResult.status !== 200)
        throw new Error(`Download failed: ${downloadResult.status}`);

      const base64 = await uriToBase64(localUri);
      await FileSystem.deleteAsync(localUri, { idempotent: true });

      const embedding = await callGenerateEmbedding(base64);

      const { error } = await supabase
        .from("photocards")
        .update({ embedding })
        .eq("id", cardId);

      if (error) throw error;
    },
    [uriToBase64],
  );

  return {
    isReady: true,
    downloadProgress: null,
    generateForScan,
    generateAndSave,
    uriToBase64,
  };
}
