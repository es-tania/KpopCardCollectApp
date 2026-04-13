import { photocardsService } from "@/src/services/photocardsService";
import {
  buildStoragePath,
  storageService,
} from "@/src/services/storageService";
import { PhotocardEditFormState, PhotocardWithDetails } from "@/src/types";
import { extractUrl } from "@/src/utils/extractUrl";
import { useState } from "react";

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
            form.version || undefined,
          ),
          form.imageUri,
        );
      }

      // ── 2. Image verso ───────────────────────────────────────────────
      let backImageUrl: string | null | undefined;

      if (form.removeBackImage && !form.backImageUri) {
        setProgress("Suppression du verso...");
        const oldUrl = extractUrl(currentPhotocard.backImageUrl);
        if (oldUrl) await storageService.deleteFromUrl("photocards", oldUrl);
        backImageUrl = null;
      } else if (form.backImageUri) {
        setProgress("Upload du nouveau verso...");
        const oldUrl = extractUrl(currentPhotocard.backImageUrl);
        if (oldUrl) await storageService.deleteFromUrl("photocards", oldUrl);
        backImageUrl = await storageService.uploadImage(
          "photocards",
          buildStoragePath.photocard(
            currentPhotocard.groupName,
            currentPhotocard.memberName,
            `${form.version || "back"}_back`,
          ),
          form.backImageUri,
        );
      }

      // ── 3. Met à jour la photocard ───────────────────────────────────
      setProgress("Mise à jour de la photocard...");
      await photocardsService.update(photocardId, {
        type: form.type as any,
        version: form.version || undefined,
        shopName: form.shopName || undefined,
        rarity: form.rarity as any,
        memberId: form.memberId,
        albumId: form.albumId,
        // Images
        ...(imageUrl !== undefined && {
          imageUrl: imageUrl === null ? null : { uri: imageUrl },
        }),
        ...(backImageUrl !== undefined && {
          backImageUrl: backImageUrl === null ? null : { uri: backImageUrl },
        }),
      });

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
