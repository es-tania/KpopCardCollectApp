import { useFetchOnFocus } from "@/src/hooks/useFetchOnFocus";
import { supabase } from "@/src/lib/supabase";
import { mapPhotocard } from "@/src/services/photocardsService";
import { useAuthStore } from "@/src/store/authStore";
import { router } from "expo-router";
import { Check, ChevronLeft, Clock, X } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../src/constants/colors";
import { Theme } from "../src/constants/theme";
import { PhotocardWithDetails } from "../src/types";

// ─── Config statut ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending: {
    label: "En attente",
    color: Colors.warning,
    icon: Clock,
  },
  approved: {
    label: "Approuvée",
    color: Colors.accent,
    icon: Check,
  },
  rejected: {
    label: "Refusée",
    color: Colors.danger,
    icon: X,
  },
} as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MySubmissionsScreen() {
  const { user } = useAuthStore();
  const [submissions, setSubmissions] = useState<PhotocardWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("photocards_with_details")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubmissions((data ?? []).map(mapPhotocard));
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);
  useFetchOnFocus(fetchSubmissions);

  const renderItem = useCallback(({ item }: { item: PhotocardWithDetails }) => {
    const statusCfg =
      STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] ??
      STATUS_CONFIG.pending;
    const StatusIcon = statusCfg.icon;

    return (
      <View style={styles.row}>
        {/* Image */}
        <View style={styles.imageWrap}>
          {item.imageUrl ? (
            <Image
              source={item.imageUrl as any}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.imageFallback}>🧑‍🎤</Text>
          )}
        </View>

        {/* Infos */}
        <View style={styles.info}>
          <Text style={styles.memberName}>{item.memberName}</Text>
          <Text style={styles.albumTitle} numberOfLines={1}>
            {item.groupName} · {item.albumTitle}
          </Text>
          {item.version && <Text style={styles.version}>{item.version}</Text>}
          <Text style={styles.date}>
            {new Date(item.createdAt ?? "").toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>

        {/* Statut */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${statusCfg.color}20` },
          ]}
        >
          <StatusIcon size={12} color={statusCfg.color} strokeWidth={2} />
          <Text style={[styles.statusText, { color: statusCfg.color }]}>
            {statusCfg.label}
          </Text>
        </View>
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Mes soumissions</Text>
        <View style={styles.navBtn} />
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      ) : (
        <FlatList
          data={submissions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            submissions.length === 0 ? styles.emptyContainer : undefined
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyTitle}>Aucune soumission</Text>
              <Text style={styles.emptySubtitle}>
                Tu n'as pas encore proposé de photocard
              </Text>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() =>
                  router.push("/admin/add-photocard?userSubmission=true")
                }
              >
                <Text style={styles.addBtnText}>Proposer une photocard</Text>
              </TouchableOpacity>
            </View>
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
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  imageWrap: {
    width: 44,
    height: 64,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Colors.surface2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  image: { width: "100%", height: "100%" },
  imageFallback: { fontSize: 20 },
  info: { flex: 1, gap: 3 },
  memberName: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  albumTitle: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  version: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.accent,
  },
  date: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.full,
    flexShrink: 0,
  },
  statusText: {
    fontSize: Theme.fontSize.xs + 1,
    fontWeight: Theme.fontWeight.medium,
  },
  emptyContainer: { flex: 1 },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Theme.spacing.xl,
    gap: Theme.spacing.md,
  },
  emptyEmoji: { fontSize: 48 },
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
  addBtn: {
    marginTop: Theme.spacing.sm,
    backgroundColor: Colors.pillActive,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
  },
  addBtnText: {
    fontSize: Theme.fontSize.base,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
});
