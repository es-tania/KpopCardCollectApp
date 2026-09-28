import { supabase } from "@/src/lib/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { useCallback, useState } from "react";

interface AlbumSubmissionForm {
  groupId: string;
  title: string;
  coverUrl?: string;
  releaseDate?: string;
}

export const useSubmitAlbum = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const submit = useCallback(
    async (form: AlbumSubmissionForm) => {
      if (!user) throw new Error("Non connecté");
      setLoading(true);
      try {
        const { error } = await supabase.from("album_submissions").insert({
          created_by: user.id,
          group_id: form.groupId,
          title: form.title,
          cover_url: form.coverUrl ?? null,
          release_date: form.releaseDate ?? null,
          status: "pending",
        });
        if (error) throw error;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  return { submit, loading };
};
