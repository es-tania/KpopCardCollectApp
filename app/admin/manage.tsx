import {
  AdminSearchBar,
  AdminTabBar,
  AlbumManageRow,
  GroupManageRow,
} from "@/src/components/admin";
import { MOCK_ALBUMS } from "@/src/data/mockAlbums";
import { MOCK_GROUPS } from "@/src/data/mockGroups";
import { MOCK_PHOTOCARDS } from "@/src/data/mockPhotocards";
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
import { Album, Group, PhotocardWithDetails } from "../../src/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = "photocards" | "albums" | "groups";

const TABS = [
  { key: "photocards", label: "Photocards", count: MOCK_PHOTOCARDS.length },
  { key: "albums", label: "Albums", count: MOCK_ALBUMS.length },
  { key: "groups", label: "Groupes", count: MOCK_GROUPS.length },
];

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ManageScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>("photocards");
  const [query, setQuery] = useState("");

  // ── Données filtrées ────────────────────────────────────────────────────

  const filteredPhotocards = useMemo((): PhotocardWithDetails[] => {
    const q = query.toLowerCase();
    if (!q) return MOCK_PHOTOCARDS;
    return MOCK_PHOTOCARDS.filter(
      (c) =>
        c.memberName.toLowerCase().includes(q) ||
        c.groupName.toLowerCase().includes(q) ||
        c.albumTitle.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.version?.toLowerCase().includes(q),
    );
  }, [query]);

  const filteredAlbums = useMemo((): Album[] => {
    const q = query.toLowerCase();
    if (!q) return MOCK_ALBUMS;
    return MOCK_ALBUMS.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.eventName?.toLowerCase().includes(q),
    );
  }, [query]);

  const filteredGroups = useMemo((): Group[] => {
    const q = query.toLowerCase();
    if (!q) return MOCK_GROUPS;
    return MOCK_GROUPS.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.company?.toLowerCase().includes(q) ||
        g.generation?.toLowerCase().includes(q),
    );
  }, [query]);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key as TabKey);
    setQuery("");
  }, []);

  // Photocards
  const handleEditPhotocard = useCallback((id: string) => {
    router.push(`/admin/edit-photocard?id=${id}`);
  }, []);

  const handleDeletePhotocard = useCallback((card: PhotocardWithDetails) => {
    confirmDelete(
      "la photocard",
      `${card.memberName} — ${card.albumTitle}`,
      () => {
        Alert.alert("✅ Supprimée", "Photocard supprimée.");
        // TODO: API delete
      },
    );
  }, []);

  // Albums
  const handleEditAlbum = useCallback((id: string) => {
    router.push(`/admin/edit-album?id=${id}`);
  }, []);

  const handleDeleteAlbum = useCallback((album: Album) => {
    confirmDelete("l'album", album.title, () => {
      Alert.alert("✅ Supprimé", "Album supprimé.");
      // TODO: API delete
    });
  }, []);

  // Groupes
  const handleEditGroup = useCallback((id: string) => {
    router.push(`/admin/edit-group?id=${id}`);
  }, []);

  const handleDeleteGroup = useCallback((group: Group) => {
    confirmDelete("le groupe", group.name, () => {
      Alert.alert("✅ Supprimé", "Groupe supprimé.");
      // TODO: API delete
    });
  }, []);

  // ── Compteur résultats ───────────────────────────────────────────────────

  const resultCount = useMemo(() => {
    switch (activeTab) {
      case "photocards":
        return filteredPhotocards.length;
      case "albums":
        return filteredAlbums.length;
      case "groups":
        return filteredGroups.length;
    }
  }, [activeTab, filteredPhotocards, filteredAlbums, filteredGroups]);

  const totalCount = useMemo(() => {
    switch (activeTab) {
      case "photocards":
        return MOCK_PHOTOCARDS.length;
      case "albums":
        return MOCK_ALBUMS.length;
      case "groups":
        return MOCK_GROUPS.length;
    }
  }, [activeTab]);

  // ── Placeholder vide ─────────────────────────────────────────────────────

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🔍</Text>
      <Text style={styles.emptyText}>Aucun résultat pour "{query}"</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Gérer le contenu</Text>
        {/* Bouton ajouter contextuel */}
        <View style={styles.navBtn}></View>
      </View>

      {/* ── Onglets ── */}
      <AdminTabBar
        tabs={TABS}
        activeKey={activeTab}
        onSelect={handleTabChange}
      />

      {/* ── Barre de recherche ── */}
      <View style={styles.searchWrap}>
        <AdminSearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={
            activeTab === "photocards"
              ? "Membre, groupe, album, type..."
              : activeTab === "albums"
                ? "Titre, type, event..."
                : "Nom du groupe, agence..."
          }
        />
      </View>

      {/* ── Compteur ── */}
      {query.length > 0 && (
        <View style={styles.countBar}>
          <Text style={styles.countText}>
            <Text style={styles.countNum}>{resultCount}</Text> / {totalCount}{" "}
            résultat{resultCount !== 1 ? "s" : ""}
          </Text>
        </View>
      )}

      {/* ── Contenu par onglet ── */}

      {activeTab === "albums" && (
        <FlatList
          data={filteredAlbums}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const group = MOCK_GROUPS.find((g) => g.id === item.groupId);
            return (
              <AlbumManageRow
                album={item}
                groupName={group?.name}
                onEdit={() => handleEditAlbum(item.id)}
                onDelete={() => handleDeleteAlbum(item)}
              />
            );
          }}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            filteredAlbums.length === 0 ? styles.emptyContainer : undefined
          }
        />
      )}

      {activeTab === "groups" && (
        <FlatList
          data={filteredGroups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GroupManageRow
              group={item}
              onEdit={() => handleEditGroup(item.id)}
              onDelete={() => handleDeleteGroup(item)}
            />
          )}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            filteredGroups.length === 0 ? styles.emptyContainer : undefined
          }
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
  navTitle: {
    flex: 1,
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
    textAlign: "center",
    marginHorizontal: Theme.spacing.sm,
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
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 60,
  },
  emptyEmoji: { fontSize: 36 },
  emptyText: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
    textAlign: "center",
  },
});
