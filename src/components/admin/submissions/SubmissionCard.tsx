import { Check, Eye, X } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../../constants/colors";
import { Theme } from "../../../constants/theme";
import { PhotocardWithDetails } from "../../../types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Submission {
  card: PhotocardWithDetails;
  submittedBy: string;
  submittedAt: string;
}

interface SubmissionCardProps {
  submission: Submission;
  onApprove?: () => void;
  onReject?: () => void;
  onPreview: () => void;
}

const STATUS_CONFIG = {
  approved: {
    label: "Approuvée",
    color: Colors.accent,
    bg: "rgba(74,222,170,0.1)",
    border: "rgba(74,222,170,0.3)",
  },
  pending: {
    label: "En attente",
    color: Colors.warning,
    bg: "rgba(250,199,117,0.1)",
    border: "rgba(250,199,117,0.3)",
  },
  rejected: {
    label: "Refusée",
    color: Colors.danger,
    bg: "rgba(240,112,112,0.1)",
    border: "rgba(240,112,112,0.3)",
  },
};

const TYPE_LABELS: Record<string, string> = {
  normal: "Normal",
  pob: "POB",
  lucky_draw: "Lucky Draw",
  broadcast: "Broadcast",
  event: "Event",
  benefit: "Benefit",
};

// ─── Composant ────────────────────────────────────────────────────────────────

export const SubmissionCard: React.FC<SubmissionCardProps> = ({
  submission,
  onApprove,
  onReject,
  onPreview,
}) => {
  const { card, submittedBy, submittedAt } = submission;
  const statusConfig = STATUS_CONFIG[card.status];

  return (
    <View style={styles.card}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusConfig.bg,
              borderColor: statusConfig.border,
            },
          ]}
        >
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
        <Text style={styles.submittedAt}>{submittedAt}</Text>
      </View>

      {/* ── Contenu ── */}
      <View style={styles.content}>
        {/* Image */}
        <TouchableOpacity
          style={styles.imageWrap}
          onPress={onPreview}
          activeOpacity={0.85}
        >
          {card.imageUrl ? (
            <Image
              source={card.imageUrl as any}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imageFallback}>
              <Text style={styles.imageFallbackEmoji}>🧑‍🎤</Text>
            </View>
          )}
          <View style={styles.imageOverlay}>
            <Eye size={18} color={Colors.text} strokeWidth={1.8} />
          </View>
        </TouchableOpacity>

        {/* Infos */}
        <View style={styles.info}>
          <Text style={styles.memberName} numberOfLines={1}>
            {card.memberName}
          </Text>
          <Text style={styles.groupName} numberOfLines={1}>
            {card.groupName}
          </Text>
          <Text style={styles.albumTitle} numberOfLines={1}>
            {card.albumTitle}
          </Text>

          <View style={styles.tagsRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {TYPE_LABELS[card.type] ?? card.type}
              </Text>
            </View>
            {card.version && <Text style={styles.version}>{card.version}</Text>}
          </View>

          <Text style={styles.submittedBy}>
            Soumis par{" "}
            <Text style={styles.submittedByName}>@{submittedBy}</Text>
          </Text>
        </View>
      </View>

      {/* ── Actions (uniquement pour pending) ── */}
      {card.status === "pending" && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.rejectBtn} onPress={onReject}>
            <X size={16} color={Colors.bg} strokeWidth={2.5} />
            <Text style={styles.rejectBtnText}>Refuser</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.approveBtn} onPress={onApprove}>
            <Check size={16} color={Colors.bg} strokeWidth={2.5} />
            <Text style={styles.approveBtnText}>Approuver</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Statut final (approved ou rejected) */}
      {card.status !== "pending" && (
        <View
          style={[
            styles.finalStatus,
            {
              backgroundColor: statusConfig.bg,
              borderTopColor: statusConfig.border,
            },
          ]}
        >
          <Text style={[styles.finalStatusText, { color: statusConfig.color }]}>
            {card.status === "approved"
              ? "✓ Cette carte a été approuvée et ajoutée à l'application"
              : "✕ Cette carte a été refusée"}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: "hidden",
    marginHorizontal: Theme.spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm + 2,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  statusBadge: {
    borderRadius: Theme.borderRadius.full,
    borderWidth: 0.5,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: Theme.fontSize.sm + 1,
    fontWeight: Theme.fontWeight.medium,
  },
  submittedAt: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  content: {
    flexDirection: "row",
    gap: Theme.spacing.md,
    padding: Theme.spacing.md,
  },
  imageWrap: {
    width: 80,
    height: 116,
    borderRadius: Theme.borderRadius.sm,
    overflow: "hidden",
    backgroundColor: Colors.surface2,
    position: "relative",
  },
  image: { width: "100%", height: "100%" },
  imageFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imageFallbackEmoji: { fontSize: 28 },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(9,12,18,0.6)",
    alignItems: "center",
    paddingVertical: 5,
  },
  info: { flex: 1, gap: 4, justifyContent: "center" },
  memberName: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  groupName: {
    fontSize: Theme.fontSize.base,
    color: Colors.accent,
  },
  albumTitle: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  typeBadge: {
    backgroundColor: Colors.pillActive,
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
  },
  typeBadgeText: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
  version: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
  },
  submittedBy: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
    marginTop: 2,
  },
  submittedByName: {
    color: Colors.text,
    fontWeight: Theme.fontWeight.medium,
  },
  actions: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Colors.danger,
    borderRightWidth: 0.5,
    borderRightColor: Colors.border,
  },
  rejectBtnText: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.bg,
  },
  approveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Colors.accent,
  },
  approveBtnText: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.bg,
  },
  finalStatus: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm + 2,
    borderTopWidth: 0.5,
    alignItems: "center",
  },
  finalStatusText: {
    fontSize: Theme.fontSize.sm + 1,
    fontWeight: Theme.fontWeight.medium,
  },
});
