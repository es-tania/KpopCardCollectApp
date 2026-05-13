import { GroupAlphaList } from "@/src/components/group";
import { useFollowedGroups } from "@/src/hooks/group/useFollowedGroups";
import { usePhotocards } from "@/src/hooks/photocard/usePhotocards";
import { useCollectionStore } from "@/src/store/collectionStore";
import { router } from "expo-router";
import { ChevronLeft, Heart, Search } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../src/constants/colors";
import { Theme } from "../src/constants/theme";

// ─── Page principale ──────────────────────────────────────────────────────────

export default function MyGroupsScreen() {
  const [query, setQuery] = useState("");

  // ── Data BDD ──────────────────────────────────────────────────────────
  const { followedGroups, loading } = useFollowedGroups();
  const { collectionIds } = useCollectionStore();

  // Toutes les photocards pour calculer la progression
  const { photocards } = usePhotocards({});

  // ── Enrichit les groupes avec les stats de collection ─────────────────
  const enrichedGroups = useMemo(() => {
    return followedGroups.map((group) => {
      const groupCards = photocards.filter((c) => c.groupId === group.id);
      const owned = groupCards.filter((c) => collectionIds.has(c.id)).length;

      return {
        ...group,
        ownedPhotocards: owned,
        completionPercentage:
          group.totalPhotocards > 0
            ? Math.round((owned / group.totalPhotocards) * 100)
            : 0,
      };
    });
  }, [followedGroups, photocards, collectionIds]);

  // ── Filtre + tri alphabétique ─────────────────────────────────────────
  const filteredGroups = useMemo(() => {
    const q = query.toLowerCase().trim();
    return [...enrichedGroups]
      .filter(
        (g) =>
          !q ||
          g.name.toLowerCase().includes(q) ||
          g.koreanName?.toLowerCase().includes(q) ||
          g.company?.toLowerCase().includes(q),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [enrichedGroups, query]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Mes groupes</Text>
        <View style={styles.navBtn} />
      </View>

      {/* ── Barre de recherche ── */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Search size={15} color={Colors.textMuted} strokeWidth={1.6} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher un groupe..."
            placeholderTextColor={Colors.textMuted}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Compteur ── */}
      <View style={styles.counterRow}>
        <Heart
          size={13}
          color={Colors.danger}
          fill={Colors.danger}
          strokeWidth={0}
        />
        <Text style={styles.counter}>
          {filteredGroups.length} groupe{filteredGroups.length !== 1 ? "s" : ""}{" "}
          suivi{filteredGroups.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* ── Liste ── */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      ) : filteredGroups.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎵</Text>
          <Text style={styles.emptyTitle}>
            {query ? "Aucun résultat" : "Aucun groupe suivi"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {query
              ? `Aucun groupe ne correspond à "${query}"`
              : "Explore des groupes et ajoute-les à tes favoris"}
          </Text>
          {!query && (
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => router.push("/search")}
            >
              <Text style={styles.exploreBtnText}>Explorer les groupes</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <GroupAlphaList
            groups={filteredGroups}
            onPressGroup={(id) => router.push(`/group/${id}`)}
          />
          <View style={styles.bottomPad} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  // Navbar
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

  // Search
  searchWrap: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm + 2,
  },
  searchInput: {
    flex: 1,
    fontSize: Theme.fontSize.base,
    color: Colors.text,
    padding: 0,
  },
  clearBtn: {
    fontSize: 12,
    color: Colors.textMuted,
    padding: 4,
  },

  // Compteur
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
  },
  counter: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },

  // Séparateur alphabétique
  alphaHeader: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xs,
  },
  alphaText: {
    fontSize: Theme.fontSize.sm + 1,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.accent,
    letterSpacing: 0.5,
  },

  // Ligne groupe
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  logoWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surface2,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  logoInitials: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.accent,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    flexWrap: "wrap",
  },
  name: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  koreanName: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  meta: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  metaDot: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },

  // Progression
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: Colors.surface2,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  progressText: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
  },
  progressPct: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
    minWidth: 30,
    textAlign: "right",
  },
  chevron: {
    fontSize: 20,
    color: Colors.textMuted,
  },

  // État vide
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Theme.spacing.xl,
    gap: Theme.spacing.md,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Theme.spacing.sm,
  },
  emptyTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  exploreBtn: {
    marginTop: Theme.spacing.sm,
    backgroundColor: Colors.pillActive,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
  },
  exploreBtnText: {
    fontSize: Theme.fontSize.base,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },

  scroll: { flex: 1 },
  bottomPad: { height: 40 },
});
