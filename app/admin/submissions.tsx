import { useSubmissions } from "@/src/hooks/useSubmissions";
import { router } from "expo-router";
import { Check, ChevronLeft, Clock, Eye, X } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PhotocardModal } from "../../src/components/photocard/PhotocardModal";
import { Colors } from "../../src/constants/colors";
import { Theme } from "../../src/constants/theme";
import { PhotocardWithDetails, SubmissionStatus } from "../../src/types";
import { getShopLabel } from "../../src/utils/getShopLabel";

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS: { key: SubmissionStatus; label: string }[] = [
  { key: "pending", label: "En attente" },
  { key: "approved", label: "Approuvées" },
  { key: "rejected", label: "Refusées" },
];

// ─── Composant ligne soumission ───────────────────────────────────────────────

interface SubmissionRowProps {
  card: PhotocardWithDetails;
  onPreview: () => void;
  onApprove: () => void;
  onReject: () => void;
  tab: SubmissionStatus;
}

const SubmissionRow: React.FC<SubmissionRowProps> = ({
  card,
  onPreview,
  onApprove,
  onReject,
  tab,
}) => (
  <View style={rowStyles.container}>
    {/* Image */}
    <TouchableOpacity onPress={onPreview} activeOpacity={0.8}>
      <View style={rowStyles.imageWrap}>
        {card.imageUrl ? (
          <Image
            source={card.imageUrl as any}
            style={rowStyles.image}
            resizeMode="cover"
          />
        ) : (
          <Text style={rowStyles.imageFallback}>🧑‍🎤</Text>
        )}
      </View>
    </TouchableOpacity>

    {/* Infos */}
    <View style={rowStyles.info}>
      <Text style={rowStyles.memberName}>{card.memberName}</Text>
      <Text style={rowStyles.albumTitle} numberOfLines={1}>
        {card.groupName} · {card.albumTitle}
      </Text>
      {card.version && <Text style={rowStyles.meta}>{card.version}</Text>}
      {card.shopName && (
        <Text style={rowStyles.meta}>{getShopLabel(card.shopName)}</Text>
      )}
      <Text style={rowStyles.date}>
        {new Date(card.createdAt ?? "").toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </Text>
    </View>

    {/* Actions */}
    <View style={rowStyles.actions}>
      {/* Aperçu */}
      <TouchableOpacity style={rowStyles.previewBtn} onPress={onPreview}>
        <Eye size={15} color={Colors.textMuted} strokeWidth={1.6} />
      </TouchableOpacity>

      {/* Boutons selon le tab */}
      {tab === "pending" && (
        <>
          <TouchableOpacity
            style={[rowStyles.actionBtn, rowStyles.approveBtn]}
            onPress={onApprove}
          >
            <Check size={15} color={Colors.bg} strokeWidth={2.5} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[rowStyles.actionBtn, rowStyles.rejectBtn]}
            onPress={onReject}
          >
            <X size={15} color={Colors.bg} strokeWidth={2.5} />
          </TouchableOpacity>
        </>
      )}
      {tab === "approved" && (
        <TouchableOpacity
          style={[rowStyles.actionBtn, rowStyles.rejectBtn]}
          onPress={onReject}
        >
          <X size={15} color={Colors.bg} strokeWidth={2.5} />
        </TouchableOpacity>
      )}
      {tab === "rejected" && (
        <TouchableOpacity
          style={[rowStyles.actionBtn, rowStyles.approveBtn]}
          onPress={onApprove}
        >
          <Check size={15} color={Colors.bg} strokeWidth={2.5} />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const rowStyles = StyleSheet.create({
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
  albumTitle: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  meta: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.accent,
  },
  date: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
  },
  actions: {
    gap: 6,
    alignItems: "center",
  },
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
  approveBtn: {
    backgroundColor: Colors.accent,
  },
  rejectBtn: {
    backgroundColor: Colors.danger,
  },
});

// ─── Page principale ──────────────────────────────────────────────────────────

export default function SubmissionsScreen() {
  const [activeTab, setActiveTab] = useState<SubmissionStatus>("pending");
  const [previewCard, setPreviewCard] = useState<PhotocardWithDetails | null>(
    null,
  );

  const { submissions, loading, approve, reject, pendingCount } =
    useSubmissions(activeTab);

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleApprove = useCallback(
    (card: PhotocardWithDetails) => {
      Alert.alert(
        "Approuver la soumission",
        `Approuver "${card.memberName} — ${card.albumTitle}" ?`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Approuver",
            onPress: async () => {
              try {
                await approve(card.id);
              } catch (err: any) {
                Alert.alert("Erreur", err.message);
              }
            },
          },
        ],
      );
    },
    [approve],
  );

  const handleReject = useCallback(
    (card: PhotocardWithDetails) => {
      Alert.alert(
        "Refuser la soumission",
        `Refuser "${card.memberName} — ${card.albumTitle}" ?`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Refuser",
            style: "destructive",
            onPress: async () => {
              try {
                await reject(card.id);
              } catch (err: any) {
                Alert.alert("Erreur", err.message);
              }
            },
          },
        ],
      );
    },
    [reject],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Soumissions</Text>
        <View style={styles.navBtn} />
      </View>

      {/* ── Tabs ── */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
            {/* Badge pour les pending */}
            {tab.key === "pending" && pendingCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Compteur ── */}
      <View style={styles.countBar}>
        <Clock size={12} color={Colors.textMuted} strokeWidth={1.6} />
        <Text style={styles.countText}>
          <Text style={styles.countNum}>{submissions.length}</Text> soumission
          {submissions.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* ── Liste ── */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      ) : (
        <FlatList
          data={submissions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SubmissionRow
              card={item}
              tab={activeTab}
              onPreview={() => setPreviewCard(item)}
              onApprove={() => handleApprove(item)}
              onReject={() => handleReject(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>
                {activeTab === "pending" ? "🎉" : "📭"}
              </Text>
              <Text style={styles.emptyTitle}>
                {activeTab === "pending"
                  ? "Aucune soumission en attente"
                  : `Aucune soumission ${activeTab === "approved" ? "approuvée" : "refusée"}`}
              </Text>
            </View>
          }
        />
      )}

      {/* ── Modal aperçu ── */}
      <PhotocardModal
        card={previewCard}
        visible={previewCard !== null}
        onClose={() => setPreviewCard(null)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
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
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: Colors.accent,
  },
  tabText: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: Theme.fontSize.xs,
    color: Colors.bg,
    fontWeight: Theme.fontWeight.bold,
  },
  countBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  countText: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  countNum: {
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: Theme.spacing.md,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
    textAlign: "center",
  },
});
