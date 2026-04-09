import { AdminSearchBar } from "@/src/components/admin";
import { AdminTabBar } from "@/src/components/admin/AdminTabBar";
import { SubmissionCard } from "@/src/components/admin/submissions/SubmissionCard";
import { PhotocardModal } from "@/src/components/photocard/PhotocardModal";
import { MOCK_SUBMISSIONS } from "@/src/data/mockSubmissions";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../src/constants/colors";
import { Theme } from "../../src/constants/theme";
import {
  AdminTab,
  PhotocardWithDetails,
  Submission,
  SubmissionStatus,
} from "../../src/types";

// ─── Types ────────────────────────────────────────────────────────────────────

const TABS: AdminTab[] = [
  {
    key: "pending",
    label: "En attente",
    count: MOCK_SUBMISSIONS.filter((s) => s.card.status === "pending").length,
  },
  {
    key: "approved",
    label: "Approuvées",
    count: MOCK_SUBMISSIONS.filter((s) => s.card.status === "approved").length,
  },
  {
    key: "rejected",
    label: "Refusées",
    count: MOCK_SUBMISSIONS.filter((s) => s.card.status === "rejected").length,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SubmissionsScreen() {
  const [activeTab, setActiveTab] = useState<SubmissionStatus>("pending");
  const [query, setQuery] = useState("");
  const [submissions, setSubmissions] =
    useState<Submission[]>(MOCK_SUBMISSIONS);
  const [previewCard, setPreviewCard] = useState<PhotocardWithDetails | null>(
    null,
  );

  // ── Données filtrées ────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      if (s.card.status !== activeTab) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        s.card.memberName.toLowerCase().includes(q) ||
        s.card.groupName.toLowerCase().includes(q) ||
        s.card.albumTitle.toLowerCase().includes(q) ||
        s.submittedBy.toLowerCase().includes(q) ||
        s.card.type.toLowerCase().includes(q)
      );
    });
  }, [submissions, activeTab, query]);

  // Compteurs dynamiques pour les onglets
  const tabs = useMemo(
    () =>
      TABS.map((t) => ({
        ...t,
        count: submissions.filter((s) => s.card.status === t.key).length,
      })),
    [submissions],
  );

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleApprove = useCallback((id: string) => {
    Alert.alert("Approuver", "Confirmer l'approbation de cette carte ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Approuver",
        onPress: () => {
          setSubmissions((prev) =>
            prev.map((s) =>
              s.card.id === id
                ? { ...s, card: { ...s.card, status: "approved" } }
                : s,
            ),
          );
          // TODO: API approve
        },
      },
    ]);
  }, []);

  const handleReject = useCallback((id: string) => {
    Alert.alert("Refuser", "Confirmer le refus de cette carte ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Refuser",
        style: "destructive",
        onPress: () => {
          setSubmissions((prev) =>
            prev.map((s) =>
              s.card.id === id
                ? { ...s, card: { ...s.card, status: "rejected" } }
                : s,
            ),
          );
          // TODO: API reject
        },
      },
    ]);
  }, []);

  const handleApproveAll = useCallback(() => {
    const pendingCount = submissions.filter(
      (s) => s.card.status === "pending",
    ).length;
    if (pendingCount === 0) return;

    Alert.alert(
      "Tout approuver",
      `Approuver les ${pendingCount} carte${pendingCount > 1 ? "s" : ""} en attente ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Tout approuver",
          onPress: () => {
            setSubmissions((prev) =>
              prev.map((s) =>
                s.card.status === "pending"
                  ? { ...s, card: { ...s.card, status: "approved" } }
                  : s,
              ),
            );
          },
        },
      ],
    );
  }, [submissions]);

  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key as SubmissionStatus);
    setQuery("");
  }, []);

  // ── Render item ──────────────────────────────────────────────────────────

  const renderItem = useCallback(
    ({ item }: { item: Submission }) => (
      <SubmissionCard
        submission={item}
        onApprove={() => handleApprove(item.card.id)}
        onReject={() => handleReject(item.card.id)}
        onPreview={() => setPreviewCard(item.card)}
      />
    ),
    [handleApprove, handleReject],
  );

  // ── Empty state ──────────────────────────────────────────────────────────

  const renderEmpty = useCallback(() => {
    const config = {
      pending: {
        emoji: "✅",
        title: "Aucune carte en attente",
        subtitle: "Tout est à jour !",
      },
      approved: {
        emoji: "📋",
        title: "Aucune carte approuvée",
        subtitle: "Les cartes approuvées apparaîtront ici",
      },
      rejected: {
        emoji: "🗑️",
        title: "Aucune carte refusée",
        subtitle: "Les cartes refusées apparaîtront ici",
      },
    }[activeTab];

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>{config.emoji}</Text>
        <Text style={styles.emptyTitle}>{config.title}</Text>
        <Text style={styles.emptySubtitle}>
          {query ? `Aucun résultat pour "${query}"` : config.subtitle}
        </Text>
      </View>
    );
  }, [activeTab, query]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Soumissions</Text>

        {/* Bouton "Tout approuver" uniquement sur l'onglet pending */}
        {activeTab === "pending" && filtered.length > 0 && (
          <TouchableOpacity
            style={styles.approveAllBtn}
            onPress={handleApproveAll}
          >
            <Text style={styles.approveAllText}>Tout ✓</Text>
          </TouchableOpacity>
        )}
        {(activeTab !== "pending" || filtered.length === 0) && (
          <View style={styles.navBtn} />
        )}
      </View>

      {/* ── Onglets ── */}
      <AdminTabBar
        tabs={tabs}
        activeKey={activeTab}
        onSelect={handleTabChange}
      />

      {/* ── Recherche ── */}
      <View style={styles.searchWrap}>
        <AdminSearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Membre, groupe, album, utilisateur..."
        />
      </View>

      {/* ── Compteur ── */}
      <View style={styles.countBar}>
        <Text style={styles.countText}>
          <Text style={styles.countNum}>{filtered.length}</Text> soumission
          {filtered.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* ── Liste ── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.card.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

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
  approveAllBtn: {
    height: 36,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: "rgba(74,222,170,0.15)",
    borderWidth: 0.5,
    borderColor: "rgba(74,222,170,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  approveAllText: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
  searchWrap: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  countBar: {
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
  listContent: {
    paddingVertical: Theme.spacing.lg,
    gap: 0,
    flexGrow: 1,
  },
  separator: {
    height: Theme.spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 10,
  },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
    textAlign: "center",
    paddingHorizontal: Theme.spacing.xl,
  },
});
