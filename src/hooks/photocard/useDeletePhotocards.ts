import { supabase } from "@/src/lib/supabase";
import { storageService } from "@/src/services/storageService";
import { useCacheStore } from "@/src/store/cacheStore";
import { useDeletedCardsStore } from "@/src/store/deletedCardsStore";
import { PhotocardWithDetails } from "@/src/types";
import { extractUrl } from "@/src/utils/extractUrl";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

// ── Supprime le verso en tenant compte du partage ─────────────────────────────
export const deleteBackImage = async (backImageUrl: string, cardId: string) => {
  // ── Vérifie si le verso est partagé ────────────────────────────
  const { data } = await supabase
    .from("photocards")
    .select("id, back_image_shared")
    .eq("id", cardId)
    .single();

  const isShared = data?.back_image_shared ?? false;

  if (!isShared) {
    await storageService.deleteFromUrl("photocards", backImageUrl);
    return;
  }

  // ← Verso partagé → supprime seulement si plus aucune carte l'utilise
  const { count } = await supabase
    .from("photocards")
    .select("id", { count: "exact", head: true })
    .eq("back_image_url", backImageUrl)
    .neq("id", cardId);

  if (count === 0) {
    await storageService.deleteFromUrl("photocards", backImageUrl);
  }
};

export const useDeletePhotocards = () => {
  const [loading, setLoading] = useState(false);
  const markDeleted = useDeletedCardsStore((s) => s.markDeleted);

  // ── Supprime une seule carte ──────────────────────────────────────────
  const deleteOne = useCallback(
    async (card: PhotocardWithDetails, onSuccess?: () => void) => {
      setLoading(true);
      try {
        // Supprime les images du bucket
        const imageUrl = extractUrl(card.imageUrl);
        const backImageUrl = extractUrl(card.backImageUrl);

        console.log("🗑️ deleteOne:", card.id);
        console.log("🖼️ backUrl extrait:", backImageUrl);

        if (imageUrl)
          await storageService.deleteFromUrl("photocards", imageUrl);
        if (backImageUrl) await deleteBackImage(backImageUrl, card.id);

        // Supprime en BDD
        const { error } = await supabase
          .from("photocards")
          .delete()
          .eq("id", card.id);

        if (error) throw error;

        // Notifie toutes les pages
        markDeleted(card.id);
        useCacheStore.getState().invalidateAll("photocards:");

        onSuccess?.();
      } catch (err: any) {
        Alert.alert("Erreur", err.message);
      } finally {
        setLoading(false);
      }
    },
    [markDeleted],
  );

  // ── Supprime plusieurs cartes ─────────────────────────────────────────
  const deleteMany = useCallback(
    async (cards: PhotocardWithDetails[], onSuccess?: () => void) => {
      if (cards.length === 0) return;
      setLoading(true);
      try {
        // ── Récupère les infos back_image_shared pour toutes les cartes ──
        const { data: cardsData } = await supabase
          .from("photocards")
          .select("id, back_image_url, back_image_shared")
          .in(
            "id",
            cards.map((c) => c.id),
          );

        const cardMap = new Map((cardsData ?? []).map((c: any) => [c.id, c]));

        // ── Supprime les rectos en parallèle ─────────────────────────────
        await Promise.all(
          cards.map((card) => {
            const imageUrl = extractUrl(card.imageUrl);
            return imageUrl
              ? storageService.deleteFromUrl("photocards", imageUrl)
              : Promise.resolve();
          }),
        );

        // ── Supprime les versos — séquentiel pour gérer le partage ───────
        // Regroupe les URLs partagées pour éviter les doubles suppressions
        const sharedBackUrls = new Map<string, string[]>(); // url → ids
        const privateBackUrls: string[] = [];

        cards.forEach((card) => {
          const backUrl = extractUrl(card.backImageUrl);
          if (!backUrl) return;
          const dbCard = cardMap.get(card.id);
          const isShared = dbCard?.back_image_shared ?? false;

          if (isShared) {
            if (!sharedBackUrls.has(backUrl)) sharedBackUrls.set(backUrl, []);
            sharedBackUrls.get(backUrl)!.push(card.id);
          } else {
            privateBackUrls.push(backUrl);
          }
        });

        // ← Versos propres → supprime directement
        await Promise.all(
          privateBackUrls.map((url) =>
            storageService.deleteFromUrl("photocards", url),
          ),
        );

        // ← Versos partagés → vérifie si d'autres cartes (hors suppression) l'utilisent
        for (const [url, ids] of sharedBackUrls.entries()) {
          const { count } = await supabase
            .from("photocards")
            .select("id", { count: "exact", head: true })
            .eq("back_image_url", url)
            .not("id", "in", `(${ids.join(",")})`);

          if (count === 0) {
            await storageService.deleteFromUrl("photocards", url);
          }
        }

        // ── Supprime en BDD ───────────────────────────────────────────────
        const { error } = await supabase
          .from("photocards")
          .delete()
          .in(
            "id",
            cards.map((c) => c.id),
          );

        if (error) throw error;

        cards.forEach((c) => markDeleted(c.id));
        useCacheStore.getState().invalidateAll("photocards:");
        onSuccess?.();
      } catch (err: any) {
        Alert.alert("Erreur", err.message);
      } finally {
        setLoading(false);
      }
    },
    [markDeleted],
  );

  // ── Avec confirmation ─────────────────────────────────────────────────
  const confirmDeleteOne = useCallback(
    (card: PhotocardWithDetails, onSuccess?: () => void) => {
      Alert.alert(
        "Supprimer la photocard",
        `Supprimer la carte de ${card.memberName} ? Cette action est irréversible.`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: () => deleteOne(card, onSuccess),
          },
        ],
      );
    },
    [deleteOne],
  );

  const confirmDeleteMany = useCallback(
    (cards: PhotocardWithDetails[], onSuccess?: () => void) => {
      if (cards.length === 0) return;
      Alert.alert(
        "Supprimer la sélection",
        `Supprimer ${cards.length} photocard${cards.length > 1 ? "s" : ""} ? Cette action est irréversible.`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: `Supprimer (${cards.length})`,
            style: "destructive",
            onPress: () => deleteMany(cards, onSuccess),
          },
        ],
      );
    },
    [deleteMany],
  );

  return {
    loading,
    deleteOne,
    deleteMany,
    confirmDeleteOne,
    confirmDeleteMany,
  };
};
