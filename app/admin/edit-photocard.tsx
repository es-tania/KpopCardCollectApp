import { AdminSearchBar } from "@/src/components/admin";
import { FilterSelector } from "@/src/components/admin/FilterSelector";
import { PhotocardManageRow } from "@/src/components/admin/photocard/PhotocardManageRow";
import { PhotocardModal } from "@/src/components/photocard/PhotocardModal";
import { useAlbums } from "@/src/hooks/album/useAlbums";
import { useGroupMembers } from "@/src/hooks/group/useGroupMembers";
import { useGroups } from "@/src/hooks/group/useGroups";
import { useEditPhotocard } from "@/src/hooks/photocard/useEditPhotocard";
import { usePhotocards } from "@/src/hooks/photocard/usePhotocards";
import { photocardsService, storageService } from "@/src/services";
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
import { PhotocardWithDetails, ViewMode } from "../../src/types";

// ─── Helpers suppression ──────────────────────────────────────────────────────

const confirmDelete = (label: string, name: string, onConfirm: () => void) => {
  Alert.alert(
    `Supprimer ${label}`,
    `Es-tu sûre de vouloir supprimer "${name}" ? Cette action est irréversible.`,
    [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: onConfirm },
    ],
  );
};

// ─── Page principale ──────────────────────────────────────────────────────────

