import { AlbumSectionPagination } from "@/src/components/album/AlbumSectionPagination";
import { SubmissionRow } from "@/src/components/submissions/SubmissionRow";
import { useSubmissionsPaginated } from "@/src/hooks/useSubmissionsPaginated";
import { useTranslation } from "@/src/hooks/useTranslation";
import { supabase } from "@/src/lib/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { SubmissionStatus } from "@/src/types";
import { router } from "expo-router";
import { Check, ChevronLeft, X } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
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

type EntityTab = "photocards" | "albums" | "groups";

const PAGE_SIZE = 20;

// ─── Hook admin pour albums/groupes ──────────────────────────────────────────

function useAdminEntitySubmissions(
  entity: "albums" | "groups",
  status: SubmissionStatus,
) {
  const [items, setItems] = useState<any[]>([]);
  const [totalCount, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageL] = useState(false);

  const table = entity === "albums" ? "album_submissions" : "group_submissions";
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const fetchCount = useCallback(async () => {
    const { count } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("status", status);
    setTotal(count ?? 0);
  }, [table, status]);

  const fetchPage = useCallback(
    async (p: number, silent = false) => {
      silent ? setPageL(true) : setLoading(true);
      const { data } = await supabase
        .from(table)
        .select("*, profiles(username)")
        .eq("status", status)
        .order("created_at", { ascending: true })
        .range(p * PAGE_SIZE, (p + 1) * PAGE_SIZE - 1);
      setItems(data ?? []);
      setLoading(false);
      setPageL(false);
    },
    [table, status],
  );

  const init = useCallback(async () => {
    setPage(0);
    await Promise.all([fetchCount(), fetchPage(0)]);
  }, [fetchCount, fetchPage]);

  useEffect(() => {
    init();
  }, [init]);

  const handlePage = (p: number) => {
    setPage(p);
    fetchPage(p, true);
  };

  const approve = useCallback(
    async (id: string) => {
      try {
        const sub = items.find((i) => i.id === id);
        console.log("Approving:", sub);

        if (entity === "albums") {
          const { error: insertError } = await supabase.from("albums").insert({
            group_id: sub.group_id,
            title: sub.title,
            cover_url: sub.cover_url,
            release_date: sub.release_date,
          });
          console.log("Album insert error:", insertError);
          if (insertError) throw insertError;
        } else {
          const { error: insertError } = await supabase.from("groups").insert({
            name: sub.name,
            name_korean: sub.name_korean,
            cover_url: sub.cover_url,
            debut_date: sub.debut_date,
          });
          console.log("Group insert error:", insertError);
          if (insertError) throw insertError;
        }

        const { error: updateError } = await supabase
          .from(table)
          .update({ status: "approved" })
          .eq("id", id);
        console.log("Update error:", updateError);
        if (updateError) throw updateError;

        setItems((prev) => prev.filter((i) => i.id !== id));
        setTotal((c) => Math.max(0, c - 1));
      } catch (err: any) {
        console.error("approve error:", err.message);
        Alert.alert("Erreur", err.message);
      }
    },
    [table, items, entity],
  );

  const reject = useCallback(
    async (id: string, reason?: string) => {
      await supabase
        .from(table)
        .update({ status: "rejected", reject_reason: reason ?? null })
        .eq("id", id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setTotal((c) => Math.max(0, c - 1));
    },
    [table],
  );

  return {
    items,
    totalCount,
    totalPages,
    page,
    loading,
    pageLoading,
    handlePage,
    approve,
    reject,
  };
}

// ─── Ligne admin album/groupe ─────────────────────────────────────────────────

const AdminEntityRow: React.FC<{
  item: any;
  entity: "albums" | "groups";
  tab: SubmissionStatus;
  onApprove: () => void;
  onReject: () => void;
}> = ({ item, entity, tab, onApprove, onReject }) => (
  <View style={rowStyles.container}>
    <View style={rowStyles.iconWrap}>
      <Text style={rowStyles.emoji}>{entity === "albums" ? "💿" : "👥"}</Text>
    </View>
    <View style={rowStyles.info}>
      <Text style={rowStyles.title}>
        {entity === "albums" ? item.title : item.name}
      </Text>
      <Text style={rowStyles.sub}>
        par {item.profiles?.username ?? "Utilisateur"} ·{" "}
        {new Date(item.created_at).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
        })}
      </Text>
      {item.reject_reason && (
        <Text style={rowStyles.reason} numberOfLines={1}>
          Raison : {item.reject_reason}
        </Text>
      )}
    </View>
    <View style={rowStyles.actions}>
      {(tab === "pending" || tab === "rejected") && (
        <TouchableOpacity
          style={[rowStyles.btn, rowStyles.approveBtn]}
          onPress={onApprove}
        >
          <Check size={15} color={Colors.bg} strokeWidth={2.5} />
        </TouchableOpacity>
      )}
      {(tab === "pending" || tab === "approved") && (
        <TouchableOpacity
          style={[rowStyles.btn, rowStyles.rejectBtn]}
          onPress={onReject}
        >
          <X size={15} color={Colors.bg} strokeWidth={2.5} />
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
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 22 },
  info: { flex: 1, gap: 2 },
  title: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
  },
  sub: { fontSize: Theme.fontSize.xs + 1, color: Colors.textMuted },
  reason: { fontSize: Theme.fontSize.xs + 1, color: Colors.danger },
  actions: { gap: 6, alignItems: "center" },
  btn: {
    width: 32,
    height: 32,
    borderRadius: Theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  approveBtn: { backgroundColor: Colors.accent },
  rejectBtn: { backgroundColor: Colors.danger },
});

