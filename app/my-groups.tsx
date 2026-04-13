import { GroupAlphaList } from "@/src/components/group";
import { useGroups } from "@/src/hooks/group/useGroups";
import { router } from "expo-router";
import { ChevronLeft, Heart, Search } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Image,
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
import { MOCK_GROUPS } from "../src/data/mockGroups";
import { Group } from "../src/types";

// ─── Mock groupes favoris (à remplacer par appel API) ─────────────────────────

const MOCK_FOLLOWED_GROUPS: Group[] = MOCK_GROUPS;

// ─── Sous-composant : ligne de groupe ─────────────────────────────────────────

interface GroupRowProps {
  group: Group;
  onPress: () => void;
}

const GroupRow: React.FC<GroupRowProps> = ({ group, onPress }) => {
  const completionPct =
    group.totalPhotocards > 0
      ? Math.round(((group.ownedPhotocards ?? 0) / group.totalPhotocards) * 100)
      : 0;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
      {/* Logo */}
      <View style={styles.logoWrap}>
        {group.logoUrl ? (
          <Image
            source={group.logoUrl as any}
            style={styles.logo}
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

      {/* Infos */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{group.name}</Text>
          {group.koreanName && (
            <Text style={styles.koreanName}>{group.koreanName}</Text>
          )}
        </View>

        <View style={styles.metaRow}>
          {group.company && <Text style={styles.meta}>{group.company}</Text>}
          {group.generation && (
            <>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.meta}>{group.generation}</Text>
            </>
          )}
          {group.status && group.status !== "active" && (
            <>
              <Text style={styles.metaDot}>·</Text>
              <Text
                style={[
                  styles.meta,
                  group.status === "disbanded" && { color: Colors.danger },
                  group.status === "hiatus" && { color: Colors.warning },
                ]}
              >
                {group.status === "disbanded" ? "Disbandé" : "Hiatus"}
              </Text>
            </>
          )}
        </View>

        {/* Barre de progression */}
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${completionPct}%` as any },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {group.ownedPhotocards ?? 0}/{group.totalPhotocards}
          </Text>
          <Text style={styles.progressPct}>{completionPct}%</Text>
        </View>
      </View>

      {/* Chevron */}
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
};

// ─── Lettre de séparation alphabétique ───────────────────────────────────────

const AlphaHeader: React.FC<{ letter: string }> = ({ letter }) => (
  <View style={styles.alphaHeader}>
    <Text style={styles.alphaText}>{letter}</Text>
  </View>
);

// ─── Page principale ──────────────────────────────────────────────────────────

export default function MyGroupsScreen() {
  const [query, setQuery] = useState("");
  const { groups } = useGroups(true);

  // Filtre + tri alphabétique
  const filteredGroups = useMemo(() => {
    const q = query.toLowerCase().trim();
    return [...groups]
      .filter(
        (g) =>
          !q ||
          g.name.toLowerCase().includes(q) ||
          g.koreanName?.toLowerCase().includes(q) ||
          g.company?.toLowerCase().includes(q),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [query]);

  // Groupes par lettre pour les séparateurs alphabétiques
  const groupedByLetter = useMemo(() => {
    const map = new Map<string, Group[]>();
    filteredGroups.forEach((g) => {
      const letter = g.name[0].toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(g);
    });
    return map;
  }, [filteredGroups]);

  const handlePressGroup = (groupId: string) => {
    router.push(`/group/${groupId}`);
  };

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
      {filteredGroups.length === 0 ? (
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
            onPressGroup={handlePressGroup}
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
