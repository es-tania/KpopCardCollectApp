import { supabase } from "@/src/lib/supabase";
import { storageService } from "@/src/services/storageService";
import { useCacheStore } from "@/src/store/cacheStore";
import { useDeletedCardsStore } from "@/src/store/deletedCardsStore";
import { PhotocardWithDetails } from "@/src/types";
import { extractUrl } from "@/src/utils/extractUrl";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

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

        if (imageUrl)
          await storageService.deleteFromUrl("photocards", imageUrl);
        if (backImageUrl)
          await storageService.deleteFromUrl("photocards", backImageUrl);

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
        // Supprime les images du bucket en parallèle
        await Promise.all(
          cards.flatMap((card) => {
            const ops = [];
            const imageUrl = extractUrl(card.imageUrl);
            const backImageUrl = extractUrl(card.backImageUrl);
            if (imageUrl)
              ops.push(storageService.deleteFromUrl("photocards", imageUrl));
            if (backImageUrl)
              ops.push(
                storageService.deleteFromUrl("photocards", backImageUrl),
              );
            return ops;
          }),
        );

        // Supprime en BDD
        const { error } = await supabase
          .from("photocards")
          .delete()
          .in(
            "id",
            cards.map((c) => c.id),
          );

        if (error) throw error;

        // Notifie toutes les pages
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
