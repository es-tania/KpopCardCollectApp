import { supabase } from "@/src/lib/supabase";
import { albumsService } from "@/src/services/albumsService";
import {
  buildStoragePath,
  storageService,
} from "@/src/services/storageService";
import { useAuthStore } from "@/src/store/authStore";
import { useCacheStore } from "@/src/store/cacheStore";
import { AlbumFormState } from "@/src/types";
import { useState } from "react";

interface UseAddAlbumResult {
  loading: boolean;
  progress: string | null;
  error: string | null;
  submit: (form: AlbumFormState) => Promise<void>;
}

export const useAddAlbum = (
  onSuccess: () => void,
  isUserSubmission = false,
): UseAddAlbumResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const { invalidateAll } = useCacheStore();
  const { user } = useAuthStore();

  const submit = async (form: AlbumFormState) => {
    setLoading(true);
    setError(null);
    try {
      // ── 1. Upload cover ───────────────────────────────────────────────
      let coverUrl: string | undefined;
      if (form.coverUri) {
        setProgress("Upload de la couverture...");
        coverUrl = await storageService.uploadImage(
          "album-covers",
          buildStoragePath.albumCover(form.groupName, form.title),
          form.coverUri,
        );
      }

      if (isUserSubmission) {
        // ── 2a. Soumission utilisateur → album_submissions ────────────
        setProgress("Envoi de la soumission...");
        const { error: insertError } = await supabase
          .from("album_submissions")
          .insert({
            created_by: user!.id,
            group_id: form.groupId,
            title: form.title,
            cover_url: coverUrl ?? null,
            release_date: form.releaseDate || null,
            type: form.type,
            status: "pending",
          });
        if (insertError) throw insertError;
      } else {
        // ── 2b. Admin → albums (comportement existant) ────────────────
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
      }

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
