import { albumsService } from "@/src/services/albumsService";
import {
  buildStoragePath,
  storageService,
} from "@/src/services/storageService";
import { useCacheStore } from "@/src/store/cacheStore";
import { AlbumFormState } from "@/src/types";
import { useState } from "react";

interface UseAddAlbumResult {
  loading: boolean;
  progress: string | null;
  error: string | null;
  submit: (form: AlbumFormState) => Promise<void>;
}

export const useAddAlbum = (onSuccess: () => void): UseAddAlbumResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const { invalidateAll } = useCacheStore();

  const submit = async (form: AlbumFormState) => {
    setLoading(true);
    setError(null);

    try {
      // ── 1. Récupère le nom du groupe pour le path ──────────────────────
      // On a groupId dans le form, on en a besoin pour le path storage
      // Le nom du groupe sera utilisé pour organiser les fichiers
      let coverUrl: string | undefined;

      if (form.coverUri) {
        setProgress("Upload de la couverture...");
        coverUrl = await storageService.uploadImage(
          "album-covers",
          buildStoragePath.albumCover(form.groupName, form.title),
          form.coverUri,
        );
      }

      // ── 2. Crée l'album ────────────────────────────────────────────────
      setProgress("Création de l'album...");
      await albumsService.create({
        groupId: form.groupId,
        groupName: form.groupName,
        title: form.title,
        koreanTitle: form.koreanTitle || undefined,
        type: form.type as any,
        category: (form.category as any) || "music",
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
        coverUrl: coverUrl ? { uri: coverUrl } : undefined,
        totalPhotocards: 0,
      });
      invalidateAll("albums:");

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
