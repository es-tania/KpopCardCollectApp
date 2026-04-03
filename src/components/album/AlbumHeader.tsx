import { Calendar, Hash, Star } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { ALBUM_TYPE_LABELS } from "../../constants/albumTypeLabels";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { Album } from "../../types";
import { formatDate } from "../../utils/date";
import { Badge } from "../ui/Badge";
import { ProgressBar } from "../ui/ProgressBar";

interface AlbumHeaderProps {
  album: Album;
}

export const AlbumHeader: React.FC<AlbumHeaderProps> = ({ album }) => {
  const typeLabel = ALBUM_TYPE_LABELS[album.type] ?? album.type;
  const completionPct =
    album.totalPhotocards > 0
      ? Math.round(((album.ownedPhotocards ?? 0) / album.totalPhotocards) * 100)
      : 0;

  return (
    <View style={styles.container}>
      {/* Cover + infos */}
      <View style={styles.topRow}>
        <View style={styles.coverWrap}>
          {album.coverUrl ? (
            <Image
              source={album.coverUrl as any}
              style={styles.cover}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.coverFallback}>
              <Text style={styles.coverEmoji}>📀</Text>
            </View>
          )}
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.title} numberOfLines={2}>
            {album.title}
          </Text>
          {album.koreanTitle && (
            <Text style={styles.koreanTitle}>{album.koreanTitle}</Text>
          )}

          <View style={styles.badges}>
            <Badge label={typeLabel} />
            {album.hasPOB && <Badge label="POB" />}
            {album.isLimited && (
              <Badge
                label="✦ Limited"
                color="rgba(250,199,117,0.15)"
                textColor={Colors.warning}
              />
            )}
            {album.isComplete && (
              <Badge
                label="✓ Complet"
                color="rgba(74,222,170,0.12)"
                textColor={Colors.accent}
              />
            )}
          </View>

          <View style={styles.metaRows}>
            {album.releaseDate && (
              <View style={styles.metaRow}>
                <Calendar
                  size={12}
                  color={Colors.textMuted}
                  strokeWidth={1.6}
                />
                <Text style={styles.metaText}>
                  {formatDate(album.releaseDate)}
                </Text>
              </View>
            )}
            {album.eventName && (
              <View style={styles.metaRow}>
                <Star size={12} color={Colors.textMuted} strokeWidth={1.6} />
                <Text style={styles.metaText}>{album.eventName}</Text>
              </View>
            )}
            {album.versions && album.versions.length > 0 && (
              <View style={styles.metaRow}>
                <Hash size={12} color={Colors.textMuted} strokeWidth={1.6} />
                <Text style={styles.metaText}>
                  Ver. {album.versions.join(", ")}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{album.ownedPhotocards ?? 0}</Text>
          <Text style={styles.statLabel}>Collectées</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{album.totalPhotocards}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: Colors.accent }]}>
            {album.wishlistPhotocards ?? 0}
          </Text>
          <Text style={styles.statLabel}>Souhaits</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: Colors.accent }]}>
            {completionPct}%
          </Text>
          <Text style={styles.statLabel}>Complétion</Text>
        </View>
      </View>

      {/* Progression */}
      <View style={{ flex: 1 }}>
        <ProgressBar
          label=""
          current={album.ownedPhotocards ?? 0}
          total={album.totalPhotocards}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    gap: Theme.spacing.lg,
  },
  topRow: {
    flexDirection: "row",
    gap: Theme.spacing.md,
  },
  coverWrap: {
    width: 110,
    height: 110,
    borderRadius: Theme.borderRadius.md,
    overflow: "hidden",
    backgroundColor: Colors.surface2,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  cover: {
    width: "100%",
    height: "100%",
  },
  coverFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  coverEmoji: {
    fontSize: 40,
  },
  infoCol: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  koreanTitle: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  metaRows: {
    gap: 3,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statNum: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.accent,
  },
  statLabel: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
  },
  statDivider: {
    width: 0.5,
    height: 28,
    backgroundColor: Colors.border,
  },
});
