// Hook partagé pour les deux pages de soumissions
import { supabase } from "@/src/lib/supabase";
import { mapPhotocard } from "@/src/services/photocardsService";
import { useAuthStore } from "@/src/store/authStore";
import { PhotocardWithDetails, SubmissionStatus } from "@/src/types";
import { useCallback, useEffect, useState } from "react";
import { useFetchOnFocus } from "./useFetchOnFocus";

export const PAGE_SIZE = 20;

interface UseSubmissionsPaginatedOptions {
  mode: "mine" | "admin";
  status?: SubmissionStatus; // pour le mode admin
}

export const useSubmissionsPaginated = ({
  mode,
  status,
}: UseSubmissionsPaginatedOptions) => {
  const { user } = useAuthStore();

  const [submissions, setSubmissions] = useState<PhotocardWithDetails[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // ── Charge le total ───────────────────────────────────────────────────
  const fetchCount = useCallback(async () => {
    if (!user) return;
    try {
      if (mode === "mine") {
        const { data } = await supabase.rpc("get_my_submissions_count", {
          p_user_id: user.id,
        });
        setTotalCount(Number(data ?? 0));
      } else {
        // Admin — compte par statut
        const { count } = await supabase
          .from("photocards")
          .select("id", { count: "exact", head: true })
          .eq("status", status ?? "pending");
        setTotalCount(count ?? 0);
      }
    } catch (err: any) {
      console.error("useSubmissionsPaginated count:", err.message);
    }
  }, [user, mode, status]);

  // ── Charge une page ───────────────────────────────────────────────────
  const fetchPage = useCallback(
    async (p: number, silent = false) => {
      if (!user) return;
      silent ? setPageLoading(true) : setLoading(true);
      try {
        let mapped: PhotocardWithDetails[];

        if (mode === "mine") {
          const { data, error } = await supabase.rpc("get_my_submissions", {
            p_user_id: user.id,
            p_limit: PAGE_SIZE,
            p_offset: p * PAGE_SIZE,
          });
          if (error) throw error;
          mapped = (data ?? []).map(mapPhotocard);
        } else {
          const { data, error } = await supabase
            .from("photocards_with_details")
            .select(
              "id, image_url, member_name, group_name, album_title, version, shop_name, status, created_at, aspect_ratio, card_members, type, rarity, member_id, album_id, group_id, back_image_url, back_image_shared, custom_width, custom_height, is_limited, album_cover_url",
            )
            .eq("status", status ?? "pending")
            .order("created_at", { ascending: false })
            .range(p * PAGE_SIZE, (p + 1) * PAGE_SIZE - 1);
          if (error) throw error;
          mapped = (data ?? []).map(mapPhotocard);
        }

        setSubmissions(mapped);
      } catch (err: any) {
        console.error("useSubmissionsPaginated page:", err.message);
      } finally {
        setLoading(false);
        setPageLoading(false);
      }
    },
    [user, mode, status],
  );

  // ── Init + reset au changement de statut ─────────────────────────────
  const init = useCallback(async () => {
    setPage(0);
    await Promise.all([fetchCount(), fetchPage(0)]);
  }, [fetchCount, fetchPage]);

  useEffect(() => {
    init();
  }, [init]);
  useFetchOnFocus(init);

  // ── Changement de page ────────────────────────────────────────────────
  const handlePage = useCallback(
    (p: number) => {
      setPage(p);
      fetchPage(p, true);
    },
    [fetchPage],
  );

  // ── Actions admin ─────────────────────────────────────────────────────
  const approve = useCallback(async (id: string) => {
    await supabase
      .from("photocards")
      .update({ status: "approved" })
      .eq("id", id);
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    setTotalCount((c) => Math.max(0, c - 1));
  }, []);

  const reject = useCallback(async (id: string) => {
    await supabase
      .from("photocards")
      .update({ status: "rejected" })
      .eq("id", id);
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    setTotalCount((c) => Math.max(0, c - 1));
  }, []);

  return {
    submissions,
    totalCount,
    totalPages,
    page,
    loading,
    pageLoading,
    handlePage,
    approve,
    reject,
    refetch: init,
  };
};