// ─── Page principale ──────────────────────────────────────────────────────────

export default function AdminSubmissionsScreen() {
  const { t } = useTranslation();
  const { isAdmin, groupAdminIds } = useAuthStore();

  const [entityTab, setEntityTab] = useState<EntityTab>("photocards");
  const [activeTab, setActiveTab] = useState<SubmissionStatus>("pending");
  const [previewCard, setPreviewCard] = useState<PhotocardWithDetails | null>(
    null,
  );

  const ENTITY_TABS: { key: EntityTab; label: string; icon: string }[] = [
    { key: "photocards", label: "Photocards", icon: "🃏" },
    { key: "albums", label: "Albums", icon: "💿" },
    { key: "groups", label: "Groupes", icon: "👥" },
  ];

  const STATUS_TABS: { key: SubmissionStatus; label: string }[] = [
    { key: "pending", label: t("submissions.status.pending") },
    { key: "approved", label: t("submissions.status.approved") },
    { key: "rejected", label: t("submissions.status.rejected") },
  ];

  // ── Photocards ────────────────────────────────────────────────────────
  const pcData = useSubmissionsPaginated({ mode: "admin", status: activeTab });

  const accessiblePc = isAdmin
    ? pcData.submissions
    : pcData.submissions.filter((s) => groupAdminIds.includes(s.groupId));

  const handleApprovePc = useCallback(
    (card: PhotocardWithDetails) => {
      Alert.alert(
        t("admin.approve"),
        `${card.memberName} — ${card.albumTitle}`,
        [
          { text: t("common.cancel"), style: "cancel" },
          { text: t("admin.approve"), onPress: () => pcData.approve(card.id) },
        ],
      );
    },
    [pcData],
  );

  const handleRejectPc = useCallback(
    (card: PhotocardWithDetails) => {
      Alert.alert(
        t("admin.reject"),
        `${card.memberName} — ${card.albumTitle}`,
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("admin.reject"),
            style: "destructive",
            onPress: () => pcData.reject(card.id),
          },
        ],
      );
    },
    [pcData],
  );

  // ── Albums / Groupes ──────────────────────────────────────────────────
  const albumData = useAdminEntitySubmissions("albums", activeTab);
  const groupData = useAdminEntitySubmissions("groups", activeTab);

  const handleApproveEntity = (data: typeof albumData, item: any) => {
    Alert.alert("Approuver", item.title ?? item.name, [
      { text: "Annuler", style: "cancel" },
      { text: "Approuver", onPress: () => data.approve(item.id) },
    ]);
  };

  const handleRejectEntity = (data: typeof albumData, item: any) => {
    Alert.prompt
      ? Alert.prompt("Rejeter", "Raison (optionnel)", (reason) =>
          data.reject(item.id, reason),
        )
      : Alert.alert("Rejeter", item.title ?? item.name, [
          { text: "Annuler", style: "cancel" },
          {
            text: "Rejeter",
            style: "destructive",
            onPress: () => data.reject(item.id),
          },
        ]);
  };

  const current =
    entityTab === "photocards"
      ? pcData
      : entityTab === "albums"
        ? albumData
        : groupData;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t("admin.sections.submissions")}</Text>
        <View style={styles.navBtn} />
      </View>

      {/* ── Onglets entité ── */}
      <View style={styles.entityTabs}>
        {ENTITY_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.entityTab,
              entityTab === tab.key && styles.entityTabActive,
            ]}
            onPress={() => setEntityTab(tab.key)}
          >
            <Text style={styles.entityTabEmoji}>{tab.icon}</Text>
            <Text
              style={[
                styles.entityTabText,
                entityTab === tab.key && styles.entityTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Onglets statut ── */}
      <View style={styles.statusTabs}>
        {STATUS_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.statusTab,
              activeTab === tab.key && styles.statusTabActive,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.statusTabText,
                activeTab === tab.key && styles.statusTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
            {tab.key === "pending" &&
              current.totalCount > 0 &&
              activeTab === "pending" && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{current.totalCount}</Text>
                </View>
              )}
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Liste ── */}
      {current.loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      ) : current.pageLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.accent} size="small" />
        </View>
      ) : (
        <FlatList
          key={`${entityTab}-${activeTab}`}
          data={
            entityTab === "photocards"
              ? accessiblePc
              : entityTab === "albums"
                ? albumData.items
                : groupData.items
          }
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            if (entityTab === "photocards") {
              return (
                <SubmissionRow
                  card={item}
                  tab={activeTab}
                  onPreview={() => setPreviewCard(item)}
                  onApprove={() => handleApprovePc(item)}
                  onReject={() => handleRejectPc(item)}
                />
              );
            }
            const data = entityTab === "albums" ? albumData : groupData;
            return (
              <AdminEntityRow
                item={item}
                entity={entityTab as "albums" | "groups"}
                tab={activeTab}
                onApprove={() => handleApproveEntity(data, item)}
                onReject={() => handleRejectEntity(data, item)}
              />
            );
          }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            current.totalPages > 1 ? (
              <AlbumSectionPagination
                page={current.page}
                totalPages={current.totalPages}
                onPage={current.handlePage}
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
  entityTabs: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  entityTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  entityTabActive: { borderBottomColor: Colors.accent },
  entityTabEmoji: { fontSize: 14 },
  entityTabText: { fontSize: Theme.fontSize.sm + 1, color: Colors.textMuted },
  entityTabTextActive: {
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
  statusTabs: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  statusTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  statusTabActive: { borderBottomColor: Colors.accent },
  statusTabText: { fontSize: Theme.fontSize.sm + 1, color: Colors.textMuted },
  statusTabTextActive: {
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
    fontWeight: "700",
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