export default function EditPhotocardScreen() {
  const { id: preselectedId } = useLocalSearchParams<{ id?: string }>();
  const [selectedCard, setSelectedCard] = useState<PhotocardWithDetails | null>(
    null,
  );

  const [viewMode, setViewMode] = useState<ViewMode>("search");
  const [previewCard, setPreviewCard] = useState<PhotocardWithDetails | null>(
    null,
  );
  const [showFilters, setShowFilters] = useState(true);

  // ── Filtres ─────────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Animation filtres
  const filterAnim = useRef(new Animated.Value(1)).current;

  const { photocards, loading: photocardsLoading, refetch } = usePhotocards();
  const { groups } = useGroups();

  const { loading, progress, error, submit } = useEditPhotocard(async () => {
    await refetch();
    Alert.alert("✅ Enregistré", "La photocard a été modifiée.", [
      {
        text: "OK",
        onPress: () => {
          setViewMode("search");
          setSelectedCard(null);
        },
      },
    ]);
  });

  useEffect(() => {
    if (error) Alert.alert("Erreur", error);
  }, [error]);

  useEffect(() => {
    if (!preselectedId) return;

    // Charge la carte directement depuis la BDD
    photocardsService.getById(preselectedId).then((card) => {
      if (card) {
        setSelectedCard(card);
        setViewMode("edit");
      }
    });
  }, [preselectedId]);

  const toggleFilters = useCallback(() => {
    setShowFilters((v) => !v);
    Animated.spring(filterAnim, {
      toValue: showFilters ? 0 : 1,
      useNativeDriver: false,
      tension: 80,
      friction: 12,
    }).start();
  }, [showFilters, filterAnim]);

  // ── Options des filtres ──────────────────────────────────────────────────

  const groupOptions = useMemo(
    () => groups.map((g) => ({ id: g.id, label: g.name, sublabel: g.company })),
    [groups],
  );

  // Albums filtrés selon le groupe sélectionné
  const { albums: filteredAlbumOptions } = useAlbums(
    selectedGroupId ?? undefined,
  );

  const albumOptions = useMemo(
    () => filteredAlbumOptions.map((a) => ({ id: a.id, label: a.title })),
    [filteredAlbumOptions],
  );

  // Membres filtrés selon le groupe sélectionné
  const { members: filteredMemberOptions } = useGroupMembers(selectedGroupId);

  const memberOptions = useMemo(
    () => filteredMemberOptions.map((m) => ({ id: m.id, label: m.stageName })),
    [filteredMemberOptions],
  );

  // ── Photocards filtrées ──────────────────────────────────────────────────

  const filteredCards = useMemo(() => {
    return photocards.filter((c) => {
      if (selectedGroupId && c.groupId !== selectedGroupId) return false;
      if (selectedAlbumId && c.albumId !== selectedAlbumId) return false;
      if (selectedMemberId && c.memberId !== selectedMemberId) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          c.memberName.toLowerCase().includes(q) ||
          c.albumTitle.toLowerCase().includes(q) ||
          c.groupName.toLowerCase().includes(q) ||
          c.type.toLowerCase().includes(q) ||
          c.version?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [photocards, selectedGroupId, selectedAlbumId, selectedMemberId, query]);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleSelectGroup = useCallback((id: string | null) => {
    setSelectedGroupId(id);
    setSelectedAlbumId(null);
    setSelectedMemberId(null);
  }, []);

  const handleSelectCard = useCallback((card: PhotocardWithDetails) => {
    router.push({
      pathname: "/edit-photocard/[id]",
      params: { id: card.id },
    });
  }, []);

  const handlePreviewCard = useCallback((card: PhotocardWithDetails) => {
    setPreviewCard(card);
  }, []);

  const handleDeletePhotocard = useCallback(
    (card: PhotocardWithDetails) => {
      Alert.alert(
        "Supprimer la photocard",
        `Es-tu sûre de vouloir supprimer "${card.memberName} — ${card.albumTitle}" ? Cette action est irréversible.`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: async () => {
              try {
                // Supprime les images du bucket
                const imageUrl = extractUrl(card.imageUrl);
                const backImageUrl = extractUrl(card.backImageUrl);

                if (imageUrl)
                  await storageService.deleteFromUrl("photocards", imageUrl);
                if (backImageUrl)
                  await storageService.deleteFromUrl(
                    "photocards",
                    backImageUrl,
                  );

                // Supprime en BDD
                await photocardsService.delete(card.id);
                await refetch();

                Alert.alert("✅ Supprimée", "Photocard supprimée.");
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

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  // ── Titre navbar ─────────────────────────────────────────────────────────

  const navTitle =
    viewMode === "edit" && selectedCard
      ? `${selectedCard.memberName} — ${selectedCard.albumTitle}`
      : "Modifier une photocard";

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
        {viewMode === "search" && (
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
        )}
        {viewMode === "edit" && <View style={styles.navBtn} />}
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
                  outputRange: [0, 260],
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
                onSelect={handleSelectGroup}
              />
              <FilterSelector
                label="Album"
                value={selectedAlbumId}
                placeholder={
                  selectedGroupId
                    ? "Tous les albums"
                    : "Sélectionne d'abord un groupe"
                }
                options={albumOptions}
                onSelect={setSelectedAlbumId}
                disabled={!selectedGroupId}
              />
              <FilterSelector
                label="Membre"
                value={selectedMemberId}
                placeholder={
                  selectedGroupId
                    ? "Tous les membres"
                    : "Sélectionne d'abord un groupe"
                }
                options={memberOptions}
                onSelect={setSelectedMemberId}
                disabled={!selectedGroupId}
              />
            </View>
          </Animated.View>

          {/* Barre de recherche */}
          <View style={styles.searchWrap}>
            <AdminSearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Membre, album, type, version..."
            />
          </View>

          {/* Compteur */}
          <View style={styles.countBar}>
            <Text style={styles.countText}>
              <Text style={styles.countNum}>{filteredCards.length}</Text> carte
              {filteredCards.length !== 1 ? "s" : ""}
              {selectedGroupId &&
                ` · ${groups.find((g) => g.id === selectedGroupId)?.name}`}
              {selectedAlbumId &&
                ` · ${filteredAlbumOptions.find((a) => a.id === selectedAlbumId)?.title}`}
              {selectedMemberId &&
                ` · ${filteredMemberOptions.find((m) => m.id === selectedMemberId)?.stageName}`}
            </Text>
          </View>

          {/* Liste */}
          <FlatList
            data={filteredCards}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PhotocardManageRow
                card={item}
                onPreview={() => handlePreviewCard(item)}
                onEdit={() => handleSelectCard(item)}
                onDelete={() => handleDeletePhotocard(item)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={styles.emptyTitle}>Aucune carte trouvée</Text>
                <Text style={styles.emptySubtitle}>
                  Essaie d'affiner ou de changer les filtres
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {/* Modal aperçu au long press (optionnel) */}
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
    zIndex: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  filtersPanelInner: {
    padding: Theme.spacing.lg,
    gap: Theme.spacing.md,
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
