import { AlbumSectionPagination } from "@/src/components/album/AlbumSectionPagination";
import { SubmissionRow } from "@/src/components/submissions/SubmissionRow";
import { useSubmissionsPaginated } from "@/src/hooks/useSubmissionsPaginated";
import { useTranslation } from "@/src/hooks/useTranslation";
import { supabase } from "@/src/lib/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { router } from "expo-router";
import {
  ChevronLeft,
  CreditCard,
  Disc3,
  Inbox,
  Plus,
  Users,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../src/constants/colors";
import { Theme } from "../src/constants/theme";

// ─── Types soumissions albums / groupes ───────────────────────────────────────

type EntityTab = "photocards" | "albums" | "groups";
type StatusTab = "pending" | "approved" | "rejected";

const PAGE_SIZE = 20;

// ─── Hook générique pour albums/groupes submissions ───────────────────────────

function useEntitySubmissions(entity: "albums" | "groups", status: StatusTab) {
  const { user } = useAuthStore();
  const [items, setItems] = useState<any[]>([]);
  const [totalCount, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageL] = useState(false);

  const table = entity === "albums" ? "album_submissions" : "group_submissions";
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const fetchCount = useCallback(async () => {
    if (!user) return;
    const { count } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("created_by", user.id)
      .eq("status", status);
    setTotal(count ?? 0);
  }, [user, table, status]);

  const fetchPage = useCallback(
    async (p: number, silent = false) => {
      if (!user) return;
      silent ? setPageL(true) : setLoading(true);
      const { data } = await supabase
        .from(table)
        .select("*")
        .eq("created_by", user.id)
        .eq("status", status)
        .order("created_at", { ascending: false })
        .range(p * PAGE_SIZE, (p + 1) * PAGE_SIZE - 1);
      setItems(data ?? []);
      setLoading(false);
      setPageL(false);
    },
    [user, table, status],
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

  return {
    items,
    totalCount,
    totalPages,
    page,
    loading,
    pageLoading,
    handlePage,
  };
}

// ─── Ligne album/groupe submission ────────────────────────────────────────────

const EntityRow: React.FC<{ item: any; entity: "albums" | "groups" }> = ({
  item,
  entity,
}) => {
  const STATUS_COLOR: Record<string, string> = {
    pending: Colors.warning,
    approved: Colors.accent,
    rejected: Colors.danger,
  };
  const STATUS_LABEL: Record<string, string> = {
    pending: "En attente",
    approved: "Approuvé",
    rejected: "Rejeté",
  };

  const Icon = entity === "albums" ? Disc3 : Users;

  return (
    <View style={rowStyles.container}>
      <View style={rowStyles.iconWrap}>
        <Icon size={22} color={Colors.textMuted} strokeWidth={1.6} />
      </View>
      <View style={rowStyles.info}>
        <Text style={rowStyles.title}>
          {entity === "albums" ? item.title : item.name}
        </Text>
        {item.reject_reason && (
          <Text style={rowStyles.reason} numberOfLines={2}>
            Raison : {item.reject_reason}
          </Text>
        )}
        <Text style={rowStyles.date}>
          {new Date(item.created_at).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </Text>
      </View>
      <View
        style={[
          rowStyles.badge,
          { backgroundColor: `${STATUS_COLOR[item.status]}20` },
        ]}
      >
        <Text
          style={[rowStyles.badgeText, { color: STATUS_COLOR[item.status] }]}
        >
          {STATUS_LABEL[item.status]}
        </Text>
      </View>
    </View>
  );
};

const rowStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
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
  reason: { fontSize: Theme.fontSize.sm + 1, color: Colors.danger },
  date: { fontSize: Theme.fontSize.xs + 1, color: Colors.textMuted },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.full,
  },
  badgeText: {
    fontSize: Theme.fontSize.xs + 1,
    fontWeight: Theme.fontWeight.medium,
  },
});

// ─── Page principale ──────────────────────────────────────────────────────────

