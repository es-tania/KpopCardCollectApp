import { MOCK_PENDING } from "@/src/data";
import { router } from "expo-router";
import {
  Check,
  CheckCircle,
  ChevronLeft,
  Clock,
  Disc3,
  Edit,
  ImagePlus,
  Users,
  XCircle,
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
  const [pending, setPending] = useState(MOCK_PENDING);

  const handleApprove = useCallback((id: string) => {
    Alert.alert("Approuver", "Confirmer l'approbation de cette carte ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Approuver",
        onPress: () => {
          setPending((prev) => prev.filter((p) => p.id !== id));
          Alert.alert(
            "✅ Approuvée",
            "La carte a été ajoutée à l'application.",
          );
        },
      },
    ]);
  }, []);

  const handleReject = useCallback((id: string) => {
    Alert.alert("Refuser", "Confirmer le refus de cette carte ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Refuser",
        style: "destructive",
        onPress: () => {
          setPending((prev) => prev.filter((p) => p.id !== id));
          Alert.alert("❌ Refusée", "La carte a été refusée.");
        },
      },
    ]);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <ChevronLeft size={18} color={Colors.accent} strokeWidth={1.6} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Administration</Text>
        <View style={styles.navBtn} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Stats globales ── */}
        <AdminSectionTitle title="Infos" />

        {/* Stats soumissions */}
        <View style={styles.submissionStats}>
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
        </View>

        {/* ── Soumissions ── */}
        <AdminSectionTitle title={`Soumissions à valider`} />

        <AdminActionRow
          icon={<Check size={17} color="#DAA520" strokeWidth={1.6} />}
          label="Tout voir"
          onPress={() => router.push("/admin/submissions")}
        />

        {/* ── Ajouter ── */}
        <AdminSectionTitle title="Ajouter" />
        <AdminActionRow
          icon={<ImagePlus size={17} color={Colors.accent} strokeWidth={1.6} />}
          label="Ajouter une photocard"
          sublabel="Simple ou en lot"
          onPress={() => router.push("/admin/add-photocard")}
        />
        <AdminActionRow
          icon={<ImagePlus size={17} color={Colors.accent} strokeWidth={1.6} />}
          label="Ajouter des photocards en lot"
          sublabel="Même album, plusieurs membres"
          onPress={() => router.push("/admin/add-photocards-bulk")}
        />
        <AdminActionRow
          icon={<Disc3 size={17} color={Colors.accent} strokeWidth={1.6} />}
          label="Ajouter un album / event"
          onPress={() => router.push("/admin/add-album")}
        />
        <AdminActionRow
          icon={<Users size={17} color="#DAA520" strokeWidth={1.6} />}
          label="Ajouter un groupe"
          onPress={() => router.push("/admin/add-group")}
        />

        {/* ── Gérer ── */}
        <AdminSectionTitle title="Gérer" />
        <AdminActionRow
          icon={<Edit size={17} color={Colors.accent} strokeWidth={1.6} />}
          label="Modifier une photocard"
          sublabel="Rechercher et éditer"
          onPress={() => router.push("/admin/edit-photocard")}
        />

        <AdminActionRow
          icon={<Edit size={17} color={Colors.accent} strokeWidth={1.6} />}
          label="Modifier un album"
          onPress={() => router.push("/admin/edit-album")}
        />

        <AdminActionRow
          icon={<Edit size={17} color="#DAA520" strokeWidth={1.6} />}
          label="Modifier un groupe"
          onPress={() => router.push("/admin/edit-group")}
        />

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
