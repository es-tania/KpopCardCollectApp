import { photocardsService } from "@/src/services/photocardsService";
import {
  buildStoragePath,
  storageService,
} from "@/src/services/storageService";
import { PhotocardEditFormState, PhotocardWithDetails } from "@/src/types";
import { extractUrl } from "@/src/utils/extractUrl";
import { useState } from "react";
import { deleteBackImage } from "./useDeletePhotocards";

interface UseEditPhotocardResult {
  loading: boolean;
  progress: string | null;
  error: string | null;
  submit: (
    photocardId: string,
    form: PhotocardEditFormState,
    currentPhotocard: PhotocardWithDetails,
  ) => Promise<void>;
}

export const useEditPhotocard = (
  onSuccess: () => void,
): UseEditPhotocardResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  const submit = async (
    photocardId: string,
    form: PhotocardEditFormState,
    currentPhotocard: PhotocardWithDetails,
  ) => {
    setLoading(true);
    setError(null);

    try {
      // ── 1. Image recto ───────────────────────────────────────────────
      let imageUrl: string | null | undefined;

      if (form.removeImage && !form.imageUri) {
        setProgress("Suppression du recto...");
        const oldUrl = extractUrl(currentPhotocard.imageUrl);
        if (oldUrl) await storageService.deleteFromUrl("photocards", oldUrl);
        imageUrl = null;
      } else if (form.imageUri) {
        setProgress("Upload du nouveau recto...");
        const oldUrl = extractUrl(currentPhotocard.imageUrl);
        if (oldUrl) await storageService.deleteFromUrl("photocards", oldUrl);
        imageUrl = await storageService.uploadImage(
          "photocards",
          buildStoragePath.photocard(
            currentPhotocard.groupName,
            currentPhotocard.memberName,
            currentPhotocard.albumTitle,
            form.version || undefined,
          ),
          form.imageUri,
        );
      }

      // ── 2. Image verso ───────────────────────────────────────────────
      let backImageUrl: string | null | undefined;
      let backImageShared = false;

      if (form.removeBackImage && form.backImageUri) {
        if (form.backImageUri.startsWith("http")) {
          // C'est une URL existante (choisie via BackImagePickerModal)
          // pas d'upload, juste réutilise l'URL
          backImageUrl = form.backImageUri;
          backImageShared = true;

          // Supprime l'ancien verso s'il n'était pas partagé
          const oldUrl = extractUrl(currentPhotocard.backImageUrl);
          if (oldUrl && !currentPhotocard.backImageShared) {
            await storageService.deleteFromUrl("photocards", oldUrl);
          }
        } else {
          // C'est une URI locale → upload normal
          setProgress("Upload du nouveau verso...");
          const oldUrl = extractUrl(currentPhotocard.backImageUrl);

          if (oldUrl) await deleteBackImage(oldUrl, currentPhotocard.id);

          backImageUrl = await storageService.uploadImage(
            "photocards",
            buildStoragePath.photocard(
              currentPhotocard.groupName,
              "_shared",
              currentPhotocard.albumTitle,
              `${form.version || "common"}_back_shared`,
            ),
            form.backImageUri,
          );
          backImageShared = true;
        }
      }

      // ── 3. Met à jour la photocard ───────────────────────────────────
      setProgress("Mise à jour de la photocard...");
      // Dans useEditPhotocard.ts — juste avant photocardsService.update
      console.log("🖼️ imageUrl calculé:", imageUrl);
      console.log("🖼️ backImageUrl calculé:", backImageUrl);
      console.log(
        "📤 newImageUrl dans le form:",
        imageUrl !== undefined ? imageUrl : "undefined — pas de changement",
      );
      const updateData: PhotocardEditFormState = {
        type: form.type as any,
        version: form.version || "",
        shopName: form.shopName || "",
        rarity: form.rarity as any,
        memberId: form.memberIds[0] ?? form.memberId,
        memberIds: form.memberIds,
        albumId: form.albumId,
        imageUri: form.imageUri,
        backImageUri: form.backImageUri,
        removeImage: form.removeImage,
        removeBackImage: form.removeBackImage,
        aspectRatio: form.aspectRatio,
        customWidth: form.customWidth,
        customHeight: form.customHeight,
        backImageShared,
      };

      // ← Assigne explicitement au lieu du spread conditionnel
      if (imageUrl !== undefined) updateData.newImageUrl = imageUrl;
      if (backImageUrl !== undefined) updateData.newBackImageUrl = backImageUrl;

      console.log("📤 updateData final:", {
        newImageUrl: updateData.newImageUrl,
        newBackImageUrl: updateData.newBackImageUrl,
      });

      await photocardsService.update(photocardId, updateData);

      setProgress(null);
      onSuccess();
    } catch (err: any) {
      setError(err.message ?? "Une erreur est survenue");
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  return { loading, progress, error, submit };
};
