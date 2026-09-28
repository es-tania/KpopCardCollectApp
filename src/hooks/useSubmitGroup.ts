import { supabase } from "@/src/lib/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { useCallback, useState } from "react";

interface GroupSubmissionForm {
  name: string;
  nameKorean?: string;
  coverUrl?: string;
  debutDate?: string;
}

export const useSubmitGroup = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const submit = useCallback(
    async (form: GroupSubmissionForm) => {
      if (!user) throw new Error("Non connecté");
      setLoading(true);
      try {
        const { error } = await supabase.from("group_submissions").insert({
          created_by: user.id,
          name: form.name,
          name_korean: form.nameKorean ?? null,
          cover_url: form.coverUrl ?? null,
          debut_date: form.debutDate ?? null,
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
