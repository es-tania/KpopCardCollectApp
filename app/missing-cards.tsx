import { GroupFilter } from "@/src/components/group/GroupFilter";
import { PhotocardModal } from "@/src/components/photocard/PhotocardModal";
import { PhotocardsByAlbum } from "@/src/components/photocard/PhotocardsByAlbum";
import { Colors } from "@/src/constants/colors";
import { Theme } from "@/src/constants/theme";
import { useGroupMembers } from "@/src/hooks/group/useGroupMembers";
import { useFollowedGroups } from "@/src/hooks/useFollowedGroups";
import { supabase } from "@/src/lib/supabase";
import { mapPhotocard } from "@/src/services/photocardsService";
import { useAuthStore } from "@/src/store/authStore";
import { useCollectionStore } from "@/src/store/collectionStore";
import { useDeletedCardsStore } from "@/src/store/deletedCardsStore";
import { PhotocardWithDetails } from "@/src/types";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MissingCardsScreen() {
  const { user } = useAuthStore();
  const { collectionIds, favoriteIds, wishlistIds } = useCollectionStore();
  const deletedIds = useDeletedCardsStore((s) => s.deletedIds);
  const { followedGroups, loading: groupsLoading } = useFollowedGroups();

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [rawCards, setRawCards] = useState<PhotocardWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalCard, setModalCard] = useState<PhotocardWithDetails | null>(null);

  const { membersWithStats } = useGroupMembers(selectedGroupId ?? "");

  // ── Sélectionne le premier groupe par défaut ──────────────────────────
  useEffect(() => {
    if (followedGroups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(followedGroups[0].id);
    }
  }, [followedGroups]);

  // ── Charge les cartes manquantes du groupe sélectionné ───────────────
  const fetchMissing = useCallback(async () => {
    if (!user || !selectedGroupId) return;
    setLoading(true);
    try {
      let allCards: PhotocardWithDetails[] = [];
      let from = 0;

      while (true) {
        const { data, error } = await supabase
          .rpc("get_missing_photocards", { p_user_id: user.id })
          .eq("group_id", selectedGroupId)
          .range(from, from + 999);

        if (error) throw error;
        if (!data?.length) break;

        allCards = [...allCards, ...data.map(mapPhotocard)];
        if (data.length < 1000) break;
        from += 1000;
      }

      setRawCards(allCards);
    } catch (err: any) {
      console.error("MissingCards:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user, selectedGroupId]);

  useEffect(() => {
    fetchMissing();
  }, [fetchMissing]);

  // ── Enrichit depuis le store ──────────────────────────────────────────
  const cards = useMemo(
    () =>
      rawCards
        .filter((c) => !deletedIds.has(c.id) && !collectionIds.has(c.id))
        .map((c) => ({
          ...c,
          isInCollection: false,
          isFavorite: favoriteIds.has(c.id),
          isWishlisted: wishlistIds.has(c.id),
        })),
    [rawCards, collectionIds, favoriteIds, wishlistIds, deletedIds],
  );

  // ── Stats du groupe sélectionné ───────────────────────────────────────
  const selectedGroup = followedGroups.find((g) => g.id === selectedGroupId);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {selectedGroup
            ? `${selectedGroup.name} · manquantes`
            : "Cartes manquantes"}
        </Text>
        <View style={styles.navBtn} />
      </View>

      {/* ── Filtre groupes ── */}
      {groupsLoading ? (
        <ActivityIndicator color={Colors.accent} style={styles.groupsLoading} />
      ) : (
        <View style={styles.groupFilterWrap}>
          <GroupFilter
            groups={followedGroups}
            selectedId={selectedGroupId ?? ""}
            onSelect={(id) => setSelectedGroupId(id === "all" ? null : id)}
            showAll={false}
          />
        </View>
      )}

      {/* ── Grille de cartes ── */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      ) : (
        <PhotocardsByAlbum
          cards={cards}
          members={membersWithStats}
          onPressCard={(card) => setModalCard(card)}
          defaultExpanded={false}
          ListHeaderComponent={
            <View style={styles.infoBar}>
              <Text style={styles.infoText}>
                <Text style={styles.infoCount}>{cards.length}</Text> carte
                {cards.length !== 1 ? "s" : ""} manquante
                {cards.length !== 1 ? "s" : ""}
              </Text>
            </View>
          }
        />
      )}

      <PhotocardModal
        card={modalCard}
        visible={modalCard !== null}
        onClose={() => setModalCard(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  groupsLoading: { paddingVertical: Theme.spacing.lg },

  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  navTitle: {
    flex: 1,
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
    textAlign: "center",
    marginHorizontal: Theme.spacing.sm,
  },

  groupFilterWrap: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: Theme.spacing.lg,
  },

  infoBar: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    marginBottom: Theme.spacing.md,
  },
  infoText: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  infoCount: {
    color: Colors.danger,
    fontWeight: Theme.fontWeight.semibold,
  },
});
