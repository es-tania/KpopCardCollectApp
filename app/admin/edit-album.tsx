import { AdminSearchBar, AlbumManageRow } from "@/src/components/admin";
import { AlbumEditForm } from "@/src/components/admin/album/AlbumEditForm";
import { FilterSelector } from "@/src/components/admin/FilterSelector";
import { useAlbums } from "@/src/hooks/album/useAlbums";
import { useEditAlbum } from "@/src/hooks/album/useEditAlbum";
import { useGroups } from "@/src/hooks/group/useGroups";
import { albumsService, storageService } from "@/src/services";
import { useAuthStore } from "@/src/store/authStore";
import { extractUrl } from "@/src/utils/extractUrl";
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
import { Album, AlbumEditFormState, ViewMode } from "../../src/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const confirmDelete = (name: string, onConfirm: () => void) => {
  Alert.alert(
    "Supprimer l'album",
    `Es-tu sûre de vouloir supprimer "${name}" ? Toutes ses photocards seront également supprimées.`,
    [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: onConfirm },
    ],
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditAlbumScreen() {
  const { isAdmin, groupAdminIds } = useAuthStore();
  const { id: preselectedId } = useLocalSearchParams<{ id?: string }>();
  const { albums, loading: albumsLoading, refetch } = useAlbums();
  const [viewMode, setViewMode] = useState<ViewMode>("search");
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [saving, setSaving] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // ── Filtres ─────────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const { groups } = useGroups();
  const filterAnim = useRef(new Animated.Value(1)).current;

  const { loading, progress, error, submit } = useEditAlbum(async () => {
    await refetch();
    Alert.alert("✅ Enregistré", "L'album a été modifié avec succès.", [
      {
        text: "OK",
        onPress: () => {
          setViewMode("search");
          setSelectedAlbum(null);
        },
      },
    ]);
  });

  useEffect(() => {
    if (preselectedId && albums.length > 0) {
      const album = albums.find((a) => a.id === preselectedId);
      if (album) {
        setSelectedAlbum(album);
        setViewMode("edit");
      }
    }
  }, [preselectedId, albums]);

  useEffect(() => {
    if (error) Alert.alert("Erreur", error);
  }, [error]);

  const toggleFilters = useCallback(() => {
    setShowFilters((v) => !v);
    Animated.spring(filterAnim, {
      toValue: showFilters ? 0 : 1,
      useNativeDriver: false,
      tension: 80,
      friction: 12,
    }).start();
  }, [showFilters, filterAnim]);

  // ── Options filtres ──────────────────────────────────────────────────────

  const accessibleGroups = useMemo(
    () => groups.filter((g) => isAdmin || groupAdminIds.includes(g.id)),
    [groups, isAdmin, groupAdminIds],
  );

  const groupOptions = useMemo(
    () =>
      accessibleGroups.map((g) => ({
        id: g.id,
        label: g.name,
        sublabel: g.company,
      })),
    [accessibleGroups],
  );

  // ── Albums filtrés ───────────────────────────────────────────────────────

  const filteredAlbums = useMemo(() => {
    return albums.filter((a) => {
      // Filtre par droits d'accès
      if (!isAdmin && !groupAdminIds.includes(a.groupId)) return false;

      // Filtres de recherche existants
      if (selectedGroupId && a.groupId !== selectedGroupId) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.groupName?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [albums, isAdmin, groupAdminIds, selectedGroupId, query]);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleSelectAlbum = useCallback((album: Album) => {
    setSelectedAlbum(album);
    setViewMode("edit");
  }, []);

  const handleDeleteAlbum = useCallback(
    (album: Album) => {
      Alert.alert(
        "Supprimer l'album",
        `Es-tu sûre de vouloir supprimer "${album.title}" ?`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: async () => {
              try {
                // Supprime la cover du bucket
                const coverUrl = extractUrl(album.coverUrl);
                if (coverUrl) {
                  await storageService.deleteFromUrl("album-covers", coverUrl);
                }
                await albumsService.delete(album.id);
                await refetch();
                Alert.alert("✅ Supprimé", "Album supprimé.");
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
    async (data: AlbumEditFormState) => {
      if (!selectedAlbum) return;
      await submit(selectedAlbum.id, data, selectedAlbum);
    },
    [selectedAlbum, submit],
  );

  const handleCancel = useCallback(() => {
    setViewMode("search");
    setSelectedAlbum(null);
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

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={handleBack}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {viewMode === "edit" && selectedAlbum
            ? selectedAlbum.title
            : "Modifier un album"}
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
          {/* Filtre groupe */}
          <Animated.View
            style={[
              styles.filtersPanel,
              {
                maxHeight: filterAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 120],
                }),
                opacity: filterAnim,
              },
            ]}
          >
            <View style={styles.filtersPanelInner}>
              <FilterSelector
                label="Groupe"
                value={selectedGroupId}
                placeholder="Tous les groupes"
                options={groupOptions}
                onSelect={setSelectedGroupId}
              />
            </View>
          </Animated.View>

          {/* Recherche */}
          <View style={styles.searchWrap}>
            <AdminSearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Titre, type, event, lieu..."
            />
          </View>

          {/* Compteur */}
          <View style={styles.countBar}>
            <Text style={styles.countText}>
              <Text style={styles.countNum}>{filteredAlbums.length}</Text> album
              {filteredAlbums.length !== 1 ? "s" : ""}
              {selectedGroupId &&
                ` · ${groups.find((g) => g.id === selectedGroupId)?.name}`}
            </Text>
          </View>

          {/* Liste */}
          {albumsLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={Colors.accent} />
            </View>
          ) : (
            <FlatList
              data={filteredAlbums}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const group = groups.find((g) => g.id === item.groupId);
                return (
                  <AlbumManageRow
                    album={item}
                    groupName={group?.name}
                    onEdit={() => handleSelectAlbum(item)}
                    onDelete={() => handleDeleteAlbum(item)}
                  />
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>🔍</Text>
                  <Text style={styles.emptyTitle}>Aucun album trouvé</Text>
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
      {viewMode === "edit" && selectedAlbum && (
        <AlbumEditForm
          album={selectedAlbum}
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
  filtersPanel: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    overflow: "hidden",
  },
  filtersPanelInner: {
    padding: Theme.spacing.lg,
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
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
