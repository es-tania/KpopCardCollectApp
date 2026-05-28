import { GroupFilter } from "@/src/components/group/GroupFilter";
import { MembersList } from "@/src/components/member/MembersList";
import { PhotocardModal } from "@/src/components/photocard/PhotocardModal";
import { PhotocardsByAlbum } from "@/src/components/photocard/PhotocardsByAlbum";
import { Colors } from "@/src/constants/colors";
import { Theme } from "@/src/constants/theme";
import { useFollowedGroups } from "@/src/hooks/group/useFollowedGroups";
import { useGroupMembers } from "@/src/hooks/group/useGroupMembers";
import { supabase } from "@/src/lib/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { useCollectionStore } from "@/src/store/collectionStore";
import { PhotocardWithDetails } from "@/src/types";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AlbumInfo {
  albumId: string;
  albumTitle: string;
  albumCoverUrl?: string;
  missingCount: number;
}

export default function MissingCardsScreen() {
  const { user } = useAuthStore();
  const { collectionIds } = useCollectionStore();
  const { followedGroups, loading: groupsLoading } = useFollowedGroups();

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(false);
  const [silentRefreshing, setSilentRefreshing] = useState(false);
  const [modalCard, setModalCard] = useState<PhotocardWithDetails | null>(null);
  const [albumInfos, setAlbumInfos] = useState<AlbumInfo[]>([]);

  const { membersWithStats } = useGroupMembers(selectedGroupId ?? "");

  // ── Sélectionne le premier groupe par défaut ──────────────────────────
  useEffect(() => {
    if (followedGroups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(followedGroups[0].id);
    }
  }, [followedGroups]);

  // ── Charge seulement les comptes par album ────────────────────────────
  const fetchAlbumCounts = useCallback(
    async (silent = false) => {
      if (!user || !selectedGroupId) return;
      silent ? setSilentRefreshing(true) : setLoading(true);
      try {
        const { data, error } = await supabase.rpc(
          "get_missing_counts_by_album",
          {
            p_user_id: user.id,
            p_group_id: selectedGroupId,
            p_member_id: selectedMemberId ?? null,
          },
        );
        if (error) throw error;
        setAlbumInfos(
          (data ?? []).map((d: any) => ({
            albumId: d.album_id,
            albumTitle: d.album_title,
            albumCoverUrl: d.album_cover_url ?? undefined,
            missingCount: d.missing_count,
          })),
        );
      } catch (err: any) {
        console.error("MissingCards:", err.message);
      } finally {
        silent ? setSilentRefreshing(false) : setLoading(false);
      }
    },
    [user, selectedGroupId, selectedMemberId],
  );

  useEffect(() => {
    setAlbumInfos([]);
    setSelectedMemberId(undefined);
    fetchAlbumCounts(false);
  }, [selectedGroupId]);

  useEffect(() => {
    if (!selectedGroupId) return;
    fetchAlbumCounts(true);
  }, [collectionIds]);

  useEffect(() => {
    fetchAlbumCounts(true);
  }, [fetchAlbumCounts]);

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

      {/* ── Filtre membres ── */}
      {membersWithStats.length > 1 && (
        <View style={styles.memberFilterWrap}>
          <MembersList
            members={membersWithStats}
            selectedId={selectedMemberId}
            showStats={false}
            onPressMember={(m) =>
              setSelectedMemberId((prev) => (prev === m.id ? undefined : m.id))
            }
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
          albumInfos={albumInfos}
          userId={user?.id}
          groupId={selectedGroupId ?? ""}
          memberId={selectedMemberId}
          fetchMode="missing"
          onPressCard={(card) => setModalCard(card)}
          defaultExpanded={false}
          ListHeaderComponent={
            <View style={styles.infoBar}>
              <Text style={styles.infoText}>
                <Text style={styles.infoCount}>
                  {albumInfos.reduce((acc, a) => acc + a.missingCount, 0)}
                </Text>{" "}
                cartes manquantes
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
  memberFilterWrap: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingVertical: Theme.spacing.md,
  },
});
