import { MembersGrid } from "@/src/components/member/MembersGrid";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import { SectionLabel } from "@/src/components/ui/SectionLabel";
import { useAlbums } from "@/src/hooks/album/useAlbums";
import { useGroupMembers } from "@/src/hooks/group/useGroupMembers";
import { usePhotocards } from "@/src/hooks/photocard/usePhotocards";
import { useFollowedGroups } from "@/src/hooks/useFollowedGroups";
import { useGroup } from "@/src/hooks/useGroup";
import { useUserStats } from "@/src/hooks/useUserStats";
import { useCollectionStore } from "@/src/store/collectionStore";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Download, Heart } from "lucide-react-native";
import React, { useCallback, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GroupHeader } from "../../src/components/group/GroupHeader";
import { Colors } from "../../src/constants/colors";
import { Theme } from "../../src/constants/theme";
import { Album, Member } from "../../src/types";

export default function GroupScreen() {
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

  const enrichedPhotocards = useMemo(
    () =>
      photocards.map((card) => ({
        ...card,
        isInCollection: collectionIds.has(card.id),
        isFavorite: favoriteIds.has(card.id),
        isWishlisted: wishlistIds.has(card.id),
      })),
    [photocards, collectionIds, favoriteIds, wishlistIds],
  );

  const albumsWithStats = useMemo(
    () =>
      albums.map((album) => {
        const albumCards = enrichedPhotocards.filter(
          (c) => c.albumId === album.id,
        );
        const owned = albumCards.filter((c) => c.isInCollection).length;
        return {
          ...album,
          totalPhotocards: albumCards.length,
          ownedPhotocards: owned,
          wishlistPhotocards: albumCards.filter((c) => c.isWishlisted).length,
          completionPercentage:
            albumCards.length > 0
              ? Math.round((owned / albumCards.length) * 100)
              : 0,
        };
      }),
    [albums, enrichedPhotocards],
  );

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
        <SectionLabel label="Membres" style={styles.sectionLabel} />
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
          label="Albums"
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
          <TouchableOpacity
            key={album.id}
            style={styles.albumCard}
            onPress={() => handlePressAlbum(album)}
            activeOpacity={0.75}
          >
            <View style={styles.albumCover}>
              {album.coverUrl ? (
                <Image
                  source={album.coverUrl as any}
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.albumEmoji}>📀</Text>
              )}
              {album.isComplete && (
                <View style={styles.completeBadge}>
                  <Text style={styles.completeText}>✓</Text>
                </View>
              )}
            </View>
            <View style={styles.albumInfo}>
              <Text style={styles.albumTitle} numberOfLines={1}>
                {album.title}
              </Text>
              <Text style={styles.albumMeta}>
                {album.releaseDate
                  ? new Date(album.releaseDate).getFullYear()
                  : ""}
              </Text>
              <ProgressBar
                label=""
                current={album.ownedPhotocards ?? 0}
                total={album.totalPhotocards}
              />
            </View>
          </TouchableOpacity>
        ))}
        {row.length < 2 && <View style={styles.albumCard} />}
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

      {/* ✅ FlatList unique — plus de ScrollView imbriqué */}
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
          length: 160, // hauteur approximative d'une row d'albums
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
  albumCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  albumCover: {
    height: 110,
    backgroundColor: Colors.surface2,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  albumEmoji: { fontSize: 32 },
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
});
