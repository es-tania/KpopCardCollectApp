import { photocardsService } from "@/src/services/photocardsService";
import {
    buildStoragePath,
    storageService,
} from "@/src/services/storageService";
import { useState } from "react";

export interface BulkPhotocard {
  localId: string;
  memberId: string;
  memberName: string;
  imageUri: string;
  backImageUri?: string;
}

export interface BulkFormState {
  groupId: string;
  groupName: string;
  albumId: string;
  albumTitle: string;
  version: string;
  shopName: string;
  type: string;
  rarity: string;
}

interface UseBulkAddPhotocardsResult {
  loading: boolean;
  progress: string | null;
  error: string | null;
  submit: (
    form: BulkFormState,
    photocards: BulkPhotocard[],
    isAdmin: boolean,
  ) => Promise<void>;
}

export const useBulkAddPhotocards = (
  onSuccess: (count: number) => void,
): UseBulkAddPhotocardsResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  const submit = async (
    form: BulkFormState,
    photocards: BulkPhotocard[],
    isAdmin: boolean,
  ) => {
    setLoading(true);
    setError(null);

    try {
      for (let i = 0; i < photocards.length; i++) {
        const card = photocards[i];
        setProgress(
          `Upload ${i + 1}/${photocards.length} — ${card.memberName}...`,
        );

        // Upload recto
        let imageUrl: string | undefined;
        if (card.imageUri) {
          imageUrl = await storageService.uploadImage(
            "photocards",
            buildStoragePath.photocard(
              form.groupName,
              card.memberName,
              form.version || undefined,
            ),
            card.imageUri,
          );
        }

        // Upload verso
        let backImageUrl: string | undefined;
        if (card.backImageUri) {
          backImageUrl = await storageService.uploadImage(
            "photocards",
            buildStoragePath.photocard(
              form.groupName,
              card.memberName,
              `${form.version || "back"}_back`,
            ),
            card.backImageUri,
          );
        }

        // Crée la photocard
        await photocardsService.submit(
          {
            memberId: card.memberId,
            albumId: form.albumId,
            groupId: form.groupId,
            type: (form.type as any) || "normal",
            version: form.version || undefined,
            shopName: form.shopName || undefined,
            rarity: (form.rarity as any) || "common",
            imageUrl: imageUrl ? { uri: imageUrl } : undefined,
            backImageUrl: backImageUrl ? { uri: backImageUrl } : undefined,
          },
          isAdmin,
        );
      }

      setProgress(null);
      onSuccess(photocards.length);
    } catch (err: any) {
      setError(err.message ?? "Une erreur est survenue");
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  return { loading, progress, error, submit };
};
