import { AdminSearchBar, GroupManageRow } from "@/src/components/admin";
import { useTranslation } from "@/src/hooks/useTranslation";
import { GroupEditForm } from "@/src/components/admin/group/GroupEditForm";
import { STATUS_FILTER_OPTIONS } from "@/src/constants/options";
import { useEditGroup } from "@/src/hooks/group/useEditGroup";
import { useGroups } from "@/src/hooks/group/useGroups";
import { groupsService } from "@/src/services";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Filter } from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
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
  Group,
  GroupFormState,
  MemberFormState,
  StatusFilter,
  ViewMode,
} from "../../src/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const confirmDelete = (name: string, onConfirm: () => void) => {
  Alert.alert(
    "Supprimer le groupe",
    `Es-tu sûre de vouloir supprimer "${name}" ? Tous ses membres, albums et photocards seront également supprimés.`,
    [
      { text: t("common.cancel"), style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: onConfirm },
    ],
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditGroupScreen() {
  const { t } = useTranslation();
  const { id: preselectedId } = useLocalSearchParams<{ id?: string }>();

  const { groups, loading: groupsLoading, refetch } = useGroups();

  const [viewMode, setViewMode] = useState<ViewMode>("search");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  // const [saving, setSaving] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // ── Filtres ─────────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filterAnim = useRef(new Animated.Value(1)).current;

  const { loading, progress, error, submit } = useEditGroup(async () => {
    await refetch();
    Alert.alert("✅ Enregistré", "Le groupe a été modifié avec succès.", [
      {
        text: "OK",
        onPress: () => {
          setViewMode("search");
          setSelectedGroup(null);
        },
      },
    ]);
  });

  const toggleFilters = useCallback(() => {
    setShowFilters((v) => !v);
    Animated.spring(filterAnim, {
      toValue: showFilters ? 0 : 1,
      useNativeDriver: false,
      tension: 80,
      friction: 12,
    }).start();
  }, [showFilters, filterAnim]);

  // Présélection depuis manage.tsx
  useEffect(() => {
    if (preselectedId && groups.length > 0) {
      const group = groups.find((g) => g.id === preselectedId);
      if (group) {
        setSelectedGroup(group);
        setViewMode("edit");
      }
    }
  }, [preselectedId, groups]);

  // Affiche l'erreur API
  useEffect(() => {
    if (error) Alert.alert("Erreur", error);
  }, [error]);

  // ── Groupes filtrés ──────────────────────────────────────────────────────

  const filteredGroups = useMemo(() => {
    return [...groups]
      .filter((g) => {
        if (statusFilter !== "all") {
          const groupStatus = g.status ?? "active";
          if (groupStatus !== statusFilter) return false;
        }
        if (query) {
          const q = query.toLowerCase();
          return (
            g.name.toLowerCase().includes(q) ||
            g.koreanName?.toLowerCase().includes(q) ||
            g.company?.toLowerCase().includes(q) ||
            g.generation?.toLowerCase().includes(q) ||
            g.fandomName?.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [groups, query, statusFilter]);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleSelectGroup = useCallback((group: Group) => {
    setSelectedGroup(group);
    setViewMode("edit");
  }, []);

  const handleDeleteGroup = useCallback(
    (group: Group) => {
      Alert.alert(
        "Supprimer le groupe",
        `Es-tu sûre de vouloir supprimer "${group.name}" ? Tous ses membres, albums et photocards seront supprimés.`,
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: async () => {
              try {
                await groupsService.delete(group.id);
                await refetch();
                Alert.alert("✅ Supprimé", "Groupe supprimé.");
              } catch (err: any) {
                Alert.alert("Erreur", err.message);
              }
            },
          },
        ],
      );
    },
    [refetch],
  );

  const handleSave = useCallback(
    async (form: GroupFormState, members: MemberFormState[]) => {
      if (!selectedGroup) return;
      await submit(selectedGroup.id, form, members, selectedGroup);
    },
    [selectedGroup, submit],
  );

  const handleCancel = useCallback(() => {
    setViewMode("search");
    setSelectedGroup(null);
  }, []);

  const handleBack = useCallback(() => {
    if (viewMode === "edit") {
      Alert.alert(
        "Abandonner les modifications ?",
        "Les changements non sauvegardés seront perdus.",
        [
          { text: "Continuer l'édition", style: "cancel" },
          { text: "Abandonner", style: "destructive", onPress: handleCancel },
        ],
      );
    } else {
      router.back();
    }
  }, [viewMode, handleCancel]);

  // ── Titre navbar ─────────────────────────────────────────────────────────

  const navTitle =
    viewMode === "edit" && selectedGroup
      ? selectedGroup.name
      : "Modifier un groupe";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={handleBack}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {navTitle}
        </Text>
        {viewMode === "search" ? (
          <TouchableOpacity
            style={[styles.navBtn, showFilters && styles.navBtnActive]}
            onPress={toggleFilters}
          >
            <Filter
              size={17}
              color={showFilters ? Colors.accent : Colors.text}
              strokeWidth={1.6}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.navBtn} />
        )}
      </View>

      {/* ── MODE SEARCH ── */}
      {viewMode === "search" && (
        <>
          {/* Filtres animés */}
          <Animated.View
            style={[
              styles.filtersPanel,
              {
                maxHeight: filterAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 100],
                }),
                opacity: filterAnim,
              },
            ]}
          >
            <View style={styles.filtersPanelInner}>
              {/* Pills statut */}
              <View style={styles.statusPills}>
                {STATUS_FILTER_OPTIONS.map((sf) => (
                  <TouchableOpacity
                    key={sf.key}
                    style={[
                      styles.statusPill,
                      statusFilter === sf.key && styles.statusPillActive,
                      sf.key === "hiatus" && styles.statusPillHiatus,
                      sf.key === "disbanded" && styles.statusPillDisbanded,
                      statusFilter === sf.key &&
                        sf.key === "hiatus" &&
                        styles.statusPillHiatusActive,
                      statusFilter === sf.key &&
                        sf.key === "disbanded" &&
                        styles.statusPillDisbandedActive,
                    ]}
                    onPress={() => setStatusFilter(sf.key)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        statusFilter === sf.key && styles.statusPillTextActive,
                        statusFilter === sf.key &&
                          sf.key === "hiatus" &&
                          styles.statusPillTextHiatus,
                        statusFilter === sf.key &&
                          sf.key === "disbanded" &&
                          styles.statusPillTextDisbanded,
                      ]}
                    >
                      {sf.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Recherche */}
          <View style={styles.searchWrap}>
            <AdminSearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Nom, agence, génération, fandom..."
            />
          </View>

          {/* Compteur */}
          <View style={styles.countBar}>
            <Text style={styles.countText}>
              <Text style={styles.countNum}>{filteredGroups.length}</Text>{" "}
              groupe{filteredGroups.length !== 1 ? "s" : ""}
            </Text>
          </View>

          {/* Liste */}
          {groupsLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={Colors.accent} />
            </View>
          ) : (
            <FlatList
              data={filteredGroups}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <GroupManageRow
                  group={item}
                  onEdit={() => handleSelectGroup(item)}
                  onDelete={() => handleDeleteGroup(item)}
                />
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>🔍</Text>
                  <Text style={styles.emptyTitle}>Aucun groupe trouvé</Text>
                  <Text style={styles.emptySubtitle}>
                    Essaie de changer les filtres
                  </Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}

      {/* ── MODE EDIT ── */}
      {viewMode === "edit" && selectedGroup && (
        <GroupEditForm
          group={selectedGroup}
          onSave={handleSave}
          onCancel={handleCancel}
          loading={loading}
          progress={progress}
        />
      )}
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
  navBtnActive: {
    backgroundColor: Colors.pillActive,
    borderColor: Colors.borderActive,
  },
  navTitle: {
    flex: 1,
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
    textAlign: "center",
    marginHorizontal: Theme.spacing.sm,
  },

  // Filtres
  filtersPanel: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    overflow: "hidden",
  },
  filtersPanelInner: {
    padding: Theme.spacing.lg,
  },
  statusPills: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  statusPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
  },
  statusPillActive: {
    backgroundColor: Colors.pillActive,
    borderColor: Colors.borderActive,
  },
  statusPillHiatus: {},
  statusPillDisbanded: {},
  statusPillHiatusActive: {
    backgroundColor: "rgba(250,199,117,0.15)",
    borderColor: "rgba(250,199,117,0.4)",
  },
  statusPillDisbandedActive: {
    backgroundColor: "rgba(240,112,112,0.1)",
    borderColor: "rgba(240,112,112,0.3)",
  },
  statusPillText: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  statusPillTextActive: {
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
  statusPillTextHiatus: {
    color: Colors.warning,
  },
  statusPillTextDisbanded: {
    color: Colors.danger,
  },

  // Recherche
  searchWrap: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },

  // Compteur
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
  countFilter: {
    color: Colors.textMuted,
  },

  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Empty
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 10,
  },
  emptyEmoji: { fontSize: 36 },
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
