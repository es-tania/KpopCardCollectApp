import { Colors } from "@/src/constants/colors";
import { Theme } from "@/src/constants/theme";
import { useShopsStore } from "@/src/store/shopsStore";
import { PhotocardWithDetails, SubmissionStatus } from "@/src/types";
import { Check, Clock, Eye, X } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// ─── Config statuts ───────────────────────────────────────────────────────────

export const STATUS_CONFIG = {
  pending: { label: "En attente", color: Colors.warning, Icon: Clock },
  approved: { label: "Approuvée", color: Colors.accent, Icon: Check },
  rejected: { label: "Rejetée", color: Colors.danger, Icon: X },
} as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface SubmissionRowProps {
  card: PhotocardWithDetails;
  onPreview?: () => void;
  // ── Mode "mine" — affiche juste le badge de statut ────────────────────
  showStatus?: boolean;
  // ── Mode "admin" — affiche les boutons d'action ───────────────────────
  tab?: SubmissionStatus;
  onApprove?: () => void;
  onReject?: () => void;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export const SubmissionRow: React.FC<SubmissionRowProps> = ({
  card,
  onPreview,
  showStatus = false,
  tab,
  onApprove,
  onReject,
}) => {
  const { getLabel } = useShopsStore();
  const statusCfg =
    STATUS_CONFIG[card.status as keyof typeof STATUS_CONFIG] ??
    STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.Icon;

  return (
    <View style={styles.container}>
      {/* ── Image ── */}
      <TouchableOpacity
        onPress={onPreview}
        activeOpacity={0.8}
        disabled={!onPreview}
      >
        <View style={styles.imageWrap}>
          {card.imageUrl ? (
            <Image
              source={card.imageUrl as any}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.imageFallback}>🧑‍🎤</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* ── Infos ── */}
      <View style={styles.info}>
        <Text style={styles.memberName}>{card.memberName}</Text>
        <Text style={styles.albumTitle} numberOfLines={1}>
          {card.groupName} · {card.albumTitle}
        </Text>
        {card.version && <Text style={styles.meta}>{card.version}</Text>}
        {card.shopName && (
          <Text style={styles.meta}>{getLabel(card.shopName)}</Text>
        )}
        <Text style={styles.date}>
          {new Date(card.createdAt ?? "").toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </Text>
      </View>

      {/* ── Droite : badge statut OU actions admin ── */}
      {showStatus && (
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${statusCfg.color}20` },
          ]}
        >
          <StatusIcon size={12} color={statusCfg.color} strokeWidth={2} />
          <Text style={[styles.statusText, { color: statusCfg.color }]}>
            {statusCfg.label}
          </Text>
        </View>
      )}

      {tab && (
        <View style={styles.actions}>
          {onPreview && (
            <TouchableOpacity style={styles.previewBtn} onPress={onPreview}>
              <Eye size={15} color={Colors.textMuted} strokeWidth={1.6} />
            </TouchableOpacity>
          )}
          {(tab === "pending" || tab === "rejected") && onApprove && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={onApprove}
            >
              <Check size={15} color={Colors.bg} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
          {(tab === "pending" || tab === "approved") && onReject && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={onReject}
            >
              <X size={15} color={Colors.bg} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  imageWrap: {
    width: 44,
    height: 64,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Colors.surface2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  image: { width: "100%", height: "100%" },
  imageFallback: { fontSize: 20 },
  info: { flex: 1, gap: 2 },
  memberName: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  albumTitle: { fontSize: Theme.fontSize.sm + 1, color: Colors.textMuted },
  meta: { fontSize: Theme.fontSize.xs + 1, color: Colors.accent },
  date: { fontSize: Theme.fontSize.xs + 1, color: Colors.textMuted },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.full,
    flexShrink: 0,
  },
  statusText: {
    fontSize: Theme.fontSize.xs + 1,
    fontWeight: Theme.fontWeight.medium,
  },
  actions: { gap: 6, alignItems: "center" },
  previewBtn: {
    width: 32,
    height: 32,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.surface2,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: Theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  approveBtn: { backgroundColor: Colors.accent },
  rejectBtn: { backgroundColor: Colors.danger },
});
