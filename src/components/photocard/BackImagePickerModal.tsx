import { Colors } from "@/src/constants/colors";
import { Theme } from "@/src/constants/theme";
import { supabase } from "@/src/lib/supabase";
import { useShopsStore } from "@/src/store/shopsStore";
import { Check, X } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PHOTOCARD_FILTER_OPTIONS } from "@/src/constants/options";
import { Dimensions } from "react-native";
import { FilterToggle } from "../ui/FilterToggle";
import { QuickFilterChips } from "../ui/QuickFilterChips";

const SCREEN_WIDTH = Dimensions.get("window").width;
const GAP = 8; // Theme.spacing.md
const PADDING = 16; // Theme.spacing.md * 2
const ITEM_SIZE = Math.floor((SCREEN_WIDTH - PADDING * 2 - GAP * 2) / 3);

// ─── Types ────────────────────────────────────────────────────────────────────

interface BackImageEntry {
  id: string;
  back_image_url: string;
  type?: string;
  shop_name?: string;
  version?: string;
  member_name?: string;
  back_image_shared: boolean;
}

interface BackImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  groupId?: string;
  albumId?: string;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export const BackImagePickerModal: React.FC<BackImagePickerModalProps> = ({
  visible,
  onClose,
  onSelect,
  groupId,
  albumId,
}) => {
  const { getLabel } = useShopsStore();
  const [entries, setEntries] = useState<BackImageEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string>("all");
  const [activeShop, setActiveShop] = useState<string>("all");

  // ── Charge les arrières disponibles ──────────────────────────────────
  const fetch = useCallback(async () => {
    if (!visible || !groupId) return;
    setLoading(true);
    try {
      let query = supabase
        .from("photocards_with_details")
        .select(
          "id, back_image_url, type, shop_name, version, member_name, back_image_shared",
        )
        .eq("group_id", groupId)
        .eq("status", "approved")
        .not("back_image_url", "is", null);

      if (albumId) query = query.eq("album_id", albumId);

      const { data, error } = await query;
      if (error) throw error;

      // ── Déduplique par URL ────────────────────────────────────────
      const seen = new Set<string>();
      const dedup = (data ?? []).filter((d: any) => {
        if (seen.has(d.back_image_url)) return false;
        seen.add(d.back_image_url);
        return true;
      });

      setEntries(dedup as BackImageEntry[]);
    } catch (err: any) {
      console.error("BackImagePickerModal:", err.message);
    } finally {
      setLoading(false);
    }
  }, [visible, groupId, albumId]);

  useEffect(() => {
    fetch();
    setSelected(null);
    setActiveType("all");
    setActiveShop("all");
  }, [fetch]);

  // ── Filtres disponibles ───────────────────────────────────────────────
  const availableTypes = useMemo(() => {
    const types = new Set(entries.map((e) => e.type).filter(Boolean));
    return PHOTOCARD_FILTER_OPTIONS.filter(
      (opt) => opt.key === "all" || types.has(opt.key as string),
    );
  }, [entries]);

  const availableShops = useMemo(() => {
    const shops = new Set(entries.map((e) => e.shop_name).filter(Boolean));
    if (shops.size === 0) return [];
    return [
      { key: "all", label: "Tous" },
      ...[...shops].map((shop) => ({
        key: shop!,
        label: getLabel(shop),
      })),
    ];
  }, [entries, getLabel]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (activeType !== "all" && e.type !== activeType) return false;
      if (activeShop !== "all" && e.shop_name !== activeShop) return false;
      return true;
    });
  }, [entries, activeType, activeShop]);

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
      onClose();
    }
  };

  // ── Rendu d'une carte ─────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item }: { item: BackImageEntry }) => {
      const isSelected = selected === item.back_image_url;
      return (
        <TouchableOpacity
          style={[styles.item, isSelected && styles.itemSelected]}
          onPress={() => setSelected(item.back_image_url)}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: item.back_image_url }}
            style={styles.itemImage}
            resizeMode="cover"
          />
          {/* Infos */}
          <View style={styles.itemInfo}>
            {item.member_name && (
              <Text style={styles.itemMember} numberOfLines={1}>
                {item.member_name}
              </Text>
            )}
            {item.version && (
              <Text style={styles.itemVersion} numberOfLines={1}>
                {item.version}
              </Text>
            )}
            {item.shop_name && (
              <Text style={styles.itemShop} numberOfLines={1}>
                {getLabel(item.shop_name)}
              </Text>
            )}
            {item.back_image_shared && (
              <View style={styles.sharedBadge}>
                <Text style={styles.sharedBadgeText}>Partagé</Text>
              </View>
            )}
          </View>
          {/* Check */}
          {isSelected && (
            <View style={styles.checkBadge}>
              <Check size={12} color={Colors.bg} strokeWidth={2.5} />
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [selected, getLabel],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        {/* ── Navbar ── */}
        <View style={styles.navbar}>
          <TouchableOpacity style={styles.navBtn} onPress={onClose}>
            <X size={20} color={Colors.text} strokeWidth={1.8} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Choisir un verso existant</Text>
          <TouchableOpacity
            style={[styles.confirmBtn, !selected && styles.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={!selected}
          >
            <Text
              style={[
                styles.confirmText,
                !selected && styles.confirmTextDisabled,
              ]}
            >
              Choisir
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Filtres ── */}
        <View>
          {availableTypes.length > 1 && (
            <QuickFilterChips
              options={availableTypes}
              selected={activeType}
              onSelect={(k) => setActiveType(k)}
            />
          )}

          {availableShops.length > 1 && (
            <FilterToggle
              options={availableShops}
              selected={activeShop}
              onSelect={(k) => setActiveShop(k)}
              label="Filtrer par shop"
            />
          )}
          {/* ── Compteur ── */}
          <View style={styles.countBar}>
            <Text style={styles.countText}>
              <Text style={styles.countNum}>{filtered.length}</Text> verso
              {filtered.length !== 1 ? "s" : ""} disponible
              {filtered.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {/* ── Grille ── */}
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Colors.accent} size="large" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔄</Text>
            <Text style={styles.emptyTitle}>Aucun verso disponible</Text>
            <Text style={styles.emptySubtitle}>
              {albumId
                ? "Aucune carte de cet album n'a de verso."
                : "Aucune carte de ce groupe n'a de verso."}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            renderItem={renderItem}
            keyExtractor={(item) => item.back_image_url}
            numColumns={3}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.gridRow}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },

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
  confirmBtn: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.accent,
  },
  confirmBtnDisabled: {
    backgroundColor: Colors.surface2,
  },
  confirmText: {
    fontSize: Theme.fontSize.sm + 1,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.bg,
  },
  confirmTextDisabled: {
    color: Colors.textMuted,
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
    fontWeight: Theme.fontWeight.semibold,
  },

  // Grille
  grid: {
    padding: Theme.spacing.md,
    gap: Theme.spacing.md,
  },
  gridRow: {
    gap: Theme.spacing.md,
  },
  item: {
    flex: 1,
    maxWidth: ITEM_SIZE,
    borderRadius: Theme.borderRadius.md,
    overflow: "hidden",
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
    position: "relative",
  },
  itemSelected: {
    borderColor: Colors.accent,
    borderWidth: 2,
  },
  itemImage: {
    width: "100%",
    aspectRatio: 0.68,
  },
  itemInfo: {
    padding: Theme.spacing.xs + 2,
    gap: 2,
  },
  itemMember: {
    fontSize: Theme.fontSize.xs + 1,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
  },
  itemVersion: {
    fontSize: Theme.fontSize.xs,
    color: Colors.textMuted,
  },
  itemShop: {
    fontSize: Theme.fontSize.xs,
    color: Colors.accent2,
  },
  sharedBadge: {
    backgroundColor: "rgba(145,126,255,0.12)",
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 5,
    paddingVertical: 1,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  sharedBadgeText: {
    fontSize: Theme.fontSize.xs,
    color: Colors.accent,
  },
  checkBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },

  // Empty
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Theme.spacing.md,
    padding: Theme.spacing.xl,
  },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
    textAlign: "center",
  },
});
