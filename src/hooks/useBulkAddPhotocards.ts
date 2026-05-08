import { photocardsService } from "@/src/services/photocardsService";
import {
  buildStoragePath,
  storageService,
} from "@/src/services/storageService";
import { useState } from "react";
import { PhotocardFormState } from "../types";

export interface BulkPhotocard {
  localId: string;
  memberId: string;
  memberIds: string[];
  memberName: string;
  imageUri: string;
  backImageUri?: string;
}

export type BulkFormState = PhotocardFormState;

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
      // ── 1. Upload le verso commun UNE SEULE FOIS ──────────────────
      let commonBackUrl: string | undefined;
      if (form.commonBackImageUri) {
        setProgress("Upload du verso commun...");
        commonBackUrl = await storageService.uploadImage(
          "photocards",
          buildStoragePath.photocard(
            form.groupName,
            "_shared",
            form.albumTitle,
            `${form.version || "common"}_back_shared`,
          ),
          form.commonBackImageUri,
        );
      }

      // ── 2. Traite chaque carte ────────────────────────────────────
      let count = 0;
      for (const card of photocards) {
        setProgress(
          `Upload ${card.memberName} (${count + 1}/${photocards.length})...`,
        );

        const imageUrl = await storageService.uploadImage(
          "photocards",
          buildStoragePath.photocard(
            form.groupName,
            card.memberName,
            form.albumTitle,
            form.version || undefined,
          ),
          card.imageUri,
        );

        // ← verso propre à la carte si défini, sinon URL commune
        let backImageUrl: string | undefined;
        let backImageShared = false;

        if (card.backImageUri) {
          backImageUrl = await storageService.uploadImage(
            "photocards",
            buildStoragePath.photocard(
              form.groupName,
              card.memberName,
              form.albumTitle,
              `${form.version || "back"}_back`,
            ),
            card.backImageUri,
          );
          backImageShared = false;
        } else if (commonBackUrl) {
          backImageUrl = commonBackUrl;
          backImageShared = true;
        }

        await photocardsService.submit(
          {
            memberId: card.memberId,
            albumId: form.albumId,
            groupId: form.groupId,
            type: form.type as any,
            version: form.version || undefined,
            shopName: form.shopName || undefined,
            rarity: form.rarity as any,
            imageUrl: { uri: imageUrl },
            backImageUrl: backImageUrl ? { uri: backImageUrl } : undefined,
            backImageShared, // ← nouveau champ
          },
          isAdmin,
        );
        count++;
      }

      onSuccess(count);
    } catch (err: any) {
      setError(err.message ?? "Une erreur est survenue");
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  return { loading, progress, error, submit };
};
