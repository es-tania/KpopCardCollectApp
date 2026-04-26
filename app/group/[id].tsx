import { AlbumCard } from "@/src/components/album/AlbumCard";
import { MembersGrid } from "@/src/components/member/MembersGrid";
import { SectionLabel } from "@/src/components/ui/SectionLabel";
import { useAlbums } from "@/src/hooks/album/useAlbums";
import { useGroupMembers } from "@/src/hooks/group/useGroupMembers";
import { usePhotocards } from "@/src/hooks/photocard/usePhotocards";
import { useFollowedGroups } from "@/src/hooks/useFollowedGroups";
import { useGroup } from "@/src/hooks/useGroup";
import { useTranslation } from "@/src/hooks/useTranslation";
import { useUserStats } from "@/src/hooks/useUserStats";
import { useCollectionStore } from "@/src/store/collectionStore";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Download, Heart } from "lucide-react-native";
import React, { useCallback, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GroupHeader } from "../../src/components/group/GroupHeader";
import { Colors } from "../../src/constants/colors";
import { Theme } from "../../src/constants/theme";
import { Album, Member } from "../../src/types";

export default function GroupScreen() {
  const { t } = useTranslation();
  const flatListRef = useRef<FlatList>(null);
  const { id: groupId } = useLocalSearchParams<{ id: string }>();

  const { group, loading: groupLoading } = useGroup(groupId);
  const { membersWithStats, loading: membersLoading } =
    useGroupMembers(groupId);
  const { albums, loading: albumsLoading } = useAlbums(groupId);
  const { photocards } = usePhotocards({ groupId });
  const { followedIds, toggleFollow } = useFollowedGroups();
  const { collectionIds, favoriteIds, wishlistIds } = useCollectionStore();
  const groupStats = useUserStats({ groupId });

  const isMounted = useRef(false);
  const savedScrollY = useRef(0);
  const isSavingScroll = useRef(true);

  const isFollowing = group ? followedIds.has(group.id) : false;

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isSavingScroll.current) {
        savedScrollY.current = e.nativeEvent.contentOffset.y;
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      if (!isMounted.current) {
        isMounted.current = true;
        return;
      }
      if (isSavingScroll.current) {
        savedScrollY.current = 0;
        flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
      } else {
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({
            offset: savedScrollY.current,
            animated: false,
          });
        }, 50);
        isSavingScroll.current = true;
      }
    }, []),
  );

  const handlePressMember = useCallback(
    (member: Member) => {
      isSavingScroll.current = false;
      router.push(`/member/${member.id}?groupId=${groupId}`);
    },
    [groupId],
  );

  const handlePressAlbum = useCallback(
    (album: Album) => {
      isSavingScroll.current = false;
      router.push(`/album/${album.id}?groupId=${groupId}`);
    },
    [groupId],
  );

  const handlePressBack = useCallback(() => router.back(), []);
  const handleToggleFollow = useCallback(() => {
    if (group) toggleFollow(group.id);
  }, [group, toggleFollow]);

  const albumsWithStats = useMemo(() => {
    // Récupère tous les IDs de photocards chargées par album
    const idsByAlbum = new Map<string, string[]>();
    photocards.forEach((c) => {
      if (!idsByAlbum.has(c.albumId)) idsByAlbum.set(c.albumId, []);
      idsByAlbum.get(c.albumId)!.push(c.id);
    });

    return albums.map((album) => {
      const ids = idsByAlbum.get(album.id) ?? [];
      const owned = ids.filter((id) => collectionIds.has(id)).length;
      const wished = ids.filter((id) => wishlistIds.has(id)).length;

      return {
        ...album,
        // ✅ totalPhotocards vient de album.totalPhotocards (BDD)
        // owned/wishlist calculés depuis collectionStore
        ownedPhotocards: owned,
        wishlistPhotocards: wished,
        completionPercentage:
          album.totalPhotocards > 0
            ? Math.round((owned / album.totalPhotocards) * 100)
            : 0,
      };
    });
  }, [albums, photocards, collectionIds, wishlistIds]);

  // ── Data du FlatList principal ─────────────────────────────────────────
  // Chaque item = un row de 2 albums
  const albumRows = useMemo(() => {
    const rows: Album[][] = [];
    for (let i = 0; i < albumsWithStats.length; i += 2) {
      rows.push(albumsWithStats.slice(i, i + 2));
    }
    return rows;
  }, [albumsWithStats]);

  // ── Header — tout ce qui est au-dessus des albums ─────────────────────
  const ListHeader = useMemo(
    () => (
      <>
        <GroupHeader group={{ ...group!, ...groupStats }} />
        <SectionLabel label={t("search.members")} style={styles.sectionLabel} />
        {membersLoading ? (
          <ActivityIndicator
            color={Colors.accent}
            style={styles.sectionLoading}
          />
        ) : (
          <MembersGrid
            members={membersWithStats}
            onPressMember={handlePressMember}
          />
        )}
        <SectionLabel
          label={t("search.albums")}
          style={[styles.sectionLabel, { marginTop: Theme.spacing.lg }]}
        />
        {albumsLoading && (
          <ActivityIndicator
            color={Colors.accent}
            style={styles.sectionLoading}
          />
        )}
      </>
    ),
    [
      group,
      groupStats,
      membersLoading,
      membersWithStats,
      handlePressMember,
      albumsLoading,
    ],
  );

  // ── Render row d'albums ────────────────────────────────────────────────
  const renderAlbumRow = useCallback(
    ({ item: row }: { item: Album[] }) => (
      <View style={styles.albumRow}>
        {row.map((album) => (
          <AlbumCard
            key={album.id}
            album={album}
            onPress={() => handlePressAlbum(album)}
          />
        ))}
        {row.length < 2 && <View style={styles.albumCardEmpty} />}
      </View>
    ),
    [handlePressAlbum],
  );

  if (groupLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!group) return null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Navbar absolue par-dessus */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.backBtn} onPress={handlePressBack}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <View style={styles.navbarIcons}>
          <TouchableOpacity
            style={[styles.backBtn, isFollowing && styles.backBtnActive]}
            onPress={handleToggleFollow}
          >
            <Heart
              size={18}
              color={isFollowing ? Colors.danger : Colors.text}
              fill={isFollowing ? Colors.danger : "transparent"}
              strokeWidth={1.6}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtn} onPress={() => {}}>
            <Download size={18} color={Colors.text} strokeWidth={1.6} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={albumRows}
        renderItem={renderAlbumRow}
        keyExtractor={(_, i) => `album-row-${i}`}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={<View style={styles.bottomPad} />}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={4}
        windowSize={8}
        initialNumToRender={6}
        getItemLayout={(_, index) => ({
          length: 160,
          offset: 160 * index,
          index,
        })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  navbar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    paddingTop: 40,
  },
  navbarIcons: { gap: 10, flexDirection: "row" },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.borderRadius.full,
    backgroundColor: "rgba(9, 12, 18, 0.45)",
  },
  backBtnActive: { backgroundColor: "rgba(240,112,112,0.2)" },
  sectionLabel: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
  },
  sectionLoading: { paddingVertical: Theme.spacing.xl },
  bottomPad: { height: 40 },
  albumRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: 10,
  },
  completeBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: Colors.accent,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  completeText: {
    fontSize: Theme.fontSize.xs,
    color: Colors.bg,
    fontWeight: Theme.fontWeight.bold,
  },
  albumInfo: { padding: 8, gap: 2 },
  albumTitle: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
  },
  albumMeta: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textMuted,
  },
  albumCardEmpty: { flex: 1 },
});
