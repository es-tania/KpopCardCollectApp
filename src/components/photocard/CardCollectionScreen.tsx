import { GroupFilter } from "@/src/components/group/GroupFilter";
import { MembersList } from "@/src/components/member/MembersList";
import { PhotocardModal } from "@/src/components/photocard/PhotocardModal";
import { PhotocardsByAlbum } from "@/src/components/photocard/PhotocardsByAlbum";
import { Colors } from "@/src/constants/colors";
import { Theme } from "@/src/constants/theme";
import { useAlbumCounts } from "@/src/hooks/album/useAlbumCount";
import { useGroupMembers } from "@/src/hooks/group/useGroupMembers";
import { useGroupsByMode } from "@/src/hooks/group/useGroupsByMode";
import { useAvailableFilters } from "@/src/hooks/useAvailableFilters";
import { useAuthStore } from "@/src/store/authStore";
import { useCollectionStore } from "@/src/store/collectionStore";
import { CardMode, PhotocardWithDetails } from "@/src/types";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardFiltersBar } from "../ui/CardFilterBar";

// ─── Config par mode ──────────────────────────────────────────────────────────

interface ModeConfig {
  title: string;
  infoLabel: string;
  infoColor: string;
  fetchMode: string;
}

const MODE_CONFIG: Record<CardMode, ModeConfig> = {
  collection: {
    title: "Ma collection",
    infoLabel: "cartes collectées",
    infoColor: Colors.accent,
    fetchMode: "collection",
  },
  favorites: {
    title: "Mes favoris",
    infoLabel: "cartes favorites",
    infoColor: "#DAA520",
    fetchMode: "favorites",
  },
  wishlist: {
    title: "Ma wishlist",
    infoLabel: "cartes souhaitées",
    infoColor: Colors.accent2,
    fetchMode: "wishlist",
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface CardCollectionScreenProps {
  mode: CardMode;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export const CardCollectionScreen: React.FC<CardCollectionScreenProps> = ({
  mode,
}) => {
  const { user } = useAuthStore();
  const { collectionIds, favoriteIds, wishlistIds } = useCollectionStore();
  const config = MODE_CONFIG[mode];

  const watchIds =
    mode === "collection"
      ? collectionIds
      : mode === "favorites"
        ? favoriteIds
        : wishlistIds;

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>(
    undefined,
  );
  const [activeType, setActiveType] = useState("all");
  const [activeShop, setActiveShop] = useState("all");
  const [modalCard, setModalCard] = useState<PhotocardWithDetails | null>(null);

  // ── Groupes depuis les cartes du mode ────────────────────────────────
  const { groups: availableGroups, loading: groupsLoading } =
    useGroupsByMode(mode);
  const { membersWithStats } = useGroupMembers(selectedGroupId ?? "");

  // ── Filtres disponibles (types + shops) ──────────────────────────────
  const { availableTypes, availableShops } = useAvailableFilters({
    mode: config.fetchMode,
    groupId: selectedGroupId,
  });

  // ── Sélectionne le premier groupe par défaut ──────────────────────────
  useEffect(() => {
    if (availableGroups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(availableGroups[0].id);
    }
  }, [availableGroups]);

  // ── Reset filtres quand groupe change ────────────────────────────────
  useEffect(() => {
    setSelectedMemberId(undefined);
    setActiveType("all");
    setActiveShop("all");
  }, [selectedGroupId]);

  // ── Reset type/shop quand ils changent ───────────────────────────────
  const handleTypeChange = (type: string) => {
    setActiveType(type);
    setActiveShop("all"); // ← reset shop quand type change
  };

  // ── Compte par album ──────────────────────────────────────────────────
  const { albumInfos, loading, totalCount } = useAlbumCounts({
    mode: config.fetchMode,
    groupId: selectedGroupId,
    memberId: selectedMemberId,
    type: activeType === "all" ? undefined : activeType,
    shop: activeShop === "all" ? undefined : activeShop,
    watchIds,
  });

  const selectedGroup = availableGroups.find((g) => g.id === selectedGroupId);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {selectedGroup
            ? `${selectedGroup.name} · ${config.title}`
            : config.title}
        </Text>
        <View style={styles.navBtn} />
      </View>

      {/* ── Filtre groupes ── */}
      {groupsLoading ? (
        <ActivityIndicator color={Colors.accent} style={styles.groupsLoading} />
      ) : (
        <View style={styles.groupFilterWrap}>
          <GroupFilter
            groups={availableGroups}
            selectedId={selectedGroupId ?? ""}
            onSelect={(id) => setSelectedGroupId(id === "all" ? null : id)}
            showAll={false}
          />
        </View>
      )}

      {/* ── Filtre membres ── */}
      {membersWithStats.length > 1 && (
        <View style={styles.memberFilterWrap}>
          <MembersList
            members={membersWithStats}
            selectedId={selectedMemberId}
            showStats={false}
            onPressMember={(m) =>
              setSelectedMemberId((prev) => (prev === m.id ? undefined : m.id))
            }
          />
        </View>
      )}

      {/* ── Filtre type + shop ── */}
      <CardFiltersBar
        activeType={activeType}
        onTypeChange={handleTypeChange}
        availableTypes={availableTypes}
        activeShop={activeShop}
        onShopChange={setActiveShop}
        availableShops={availableShops}
      />

      {/* ── Grille ── */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      ) : (
        <PhotocardsByAlbum
          albumInfos={albumInfos}
          userId={user?.id}
          groupId={selectedGroupId ?? ""}
          memberId={selectedMemberId}
          activeType={activeType === "all" ? undefined : activeType}
          activeShop={activeShop === "all" ? undefined : activeShop}
          fetchMode={config.fetchMode as any}
          onPressCard={(card) => setModalCard(card)}
          defaultExpanded={false}
          ListHeaderComponent={
            <View style={styles.infoBar}>
              <Text style={styles.infoText}>
                <Text style={[styles.infoCount, { color: config.infoColor }]}>
                  {totalCount}
                </Text>{" "}
                {config.infoLabel}
              </Text>
            </View>
          }
        />
      )}

      <PhotocardModal
        card={modalCard}
        visible={modalCard !== null}
        onClose={() => setModalCard(null)}
      />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  groupsLoading: { paddingVertical: Theme.spacing.lg },
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
  groupFilterWrap: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: Theme.spacing.lg,
  },
  memberFilterWrap: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingVertical: Theme.spacing.md,
  },
  infoBar: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    marginBottom: Theme.spacing.md,
  },
  infoText: { fontSize: Theme.fontSize.sm + 1, color: Colors.textMuted },
  infoCount: { fontWeight: Theme.fontWeight.semibold },
});
