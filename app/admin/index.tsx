import { MOCK_PENDING } from "@/src/data";
import { useTranslation } from "@/src/hooks/useTranslation";
import { useAuthStore } from "@/src/store/authStore";
import { router } from "expo-router";
import {
  Check,
  ChevronLeft,
  Disc3,
  Edit,
  ImagePlus,
  UserCheck,
  Users,
  Zap,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AdminActionRow, AdminSectionTitle } from "../../src/components/admin";
import { Colors } from "../../src/constants/colors";
import { Theme } from "../../src/constants/theme";

// ─── Stats mock ───────────────────────────────────────────────────────────────

const STATS = {
  groups: 2,
  albums: 5,
  photocards: 30,
  members: 6,
  pending: 3,
  approved: 27,
  rejected: 2,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminScreen() {
  const { t } = useTranslation();
  const { isAdmin } = useAuthStore();
  const [pending, setPending] = useState(MOCK_PENDING);

  const handleApprove = useCallback(
    (id: string) => {
      Alert.alert(t("admin.approve"), t("common.confirm"), [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("admin.approve"),
          onPress: () => {
            setPending((prev) => prev.filter((p) => p.id !== id));
            Alert.alert(t("submissions.status.approved"), "");
          },
        },
      ]);
    },
    [t],
  );

  const handleReject = useCallback(
    (id: string) => {
      Alert.alert(t("admin.reject"), t("common.confirm"), [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("admin.reject"),
          style: "destructive",
          onPress: () => {
            setPending((prev) => prev.filter((p) => p.id !== id));
            Alert.alert(t("submissions.status.rejected"), "");
          },
        },
      ]);
    },
    [t],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <ChevronLeft size={18} color={Colors.accent} strokeWidth={1.6} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t("admin.title")}</Text>
        <View style={styles.navBtn} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Stats globales ── */}
        {/* <AdminSectionTitle title="Infos" /> */}

        {/* Stats soumissions */}
        {/* <View style={styles.submissionStats}>
          <View style={styles.submissionStat}>
            <Clock size={14} color="#FAC775" strokeWidth={1.6} />
            <Text style={[styles.submissionNum, { color: "#FAC775" }]}>
              {pending.length}
            </Text>
            <Text style={styles.submissionLabel}>En attente</Text>
          </View>
          <View style={styles.submissionDivider} />
          <View style={styles.submissionStat}>
            <CheckCircle size={14} color={Colors.accent} strokeWidth={1.6} />
            <Text style={[styles.submissionNum, { color: Colors.accent }]}>
              {STATS.approved}
            </Text>
            <Text style={styles.submissionLabel}>Approuvées</Text>
          </View>
          <View style={styles.submissionDivider} />
          <View style={styles.submissionStat}>
            <XCircle size={14} color={Colors.danger} strokeWidth={1.6} />
            <Text style={[styles.submissionNum, { color: Colors.danger }]}>
              {STATS.rejected}
            </Text>
            <Text style={styles.submissionLabel}>Refusées</Text>
          </View>
        </View> */}

        {/* ── Soumissions ── */}
        <AdminSectionTitle title={t("admin.sections.submissions")} />

        <AdminActionRow
          icon={<Check size={17} color="#DAA520" strokeWidth={1.6} />}
          label={t("common.seeAll")}
          onPress={() => router.push("/admin/admin-submissions-full")}
        />

        {/* ── Ajouter ── */}
        <AdminSectionTitle title={t("common.add")} />
        <AdminActionRow
          icon={<ImagePlus size={17} color={Colors.accent} strokeWidth={1.6} />}
          label={t("admin.sections.addPhotocard")}
          onPress={() => router.push("/admin/add-photocard")}
        />
        <AdminActionRow
          icon={<ImagePlus size={17} color={Colors.accent} strokeWidth={1.6} />}
          label={t("admin.sections.addPhotocards")}
          onPress={() => router.push("/admin/add-photocards-bulk")}
        />
        <AdminActionRow
          icon={<Disc3 size={17} color={Colors.accent} strokeWidth={1.6} />}
          label={t("admin.sections.addAlbum")}
          onPress={() => router.push("/admin/add-album")}
        />

        {isAdmin && (
          <AdminActionRow
            icon={<Users size={17} color="#DAA520" strokeWidth={1.6} />}
            label={t("admin.sections.addGroup")}
            onPress={() => router.push("/admin/add-group")}
          />
        )}

        {/* ── Gérer ── */}
        <AdminSectionTitle title={t("common.edit")} />
        <AdminActionRow
          icon={<Edit size={17} color={Colors.accent} strokeWidth={1.6} />}
          label={t("admin.sections.editPhotocard")}
          onPress={() => router.push("/admin/edit-photocard")}
        />

        <AdminActionRow
          icon={<Edit size={17} color={Colors.accent} strokeWidth={1.6} />}
          label={t("admin.sections.editAlbum")}
          onPress={() => router.push("/admin/edit-album")}
        />

        {isAdmin && (
          <>
            <AdminActionRow
              icon={<Edit size={17} color="#DAA520" strokeWidth={1.6} />}
              label={t("admin.sections.editGroup")}
              onPress={() => router.push("/admin/edit-group")}
            />
            <AdminActionRow
              icon={
                <UserCheck size={17} color={Colors.accent} strokeWidth={1.6} />
              }
              label={t("admin.sections.groupAdmins")}
              onPress={() => router.push("/admin/group-admins")}
            />
          </>
        )}

        {isAdmin && (
          <AdminActionRow
            icon={<Zap size={17} color={Colors.accent} strokeWidth={1.6} />}
            label="Embeddings"
            onPress={() => router.push("/admin/generate-embeddings")}
          />
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
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

  // Stats
  statsGrid: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: Theme.spacing.lg,
  },
  submissionStats: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Theme.spacing.md,
  },
  submissionStat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  submissionNum: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
  },
  submissionLabel: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
  },
  submissionDivider: {
    width: 0.5,
    height: 32,
    backgroundColor: Colors.border,
  },

  // Pending vide
  emptyPending: {
    alignItems: "center",
    paddingVertical: Theme.spacing.xl,
    gap: 10,
  },
  emptyPendingText: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
  },

  bottomPad: { height: 40 },
});
