import { AdminSearchBar, AlbumManageRow } from "@/src/components/admin";
import { AlbumEditForm } from "@/src/components/admin/album/AlbumEditForm";
import { FilterSelector } from "@/src/components/admin/FilterSelector";
import { MOCK_ALBUMS, MOCK_GROUPS } from "@/src/data";
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
  const { id: preselectedId } = useLocalSearchParams<{ id?: string }>();

  const [viewMode, setViewMode] = useState<ViewMode>("search");
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [saving, setSaving] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // ── Filtres ─────────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const filterAnim = useRef(new Animated.Value(1)).current;

  const toggleFilters = useCallback(() => {
    setShowFilters((v) => !v);
    Animated.spring(filterAnim, {
      toValue: showFilters ? 0 : 1,
      useNativeDriver: false,
      tension: 80,
      friction: 12,
    }).start();
  }, [showFilters, filterAnim]);

  // Présélection si on arrive depuis manage.tsx
  useEffect(() => {
    if (preselectedId) {
      const album = MOCK_ALBUMS.find((a) => a.id === preselectedId);
      if (album) {
        setSelectedAlbum(album);
        setViewMode("edit");
      }
    }
  }, [preselectedId]);

  // ── Options filtres ──────────────────────────────────────────────────────

  const groupOptions = useMemo(
    () =>
      MOCK_GROUPS.map((g) => ({
        id: g.id,
        label: g.name,
        sublabel: g.company,
      })),
    [],
  );

  // ── Albums filtrés ───────────────────────────────────────────────────────

  const filteredAlbums = useMemo(() => {
    return MOCK_ALBUMS.filter((a) => {
      if (selectedGroupId && a.groupId !== selectedGroupId) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.koreanTitle?.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q) ||
          a.eventName?.toLowerCase().includes(q) ||
          a.eventLocation?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedGroupId, query]);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleSelectAlbum = useCallback((album: Album) => {
    setSelectedAlbum(album);
    setViewMode("edit");
  }, []);

  const handleDeleteAlbum = useCallback((album: Album) => {
    confirmDelete(album.title, () => {
      Alert.alert("✅ Supprimé", "Album supprimé.");
      // TODO: API delete
    });
  }, []);

  const handleSave = useCallback(async (data: AlbumEditFormState) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    Alert.alert("✅ Enregistré", "L'album a été modifié avec succès.", [
      {
        text: "OK",
        onPress: () => {
          setViewMode("search");
          setSelectedAlbum(null);
        },
      },
    ]);
    // TODO: appel API update
  }, []);

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

  // ── Titre navbar ─────────────────────────────────────────────────────────

  const navTitle =
    viewMode === "edit" && selectedAlbum
      ? selectedAlbum.title
      : "Modifier un album";

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
                ` · ${MOCK_GROUPS.find((g) => g.id === selectedGroupId)?.name}`}
            </Text>
          </View>

          {/* Liste */}
          <FlatList
            data={filteredAlbums}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const group = MOCK_GROUPS.find((g) => g.id === item.groupId);
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
        </>
      )}

      {/* ── MODE EDIT ── */}
      {viewMode === "edit" && selectedAlbum && (
        <AlbumEditForm
          album={selectedAlbum}
          onSave={handleSave}
          onCancel={handleCancel}
          loading={saving}
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
});
