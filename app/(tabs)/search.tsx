import { useGroups } from "@/src/hooks/group/useGroups";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GroupCard } from "../../src/components/group/GroupCard";
import { ScanResultCard } from "../../src/components/search/ScanResultCard";
import { SectionLabel } from "../../src/components/ui/SectionLabel";
import { Colors } from "../../src/constants/colors";
import { Theme } from "../../src/constants/theme";
import { ScanState } from "../../src/types";

// ─── Composant SearchBar ─────────────────────────────────────────────────────

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
}) => (
  <View style={styles.searchBar}>
    <Text style={styles.searchIcon}>🔍</Text>
    <TextInput
      style={styles.searchInput}
      value={value}
      onChangeText={onChangeText}
      placeholder="Chercher un groupe, un membre…"
      placeholderTextColor={Colors.textMuted}
      returnKeyType="search"
      autoCorrect={false}
      autoCapitalize="none"
    />
    {value.length > 0 && (
      <TouchableOpacity onPress={onClear}>
        <Text style={styles.clearIcon}>✕</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── Composant ScanBanner ────────────────────────────────────────────────────

interface ScanBannerProps {
  onPress: () => void;
}

const ScanBanner: React.FC<ScanBannerProps> = ({ onPress }) => (
  <TouchableOpacity
    style={styles.scanBanner}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.scanBannerLeft}>
      <Text style={styles.scanBannerTitle}>📷 Scanner une photocard</Text>
      <Text style={styles.scanBannerSub}>
        L'IA identifie la carte et la recherche dans la base de données
      </Text>
    </View>
    <Text style={styles.scanArrow}>›</Text>
  </TouchableOpacity>
);

// ─── Page principale ─────────────────────────────────────────────────────────

export default function SearchScreen() {
  const { groups } = useGroups();
  const [query, setQuery] = useState("");
  const [scanState, setScanState] = useState<ScanState>({ status: "idle" });

  // Filtrage des groupes en temps réel
  const filteredGroups = useMemo(() => {
    if (!query.trim()) return groups;
    const q = query.toLowerCase();
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.company?.toLowerCase().includes(q) ||
        g.generation?.toLowerCase().includes(q),
    );
  }, [query]);

  const handlePressGroup = useCallback((groupId: string) => {
    router.push(`/group/${groupId}`);
  }, []);

  const handlePressScan = useCallback(() => {
    router.push("/scan");
    // TODO: ouvrir la caméra avec expo-camera
    // Simulation pour la démo
    // Alert.alert(
    //   "Scanner une carte",
    //   "La caméra s'ouvrira ici (expo-camera). Simulation d'un résultat...",
    //   [
    //     {
    //       text: 'Simuler "Trouvée"',
    //       onPress: () =>
    //         setScanState({
    //           status: "found",
    //           card: {
    //             id: "pc1",
    //             memberId: "m1",
    //             albumId: "a1",
    //             groupId: "g1",
    //             type: "normal",
    //             status: "approved",
    //             memberName: "Keeho",
    //             albumTitle: "ALARM",
    //             groupName: "P1Harmony",
    //             version: "A",
    //             isInCollection: false,
    //             isFavorite: false,
    //             isWishlisted: false,
    //           },
    //         }),
    //     },
    //     {
    //       text: 'Simuler "Inconnue"',
    //       onPress: () => setScanState({ status: "not_found" }),
    //     },
    //     { text: "Annuler", style: "cancel" },
    //   ],
    // );
  }, []);

  const handleAddToCollection = useCallback(() => {
    // TODO: appel API
    Alert.alert("✅ Ajoutée à ta collection !");
    setScanState({ status: "idle" });
  }, []);

  const handleAddToWishlist = useCallback(() => {
    // TODO: appel API
    Alert.alert("🌟 Ajoutée à ta wishlist !");
    setScanState({ status: "idle" });
  }, []);

  const handleSubmitNew = useCallback(() => {
    // Naviguer vers le formulaire de soumission
    // router.push("/submit-card");
  }, []);

  const handleDismissScan = useCallback(() => {
    setScanState({ status: "idle" });
  }, []);

  const handleClearSearch = useCallback(() => {
    setQuery("");
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Recherche</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={handlePressScan}>
          <Text style={styles.iconBtnText}>📷</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Barre de recherche */}
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onClear={handleClearSearch}
        />

        {/* Bannière scan */}
        <ScanBanner onPress={handlePressScan} />

        {/* Résultat du scan */}
        {scanState.status === "found" && (
          <ScanResultCard
            status="found"
            card={scanState.card}
            onAddToCollection={handleAddToCollection}
            onAddToWishlist={handleAddToWishlist}
            onDismiss={handleDismissScan}
          />
        )}
        {scanState.status === "not_found" && (
          <ScanResultCard
            status="not_found"
            onSubmitNew={handleSubmitNew}
            onDismiss={handleDismissScan}
          />
        )}

        {/* Liste des groupes */}
        <SectionLabel
          label={
            query.trim()
              ? `${filteredGroups.length} résultat${filteredGroups.length !== 1 ? "s" : ""}`
              : "Tous les groupes"
          }
        />

        {filteredGroups.length > 0 ? (
          <View style={styles.groupGrid}>
            {filteredGroups.map((group) => (
              <View key={group.id} style={styles.groupGridItem}>
                <GroupCard
                  group={group}
                  onPress={() => handlePressGroup(group.id)}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>
              Aucun groupe trouvé pour "{query}"
            </Text>
            <Text style={styles.emptySubText}>
              Vérifie l'orthographe ou parcours tous les groupes
            </Text>
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.lg,
  },
  title: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnText: {
    fontSize: 16,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.lg,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  searchInput: {
    flex: 1,
    fontSize: Theme.fontSize.base,
    color: Colors.text,
    padding: 0,
  },
  clearIcon: {
    fontSize: 12,
    color: Colors.textMuted,
    padding: 4,
  },
  scanBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(125, 211, 240, 0.05)",
    borderWidth: 0.5,
    borderColor: "rgba(125, 211, 240, 0.2)",
    borderRadius: Theme.borderRadius.md,
    padding: 12,
    marginBottom: 4,
  },
  scanBannerLeft: {
    flex: 1,
    gap: 4,
  },
  scanBannerTitle: {
    fontSize: Theme.fontSize.md,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
  scanBannerSub: {
    fontSize: Theme.fontSize.md,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  scanArrow: {
    fontSize: 18,
    color: Colors.textMuted,
    marginLeft: 8,
  },
  groupGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  groupGridItem: {
    width: "48%",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: Theme.fontSize.base,
    color: Colors.text,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: Theme.fontSize.md,
    color: Colors.textMuted,
    textAlign: "center",
  },
  bottomPad: {
    height: 24,
  },
});
