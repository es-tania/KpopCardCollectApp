import {
    ExportFilterSection,
    ExportLayout,
    ExportLayoutPicker,
    ExportPreviewGrid,
    ExportStyle,
    ExportStylePicker,
} from "@/src/components/export";
import {
    EXPORT_INFO_OPTIONS,
    PHOTOCARD_FILTER_OPTIONS,
} from "@/src/constants/options";
import { SOURCE_OPTIONS } from "@/src/constants/options/sourceOptions";
import {
    MOCK_ALBUMS,
    MOCK_GROUPS,
    MOCK_MEMBERS,
    MOCK_PHOTOCARDS,
} from "@/src/data";
import { SelectOption } from "@/src/types";
import { router } from "expo-router";
import {
    ChevronDown,
    ChevronLeft,
    ChevronUp,
    Download,
    Share2,
} from "lucide-react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    Alert,
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../src/constants/colors";
import { Theme } from "../src/constants/theme";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExportScreen() {
  // ── Filtres ─────────────────────────────────────────────────────────────
  const [selectedSource, setSelectedSource] = useState<string[]>([
    "collection",
  ]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedAlbums, setSelectedAlbums] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["all"]);

  // ── Apparence ────────────────────────────────────────────────────────────
  const [layout, setLayout] = useState<ExportLayout>("grid_3");
  const [exportStyle, setExportStyle] = useState<ExportStyle>("dark");
  const [selectedInfos, setSelectedInfos] = useState<string[]>([
    "show_member",
    "show_album",
  ]);

  // ── Sélection cartes ─────────────────────────────────────────────────────
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(
    new Set(),
  );

  // ── Panneau filtres ──────────────────────────────────────────────────────
  const [showFilters, setShowFilters] = useState(true);
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

  // ── Options dynamiques ────────────────────────────────────────────────────

  const groupChips: SelectOption[] = useMemo(
    () => MOCK_GROUPS.map((g) => ({ key: g.id, label: g.name })),
    [],
  );

  const albumChips: SelectOption[] = useMemo(() => {
    if (selectedGroups.length === 0)
      return MOCK_ALBUMS.map((a) => ({ key: a.id, label: a.title }));
    return MOCK_ALBUMS.filter((a) => selectedGroups.includes(a.groupId)).map(
      (a) => ({ key: a.id, label: a.title }),
    );
  }, [selectedGroups]);

  const memberChips: SelectOption[] = useMemo(() => {
    if (selectedGroups.length === 0)
      return MOCK_MEMBERS.map((m) => ({ key: m.id, label: m.stageName }));
    return MOCK_MEMBERS.filter((m) => selectedGroups.includes(m.groupId)).map(
      (m) => ({ key: m.id, label: m.stageName }),
    );
  }, [selectedGroups]);

  // ── Cartes filtrées ───────────────────────────────────────────────────────

  const filteredCards = useMemo(() => {
    return MOCK_PHOTOCARDS.filter((c) => {
      // Source
      const sourceOk =
        selectedSource.includes("all") ||
        (selectedSource.includes("collection") && c.isInCollection) ||
        (selectedSource.includes("wishlist") && c.isWishlisted) ||
        (selectedSource.includes("favorites") && c.isFavorite);
      if (!sourceOk) return false;

      // Groupe
      if (selectedGroups.length > 0 && !selectedGroups.includes(c.groupId))
        return false;

      // Album
      if (selectedAlbums.length > 0 && !selectedAlbums.includes(c.albumId))
        return false;

      // Membre
      if (selectedMembers.length > 0 && !selectedMembers.includes(c.memberId))
        return false;

      // Type
      if (!selectedTypes.includes("all") && !selectedTypes.includes(c.type))
        return false;

      return true;
    });
  }, [
    selectedSource,
    selectedGroups,
    selectedAlbums,
    selectedMembers,
    selectedTypes,
  ]);

  // Init sélection quand les cartes changent
  const prevFilteredIds = useRef<string[]>([]);
  useMemo(() => {
    const newIds = filteredCards.map((c) => c.id);
    const changed =
      JSON.stringify(newIds) !== JSON.stringify(prevFilteredIds.current);
    if (changed) {
      setSelectedCardIds(new Set(newIds));
      prevFilteredIds.current = newIds;
    }
  }, [filteredCards]);

  // ── Handlers filtres ──────────────────────────────────────────────────────

  const toggleChip = useCallback(
    (
      key: string,
      selected: string[],
      setSelected: (v: string[]) => void,
      exclusive?: boolean,
    ) => {
      if (exclusive) {
        setSelected([key]);
        return;
      }
      setSelected(
        selected.includes(key)
          ? selected.filter((k) => k !== key)
          : [...selected, key],
      );
    },
    [],
  );

  // ── Handlers sélection cartes ─────────────────────────────────────────────

  const handleToggleCard = useCallback((id: string) => {
    setSelectedCardIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedCardIds(new Set(filteredCards.map((c) => c.id)));
  }, [filteredCards]);

  const handleDeselectAll = useCallback(() => {
    setSelectedCardIds(new Set());
  }, []);

  // ── Export ────────────────────────────────────────────────────────────────

  const handleExport = useCallback(() => {
    if (selectedCardIds.size === 0) {
      Alert.alert("Aucune carte", "Sélectionne au moins une carte à exporter.");
      return;
    }
    Alert.alert(
      "Exporter",
      `Génération d'une image avec ${selectedCardIds.size} carte${selectedCardIds.size > 1 ? "s" : ""}...`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Générer",
          onPress: () => {
            // TODO: ViewShot + expo-media-library pour capturer et sauvegarder
            Alert.alert("✅ Image générée !", "Sauvegardée dans ta galerie.");
          },
        },
      ],
    );
  }, [selectedCardIds]);

  const handleShare = useCallback(() => {
    if (selectedCardIds.size === 0) {
      Alert.alert("Aucune carte", "Sélectionne au moins une carte à partager.");
      return;
    }
    // TODO: expo-sharing
    Alert.alert("Partager", "Fonctionnalité de partage à venir.");
  }, [selectedCardIds]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Exporter mes cartes</Text>
        <TouchableOpacity style={styles.navBtn} onPress={handleShare}>
          <Share2 size={18} color={Colors.text} strokeWidth={1.6} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Panneau filtres ── */}
        <View style={styles.filterHeader}>
          <Text style={styles.filterHeaderTitle}>Filtres</Text>
          <TouchableOpacity
            style={styles.filterToggleBtn}
            onPress={toggleFilters}
            activeOpacity={0.75}
          >
            <Text style={styles.filterToggleText}>
              {showFilters ? "Masquer" : "Afficher"}
            </Text>
            {showFilters ? (
              <ChevronUp size={14} color={Colors.accent} strokeWidth={1.8} />
            ) : (
              <ChevronDown size={14} color={Colors.accent} strokeWidth={1.8} />
            )}
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.filtersPanel,
            {
              maxHeight: filterAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 600],
              }),
              opacity: filterAnim,
            },
          ]}
        >
          <View style={styles.filtersPanelInner}>
            {/* Source */}
            <ExportFilterSection
              title="Source des cartes"
              chips={SOURCE_OPTIONS}
              selected={selectedSource}
              onSelect={(key) =>
                toggleChip(key, selectedSource, setSelectedSource)
              }
            />

            {/* Groupe */}
            <ExportFilterSection
              title="Groupe"
              chips={groupChips}
              selected={selectedGroups}
              onSelect={(key) =>
                toggleChip(key, selectedGroups, (v) => {
                  setSelectedGroups(v);
                  setSelectedAlbums([]);
                  setSelectedMembers([]);
                })
              }
            />

            {/* Album */}
            <ExportFilterSection
              title="Album"
              chips={albumChips}
              selected={selectedAlbums}
              onSelect={(key) =>
                toggleChip(key, selectedAlbums, setSelectedAlbums)
              }
            />

            {/* Membre */}
            <ExportFilterSection
              title="Membre"
              chips={memberChips}
              selected={selectedMembers}
              onSelect={(key) =>
                toggleChip(key, selectedMembers, setSelectedMembers)
              }
            />

            {/* Type */}
            <ExportFilterSection
              title="Type de carte"
              chips={PHOTOCARD_FILTER_OPTIONS}
              selected={selectedTypes}
              onSelect={(key) => {
                if (key === "all") {
                  setSelectedTypes(["all"]);
                } else {
                  const without = selectedTypes.filter((k) => k !== "all");
                  toggleChip(key, without, setSelectedTypes);
                }
              }}
            />
          </View>
        </Animated.View>

        <View style={styles.divider} />

        {/* ── Apparence ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apparence</Text>
          <ExportLayoutPicker value={layout} onChange={setLayout} />
          <ExportStylePicker value={exportStyle} onChange={setExportStyle} />

          {/* Infos affichées sur les cartes */}
          <ExportFilterSection
            title="Informations affichées"
            chips={EXPORT_INFO_OPTIONS}
            selected={selectedInfos}
            onSelect={(key) => toggleChip(key, selectedInfos, setSelectedInfos)}
          />
        </View>

        <View style={styles.divider} />

        {/* ── Sélection cartes ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cartes à exporter</Text>
          <ExportPreviewGrid
            cards={filteredCards}
            selectedIds={selectedCardIds}
            onToggleCard={handleToggleCard}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
          />
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* ── Bouton export fixe en bas ── */}
      <View style={styles.exportBar}>
        <View style={styles.exportBarInfo}>
          <Text style={styles.exportBarCount}>
            {selectedCardIds.size} carte{selectedCardIds.size !== 1 ? "s" : ""}
          </Text>
          <Text style={styles.exportBarSub}>
            sélectionnée{selectedCardIds.size !== 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.exportBtn,
            selectedCardIds.size === 0 && styles.exportBtnDisabled,
          ]}
          onPress={handleExport}
          disabled={selectedCardIds.size === 0}
          activeOpacity={0.8}
        >
          <Download size={18} color={Colors.bg} strokeWidth={2} />
          <Text style={styles.exportBtnText}>Générer l'image</Text>
        </TouchableOpacity>
      </View>
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
  scroll: { flex: 1 },

  // Filtres
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.sm,
  },
  filterHeaderTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  filterToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  filterToggleText: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.accent,
  },
  filtersPanel: {
    overflow: "hidden",
  },
  filtersPanelInner: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.lg,
    gap: Theme.spacing.lg,
  },

  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginHorizontal: Theme.spacing.lg,
  },

  // Sections
  section: {
    padding: Theme.spacing.lg,
    gap: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },

  // Barre export
  exportBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  exportBarInfo: {
    flex: 1,
  },
  exportBarCount: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.accent,
  },
  exportBarSub: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.accent,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
  },
  exportBtnDisabled: {
    opacity: 0.4,
  },
  exportBtnText: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.bg,
  },
  bottomPad: { height: 20 },
});
