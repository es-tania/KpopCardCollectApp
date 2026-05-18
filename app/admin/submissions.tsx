import { AlbumSectionPagination } from "@/src/components/album/AlbumSectionPagination";
import { SubmissionRow } from "@/src/components/submissions/SubmissionRow";
import { useSubmissionsPaginated } from "@/src/hooks/useSubmissionsPaginated";
import { useTranslation } from "@/src/hooks/useTranslation";
import { useAuthStore } from "@/src/store/authStore";
import { SubmissionStatus } from "@/src/types";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PhotocardModal } from "../../src/components/photocard/PhotocardModal";
import { Colors } from "../../src/constants/colors";
import { Theme } from "../../src/constants/theme";
import { PhotocardWithDetails } from "../../src/types";

export default function SubmissionsScreen() {
  const { t } = useTranslation();
  const { isAdmin, groupAdminIds } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SubmissionStatus>("pending");
  const [previewCard, setPreviewCard] = useState<PhotocardWithDetails | null>(
    null,
  );

  const TABS: { key: SubmissionStatus; label: string }[] = [
    { key: "pending", label: t("submissions.status.pending") },
    { key: "approved", label: t("submissions.status.approved") },
    { key: "rejected", label: t("submissions.status.rejected") },
  ];

  const {
    submissions,
    totalCount,
    totalPages,
    page,
    loading,
    pageLoading,
    handlePage,
    approve,
    reject,
  } = useSubmissionsPaginated({ mode: "admin", status: activeTab });

  // ── Filtre selon les droits ───────────────────────────────────────────
  const accessibleSubmissions = useMemo(() => {
    if (isAdmin) return submissions;
    return submissions.filter((s) => groupAdminIds.includes(s.groupId));
  }, [submissions, isAdmin, groupAdminIds]);

  const handleApprove = useCallback(
    (card: PhotocardWithDetails) => {
      Alert.alert(
        t("admin.approve"),
        `${card.memberName} — ${card.albumTitle}`,
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("admin.approve"),
            onPress: () =>
              approve(card.id).catch((e) =>
                Alert.alert(t("common.error"), e.message),
              ),
          },
        ],
      );
    },
    [approve, t],
  );

  const handleReject = useCallback(
    (card: PhotocardWithDetails) => {
      Alert.alert(
        t("admin.reject"),
        `${card.memberName} — ${card.albumTitle}`,
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("admin.reject"),
            style: "destructive",
            onPress: () =>
              reject(card.id).catch((e) =>
                Alert.alert(t("common.error"), e.message),
              ),
          },
        ],
      );
    },
    [reject, t],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t("admin.sections.submissions")}</Text>
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
            {tab.key === "pending" &&
              totalCount > 0 &&
              activeTab === "pending" && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{totalCount}</Text>
                </View>
              )}
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Compteur ── */}
      <View style={styles.countBar}>
        <Text style={styles.countText}>
          <Text style={styles.countNum}>{accessibleSubmissions.length}</Text>
          {totalPages > 1 && ` · page ${page + 1}/${totalPages}`}{" "}
          {t("admin.sections.submissions")}
        </Text>
      </View>

      {/* ── Liste ── */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      ) : pageLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.accent} size="small" />
        </View>
      ) : (
        <FlatList
          data={accessibleSubmissions}
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
          ListFooterComponent={
            totalPages > 1 ? (
              <AlbumSectionPagination
                page={page}
                totalPages={totalPages}
                onPage={handlePage}
              />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>
                {activeTab === "pending" ? "🎉" : "📭"}
              </Text>
              <Text style={styles.emptyTitle}>{t("admin.noSubmissions")}</Text>
            </View>
          }
        />
      )}

      <PhotocardModal
        card={previewCard}
        visible={previewCard !== null}
        onClose={() => setPreviewCard(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
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
  tabActive: { borderBottomColor: Colors.accent },
  tabText: { fontSize: Theme.fontSize.sm + 1, color: Colors.textMuted },
  tabTextActive: { color: Colors.accent, fontWeight: Theme.fontWeight.medium },
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
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  countText: { fontSize: Theme.fontSize.sm + 1, color: Colors.textMuted },
  countNum: { color: Colors.accent, fontWeight: Theme.fontWeight.medium },
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
