import { ALBUM_TYPE_LABELS } from "@/src/constants/options";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { Album } from "../../types";
import { ProgressBar } from "../ui/ProgressBar";

const LOCAL_PAGE = 12;
const NUM_COLUMNS = 2;

interface AlbumGridProps {
  albums: Album[];
  onPressAlbum: (album: Album) => void;
  ListHeaderComponent?: React.ReactElement;
  onEndReached?: () => void;
  loadingMore?: boolean;
  scrollEnabled?: boolean;
}

const AlbumCard: React.FC<{
  album: Album;
  onPress: () => void;
}> = ({ album, onPress }) => {
  const typeLabel = ALBUM_TYPE_LABELS[album.type] ?? album.type;
  const isComplete = album.isComplete;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Cover */}
      <View style={styles.coverContainer}>
        {album.coverUrl ? (
          <Image
            source={album.coverUrl}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.coverFallback}>
            <Text style={styles.coverEmoji}>📀</Text>
          </View>
        )}
        {/* Badges superposés */}
        {isComplete && (
          <View style={styles.completeBadge}>
            <Text style={styles.completeText}>✓</Text>
          </View>
        )}
      </View>

      {/* Infos */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {album.title}
        </Text>
        <Text style={styles.meta}>
          {typeLabel}
          {album.releaseDate
            ? ` · ${new Date(album.releaseDate).getFullYear()}`
            : ""}
        </Text>

        <ProgressBar
          label=""
          current={album.ownedPhotocards ?? 0}
          total={album.totalPhotocards}
        />
      </View>
    </TouchableOpacity>
  );
};

export const AlbumGrid: React.FC<AlbumGridProps> = ({
  albums,
  onPressAlbum,
  ListHeaderComponent,
  onEndReached,
  loadingMore = false,
  scrollEnabled,
}) => {
  const [visibleCount, setVisibleCount] = useState(LOCAL_PAGE);
  const cooldown = useRef(false);
  const prevIdsRef = useRef(albums.map((a) => a.id).join(","));

  // ── Reset si la liste change ──────────────────────────────────────────
  const currentIds = albums.map((a) => a.id).join(",");
  if (currentIds !== prevIdsRef.current) {
    prevIdsRef.current = currentIds;
    setVisibleCount(LOCAL_PAGE);
  }

  // ── Albums visibles ───────────────────────────────────────────────────
  const visibleAlbums = useMemo(
    () => albums.slice(0, visibleCount),
    [albums, visibleCount],
  );

  const hasLocalMore = visibleCount < albums.length;

  // ── Rows par paires ───────────────────────────────────────────────────
  const rows = useMemo(() => {
    const result: Album[][] = [];
    for (let i = 0; i < visibleAlbums.length; i += NUM_COLUMNS) {
      result.push(visibleAlbums.slice(i, i + NUM_COLUMNS));
    }
    return result;
  }, [visibleAlbums]);

  // ── onEndReached ──────────────────────────────────────────────────────
  const handleEndReached = useCallback(() => {
    if (cooldown.current) return;
    cooldown.current = true;

    if (hasLocalMore) {
      setVisibleCount((prev) => Math.min(prev + LOCAL_PAGE, albums.length));
    } else if (onEndReached) {
      onEndReached();
    }

    setTimeout(() => {
      cooldown.current = false;
    }, 800);
  }, [hasLocalMore, albums.length, onEndReached]);

  // ── Render row ────────────────────────────────────────────────────────
  const renderRow = useCallback(
    ({ item: row }: { item: Album[] }) => (
      <View style={styles.row}>
        {row.map((album) => (
          <View key={album.id} style={styles.cardWrap}>
            <AlbumCard album={album} onPress={() => onPressAlbum(album)} />
          </View>
        ))}
        {/* Rempli si nombre impair */}
        {row.length < NUM_COLUMNS &&
          Array(NUM_COLUMNS - row.length)
            .fill(null)
            .map((_, i) => <View key={`empty-${i}`} style={styles.cardWrap} />)}
      </View>
    ),
    [onPressAlbum],
  );

  const keyExtractor = useCallback(
    (_: any, index: number) => `row-${index}`,
    [],
  );

  // ── Footer ────────────────────────────────────────────────────────────
  const renderFooter = useCallback(() => {
    if (!hasLocalMore && !loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={Colors.accent} size="small" />
      </View>
    );
  }, [hasLocalMore, loadingMore]);

  // ── Empty ─────────────────────────────────────────────────────────────
  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>📀</Text>
        <Text style={styles.emptyText}>Aucun album</Text>
      </View>
    ),
    [],
  );

  return (
    <FlatList
      data={rows}
      renderItem={renderRow}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
      removeClippedSubviews={true}
      maxToRenderPerBatch={4}
      windowSize={8}
      initialNumToRender={6}
      scrollEnabled={scrollEnabled ?? true}
    />
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: 40,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  cardWrap: { flex: 1 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  coverContainer: {
    height: 110,
    backgroundColor: Colors.surface2,
    position: "relative",
  },
  coverImage: { width: "100%", height: "100%" },
  coverFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  coverEmoji: { fontSize: 32 },
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
  info: {
    padding: 8,
    gap: 2,
  },
  title: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
  },
  meta: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textMuted,
  },
  footer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Theme.spacing.lg,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },
  emptyEmoji: { fontSize: 28 },
  emptyText: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
  },
});
