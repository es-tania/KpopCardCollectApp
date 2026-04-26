import { formatDate, formatYear } from "@/src/utils/date";
import { LinearGradient } from "expo-linear-gradient";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Disc3,
  Heart,
} from "lucide-react-native";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";
import { Group } from "../../types";
import { Badge } from "../ui/Badge";

// ─── Sous-composant : ligne d'info ───────────────────────────────────────────

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
  },
});

// ─── Composant principal ─────────────────────────────────────────────────────

interface GroupHeaderProps {
  group: Group;
}

export const GroupHeader: React.FC<GroupHeaderProps> = ({ group }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      {/* Bannière */}
      <View style={styles.banner}>
        <View style={styles.bannerImageContent}>
          {group.bannerUrl ? (
            <Image
              source={group.bannerUrl}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.bannerFallback} />
          )}

          {/* <View style={styles.bannerOverlay} /> */}
          {/* Dégradé */}
          <LinearGradient
            colors={["transparent", Colors.surface]}
            style={styles.gradient}
            locations={[0, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        </View>

        {/* Logo + infos sur la bannière */}
        <View style={styles.bannerContent}>
          <View style={styles.logoCircle}>
            {group.logoUrl ? (
              <Image
                source={group.logoUrl}
                style={styles.logoImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.logoInitials}>
                {group.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </Text>
            )}
          </View>

          <View style={styles.groupInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.groupName}>{group.name}</Text>
              {group.isFavorite && (
                <Heart
                  size={14}
                  color={Colors.danger}
                  fill={Colors.danger}
                  strokeWidth={0}
                />
              )}
            </View>
            {group.koreanName && (
              <Text style={styles.koreanName}>{group.koreanName}</Text>
            )}
            {group.fandomName && (
              <Text style={styles.fandomName}>✦ {group.fandomName}</Text>
            )}
            <View style={styles.badges}>
              {group.generation && <Badge label={group.generation} />}
              {group.company && (
                <Badge
                  label={group.company}
                  color="rgba(90,106,128,0.3)"
                  textColor={Colors.textMuted}
                />
              )}
              {group.status === "hiatus" && (
                <Badge
                  label="Hiatus"
                  color="rgba(250,199,117,0.15)"
                  textColor={Colors.warning}
                />
              )}
              {group.status === "disbanded" && (
                <Badge
                  label="Disbandé"
                  color="rgba(240,112,112,0.15)"
                  textColor={Colors.danger}
                />
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Progression + stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{group.ownedPhotocards ?? 0}</Text>
            <Text style={styles.statLabel}>Collectées</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: Colors.accent2 }]}>
              {group.wishlistPhotocards ?? 0}
            </Text>
            <Text style={styles.statLabel}>Souhaits</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: Colors.accent2 }]}>
              {group.favoritePhotocards ?? 0}
            </Text>
            <Text style={styles.statLabel}>Favoris</Text>
          </View>
        </View>
      </View>

      {/* ── Infos détaillées (expandable) ── */}
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

          {group.disbandDate && (
            <InfoRow
              icon={
                <CalendarDays
                  size={14}
                  color={Colors.danger}
                  strokeWidth={1.6}
                />
              }
              label="Disbandé"
              value={formatDate(group.disbandDate)}
            />
          )}
          <InfoRow
            icon={
              <Disc3 size={14} color={Colors.textMuted} strokeWidth={1.6} />
            }
            label="Albums enregistrés"
            value={group.totalAlbums?.toString() ?? "—"}
          />
          <InfoRow
            icon={
              <Disc3 size={14} color={Colors.textMuted} strokeWidth={1.6} />
            }
            label="Photocards enregistrées"
            value={group.totalPhotocards.toString()}
          />

          {/* Années d'activité */}
          <InfoRow
            icon={
              <CalendarDays
                size={14}
                color={Colors.textMuted}
                strokeWidth={1.6}
              />
            }
            label="Début"
            value={formatDate(group.debutDate)}
          />
          {group.debutDate && (
            <InfoRow
              icon={
                <CalendarDays
                  size={14}
                  color={Colors.textMuted}
                  strokeWidth={1.6}
                />
              }
              label="Actif depuis"
              value={
                group.disbandDate
                  ? `${formatYear(group.debutDate)} – ${formatYear(group.disbandDate)}`
                  : `${formatYear(group.debutDate)} – aujourd'hui`
              }
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },

  // Bannière
  banner: {
    height: 250,
    position: "relative",
  },
  bannerImageContent: {
    height: 200,
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.surface2,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(9,12,18,0.55)",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  bannerContent: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    alignItems: "flex-end",
    padding: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },

  // Logo
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.surface2,
    borderWidth: 2,
    borderColor: Colors.accent,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  logoInitials: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.accent,
  },

  // Infos groupe
  groupInfo: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  groupName: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  koreanName: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
    // paddingBottom: Theme.spacing.xs,
  },
  fandomName: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.accent,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 2,
  },

  // Stats
  statsContainer: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
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
  progressContainer: {
    marginTop: 2,
  },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pctLabel: {
    fontSize: Theme.fontSize.sm,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
    minWidth: 34,
    textAlign: "right",
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

  // Détails
  detailsContainer: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  detailsDivider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginBottom: Theme.spacing.sm,
  },
});