export default function MySubmissionsScreen() {
  const { t } = useTranslation();

  const [entityTab, setEntityTab] = useState<EntityTab>("photocards");
  const [statusTab, setStatusTab] = useState<StatusTab>("pending");

  const ENTITY_TABS: { key: EntityTab; label: string; Icon: any }[] = [
    { key: "photocards", label: "Photocards", Icon: CreditCard },
    { key: "albums", label: "Albums", Icon: Disc3 },
    { key: "groups", label: "Groupes", Icon: Users },
  ];

  const STATUS_TABS: { key: StatusTab; label: string }[] = [
    { key: "pending", label: t("submissions.status.pending") },
    { key: "approved", label: t("submissions.status.approved") },
    { key: "rejected", label: t("submissions.status.rejected") },
  ];

  // ── Photocards (hook existant) ────────────────────────────────────────
  const pcData = useSubmissionsPaginated({ mode: "mine", status: statusTab });

  // ── Albums / Groupes (hook générique) ─────────────────────────────────
  const albumData = useEntitySubmissions("albums", statusTab);
  const groupData = useEntitySubmissions("groups", statusTab);

  const current =
    entityTab === "photocards"
      ? pcData
      : entityTab === "albums"
        ? albumData
        : groupData;

  // ── Route vers le bon formulaire de soumission ────────────────────────
  const handleAdd = () => {
    if (entityTab === "photocards")
      router.push("/admin/add-photocard?userSubmission=true");
    else if (entityTab === "albums")
      router.push("/admin/add-album?userSubmission=true");
    else router.push("/admin/add-group?userSubmission=true");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t("submissions.title")}</Text>
        <TouchableOpacity style={styles.navBtn} onPress={handleAdd}>
          <Plus size={18} color={Colors.accent} strokeWidth={2} />
        </TouchableOpacity>
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
            <tab.Icon
              size={15}
              color={entityTab === tab.key ? Colors.accent : Colors.textMuted}
              strokeWidth={1.8}
            />
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
              statusTab === tab.key && styles.statusTabActive,
            ]}
            onPress={() => setStatusTab(tab.key)}
          >
            <Text
              style={[
                styles.statusTabText,
                statusTab === tab.key && styles.statusTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Compteur ── */}
      {current.totalCount > 0 && (
        <View style={styles.infoBar}>
          <Text style={styles.infoText}>
            <Text style={styles.infoCount}>{current.totalCount}</Text>{" "}
            soumission{current.totalCount !== 1 ? "s" : ""}
            {current.totalPages > 1 &&
              ` · page ${current.page + 1}/${current.totalPages}`}
          </Text>
        </View>
      )}

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
          key={`${entityTab}-${statusTab}`}
          data={
            entityTab === "photocards"
              ? (current as any).submissions
              : (current as any).items
          }
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            entityTab === "photocards" ? (
              <SubmissionRow card={item} showStatus />
            ) : (
              <EntityRow
                item={item}
                entity={entityTab as "albums" | "groups"}
              />
            )
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
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
              <Inbox size={48} color={Colors.textMuted} strokeWidth={1.2} />
              <Text style={styles.emptyTitle}>Aucune soumission</Text>
              <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
                <Text style={styles.addBtnText}>Faire une soumission</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
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
  },
  statusTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  statusTabActive: { borderBottomColor: Colors.textMuted },
  statusTabText: { fontSize: Theme.fontSize.sm, color: Colors.textMuted },
  statusTabTextActive: {
    color: Colors.text,
    fontWeight: Theme.fontWeight.medium,
  },
  infoBar: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  infoText: { fontSize: Theme.fontSize.sm + 1, color: Colors.textMuted },
  infoCount: { color: Colors.accent, fontWeight: Theme.fontWeight.semibold },
  listContent: { paddingBottom: Theme.spacing.xl },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: Theme.spacing.md,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: Theme.fontSize.base, color: Colors.textMuted },
  addBtn: {
    backgroundColor: Colors.pillActive,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
  },
  addBtnText: {
    fontSize: Theme.fontSize.base,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
});
