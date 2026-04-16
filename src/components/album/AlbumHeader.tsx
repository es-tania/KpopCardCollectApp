import { ALBUM_TYPE_LABELS, CATEGORY_LABELS } from "@/src/constants/options";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Hash,
  Heart,
  MapPin,
  Star,
  Tag,
} from "lucide-react-native";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { Album } from "../../types";
import { formatDate } from "../../utils/date";
import { Badge } from "../ui/Badge";
import { ProgressBar } from "../ui/ProgressBar";

interface AlbumHeaderProps {
  album: Album;
}

// ─── Sous-composant ligne d'info ──────────────────────────────────────────────

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => (
  <View style={infoStyles.row}>
    <View style={infoStyles.iconWrap}>{icon}</View>
    <Text style={infoStyles.label}>{label}</Text>
    <Text style={infoStyles.value}>{value}</Text>
  </View>
);

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.sm,
    paddingVertical: 5,
  },
  iconWrap: {
    width: 20,
    alignItems: "center",
  },
  label: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
    flex: 1,
  },
  value: {
    fontSize: Theme.fontSize.base,
    color: Colors.text,
    fontWeight: Theme.fontWeight.medium,
    flexShrink: 1,
    textAlign: "right",
  },
});

// ─── Composant principal ──────────────────────────────────────────────────────

export const AlbumHeader: React.FC<AlbumHeaderProps> = ({ album }) => {
  const [expanded, setExpanded] = useState(false);

  const typeLabel = ALBUM_TYPE_LABELS[album.type] ?? album.type;
  const completionPct =
    album.completionPercentage ??
    (album.totalPhotocards > 0
      ? Math.round(((album.ownedPhotocards ?? 0) / album.totalPhotocards) * 100)
      : 0);

  return (
    <View style={styles.container}>
      {/* ── Cover + infos ── */}
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
          {/* Favori */}
          {album.isFavorite && (
            <View style={styles.favoriteBadge}>
              <Heart
                size={10}
                color={Colors.bg}
                fill={Colors.bg}
                strokeWidth={0}
              />
            </View>
          )}
        </View>

        <View style={styles.infoCol}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {album.title}
            </Text>
          </View>
          {album.koreanTitle && (
            <Text style={styles.koreanTitle}>{album.koreanTitle}</Text>
          )}

          {/* Badges principaux */}
          <View style={styles.badges}>
            <Badge label={typeLabel} />
            {album.category && (
              <Badge
                label={CATEGORY_LABELS[album.category] ?? album.category}
                color="rgba(90,106,128,0.3)"
                textColor={Colors.textMuted}
              />
            )}
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

          {/* Infos rapides */}
          <View style={styles.metaRows}>
            {album.releaseDate && (
              <View style={styles.metaRow}>
                <Calendar
                  size={11}
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
                <Star size={11} color={Colors.textMuted} strokeWidth={1.6} />
                <Text style={styles.metaText}>{album.eventName}</Text>
              </View>
            )}
            {album.eventLocation && (
              <View style={styles.metaRow}>
                <MapPin size={11} color={Colors.textMuted} strokeWidth={1.6} />
                <Text style={styles.metaText}>{album.eventLocation}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* ── Stats ── */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{album.totalPhotocards}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{album.ownedPhotocards ?? 0}</Text>
            <Text style={styles.statLabel}>Collectées</Text>
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

        {/* ── Barre de progression ── */}
        <ProgressBar
          label=""
          current={album.ownedPhotocards ?? 0}
          total={album.totalPhotocards}
        />
      </View>

      <View>
        {/* ── Expand : infos supplémentaires ── */}
        <TouchableOpacity
          style={styles.expandBtn}
          onPress={() => setExpanded((v) => !v)}
          activeOpacity={0.7}
        >
          <Text style={styles.expandLabel}>
            {expanded ? "Moins d'infos" : "Plus d'infos"}
          </Text>
          {expanded ? (
            <ChevronUp size={14} color={Colors.textMuted} strokeWidth={1.8} />
          ) : (
            <ChevronDown size={14} color={Colors.textMuted} strokeWidth={1.8} />
          )}
        </TouchableOpacity>

        {expanded && (
          <View style={styles.detailsContainer}>
            <View style={styles.detailsDivider} />

            {album.eventDate && (
              <InfoRow
                icon={
                  <Calendar
                    size={13}
                    color={Colors.textMuted}
                    strokeWidth={1.6}
                  />
                }
                label="Date de l'event"
                value={formatDate(album.eventDate)}
              />
            )}
            {album.eventLocation && (
              <InfoRow
                icon={
                  <MapPin
                    size={13}
                    color={Colors.textMuted}
                    strokeWidth={1.6}
                  />
                }
                label="Lieu"
                value={album.eventLocation}
              />
            )}
            {album.versions && album.versions.length > 0 && (
              <View style={versionStyles.container}>
                <View style={infoStyles.iconWrap}>
                  <Hash size={13} color={Colors.textMuted} strokeWidth={1.6} />
                </View>
                <Text style={versionStyles.label}>Versions</Text>
                <View style={versionStyles.chips}>
                  {album.versions.map((version) => (
                    <View key={version} style={versionStyles.chip}>
                      <Text style={versionStyles.chipText}>{version}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {album.category && (
              <InfoRow
                icon={
                  <Tag size={13} color={Colors.textMuted} strokeWidth={1.6} />
                }
                label="Catégorie"
                value={CATEGORY_LABELS[album.category] ?? album.category}
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    gap: Theme.spacing.md,
  },

  // Cover
  topRow: {
    flexDirection: "row",
    gap: Theme.spacing.md,
    padding: Theme.spacing.lg,
  },
  coverWrap: {
    width: 110,
    height: 110,
    borderRadius: Theme.borderRadius.md,
    overflow: "hidden",
    backgroundColor: Colors.surface2,
    borderWidth: 0.5,
    borderColor: Colors.border,
    position: "relative",
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
  favoriteBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },

  // Infos
  infoCol: {
    flex: 1,
    gap: 5,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  title: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
    flex: 1,
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
    flexShrink: 1,
  },

  // Stats
  statsContainer: {
    paddingHorizontal: Theme.spacing.lg,
    gap: 5,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: Theme.spacing.md,
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

  // Tags
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Theme.spacing.lg,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    flex: 1,
  },
  tag: {
    backgroundColor: Colors.surface2,
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  tagText: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
  },

  // Expand
  expandBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: Theme.spacing.sm + 2,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    marginTop: Theme.spacing.sm,
  },
  expandLabel: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  detailsContainer: {
    gap: 2,
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  detailsDivider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginBottom: Theme.spacing.xs,
  },
});

const versionStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Theme.spacing.sm,
    paddingVertical: 5,
  },
  chips: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    justifyContent: "flex-end",
  },
  chip: {
    backgroundColor: Colors.surface2,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  chipText: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
  },
  label: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
  },
});
