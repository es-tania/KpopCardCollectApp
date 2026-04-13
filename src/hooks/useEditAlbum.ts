import { albumsService } from "@/src/services/albumsService";
import {
  buildStoragePath,
  storageService,
} from "@/src/services/storageService";
import { Album, AlbumEditFormState } from "@/src/types";
import { useState } from "react";
import { extractUrl } from "../utils/extractUrl";

interface UseEditAlbumResult {
  loading: boolean;
  progress: string | null;
  error: string | null;
  submit: (
    albumId: string,
    form: AlbumEditFormState,
    currentAlbum: Album,
  ) => Promise<void>;
}

export const useEditAlbum = (onSuccess: () => void): UseEditAlbumResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  const submit = async (
    albumId: string,
    form: AlbumEditFormState,
    currentAlbum: Album,
  ) => {
    setLoading(true);
    setError(null);

    try {
      // ── 1. Couverture ──────────────────────────────────────────────────
      let coverUrl: string | undefined;

      if (form.removeCover && !form.coverUri) {
        // Supprime sans remplacer
        setProgress("Suppression de la couverture...");
        const oldCoverUrl = extractUrl(currentAlbum.coverUrl);
        if (oldCoverUrl) {
          await storageService.deleteFromUrl("album-covers", oldCoverUrl);
        }
        await albumsService.update(albumId, { coverUrl: null as any });
      } else if (form.coverUri) {
        // Remplace l'ancienne
        setProgress("Upload de la nouvelle couverture...");
        const oldCoverUrl = extractUrl(currentAlbum.coverUrl);
        if (oldCoverUrl) {
          await storageService.deleteFromUrl("album-covers", oldCoverUrl);
        }
        coverUrl = await storageService.uploadImage(
          "album-covers",
          buildStoragePath.albumCover(currentAlbum.groupName, form.title),
          form.coverUri,
        );
      }

      // ── 2. Met à jour l'album ──────────────────────────────────────────
      setProgress("Mise à jour de l'album...");
      await albumsService.update(albumId, {
        title: form.title,
        koreanTitle: form.koreanTitle || undefined,
        type: form.type as any,
        category: form.category as any,
        releaseDate: form.releaseDate || undefined,
        eventName: form.eventName || undefined,
        eventLocation: form.eventLocation || undefined,
        eventDate: form.eventDate || undefined,
        versions: form.versions
          ? form.versions
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean)
          : [],
        hasPOB: form.hasPOB === "oui",
        isLimited: form.isLimited === "oui",
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        ...(coverUrl && { coverUrl: { uri: coverUrl } }),
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
