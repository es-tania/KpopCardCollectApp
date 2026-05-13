import { photocardsService } from "@/src/services/photocardsService";
import {
  buildStoragePath,
  storageService,
} from "@/src/services/storageService";
import { useCacheStore } from "@/src/store/cacheStore";
import { PhotocardFormState } from "@/src/types";
import { useState } from "react";

interface UseAddPhotocardResult {
  loading: boolean;
  progress: string | null;
  error: string | null;
  submit: (form: PhotocardFormState, isAdmin?: boolean) => Promise<void>;
}

export const useAddPhotocard = (
  onSuccess: () => void,
): UseAddPhotocardResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const { invalidateAll } = useCacheStore();

  const submit = async (form: PhotocardFormState, isAdmin: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      // ── 1. Upload recto ──────────────────────────────────────────────
      let imageUrl: string | undefined;
      if (form.imageUri) {
        setProgress("Upload de l'image recto...");
        imageUrl = await storageService.uploadImage(
          "photocards",
          buildStoragePath.photocard(
            form.groupName,
            form.memberName,
            form.albumTitle,
            form.version || undefined,
          ),
          form.imageUri,
        );
      }

      // ── 2. Upload verso ──────────────────────────────────────────────
      let backImageUrl: string | undefined;
      let backImageShared = false;

      if (form.backImageUri) {
        if (form.backImageUri.startsWith("http")) {
          backImageUrl = form.backImageUri;
        } else {
          setProgress("Upload de l'image verso...");
          backImageUrl = await storageService.uploadImage(
            "photocards",
            buildStoragePath.photocard(
              form.groupName,
              "_shared",
              form.albumTitle,
              `${form.version || "common"}_back_shared`,
            ),
            form.backImageUri,
          );
        }
      }

      backImageShared = true;

      // ── 3. Soumet la photocard ───────────────────────────────────────
      setProgress("Soumission de la photocard...");

      console.log("Images avant submit:", { imageUrl, backImageUrl });

      await photocardsService.submit(
        {
          memberId: form.memberId,
          albumId: form.albumId,
          groupId: form.groupId,
          type: form.type as any,
          version: form.version || undefined,
          shopName: form.shopName || undefined,
          rarity: (form.rarity as any) || "common",
          imageUrl: imageUrl ? { uri: imageUrl } : undefined,
          backImageUrl: backImageUrl ? { uri: backImageUrl } : undefined,
          status: "pending",
          aspectRatio: form.aspectRatio ?? "photocard",
          customWidth: form.customWidth ?? undefined,
          customHeight: form.customHeight ?? undefined,
          backImageShared,
        },
        isAdmin,
      );
      invalidateAll("photocards:");

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
