import { useFetchOnFocus } from "@/src/hooks/useFetchOnFocus";
import { supabase } from "@/src/lib/supabase";
import { mapPhotocard } from "@/src/services/photocardsService";
import { PhotocardWithDetails } from "@/src/types";
import { useCallback, useEffect, useState } from "react";

type SubmissionStatus = "pending" | "approved" | "rejected";

interface UseSubmissionsResult {
  submissions: PhotocardWithDetails[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  approve: (id: string) => Promise<void>;
  reject: (id: string) => Promise<void>;
  pendingCount: number;
}

export const useSubmissions = (
  statusFilter: SubmissionStatus | "all" = "pending",
): UseSubmissionsResult => {
  const [submissions, setSubmissions] = useState<PhotocardWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────
  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("photocards_with_details")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      setSubmissions((data ?? []).map(mapPhotocard));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetch();
  }, [fetch]);
  useFetchOnFocus(fetch);

  // ── Approuver ─────────────────────────────────────────────────────────
  const approve = useCallback(
    async (id: string) => {
      const { error } = await supabase
        .from("photocards")
        .update({ status: "approved" })
        .eq("id", id);

      if (error) throw error;

      // Mise à jour locale immédiate
      setSubmissions((prev) =>
        statusFilter === "pending"
          ? prev.filter((s) => s.id !== id)
          : prev.map((s) =>
              s.id === id ? { ...s, status: "approved" as any } : s,
            ),
      );
    },
    [statusFilter],
  );

  // ── Refuser ───────────────────────────────────────────────────────────
  const reject = useCallback(
    async (id: string) => {
      const { error } = await supabase
        .from("photocards")
        .update({ status: "rejected" })
        .eq("id", id);

      if (error) throw error;

      setSubmissions((prev) =>
        statusFilter === "pending"
          ? prev.filter((s) => s.id !== id)
          : prev.map((s) =>
              s.id === id ? { ...s, status: "rejected" as any } : s,
            ),
      );
    },
    [statusFilter],
  );

  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  return {
    submissions,
    loading,
    error,
    refetch: fetch,
    approve,
    reject,
    pendingCount,
  };
};
