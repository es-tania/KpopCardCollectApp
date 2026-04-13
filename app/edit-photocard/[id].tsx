import { EditForm } from "@/src/components/admin/photocard/EditForm";
import { Colors } from "@/src/constants/colors";
import { Theme } from "@/src/constants/theme";
import { useEditPhotocard } from "@/src/hooks/photocard/useEditPhotocard";
import { photocardsService } from "@/src/services/photocardsService";
import { PhotocardWithDetails } from "@/src/types";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function EditPhotocardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [card, setCard] = useState<PhotocardWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Charge la carte ───────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    photocardsService.getById(id).then((data) => {
      setCard(data);
      setLoading(false);
    });
  }, [id]);

  // ── Edit hook ─────────────────────────────────────────────────────────
  const {
    loading: saving,
    progress,
    error,
    submit,
  } = useEditPhotocard(() => {
    Alert.alert("✅ Enregistré", "La photocard a été modifiée.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  });

  useEffect(() => {
    if (error) Alert.alert("Erreur", error);
  }, [error]);

  const handleBack = () => {
    Alert.alert(
      "Abandonner les modifications ?",
      "Les changements non sauvegardés seront perdus.",
      [
        { text: "Continuer l'édition", style: "cancel" },
        {
          text: "Abandonner",
          style: "destructive",
          onPress: () => router.back(),
        },
      ],
    );
  };

  // ── Loading ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!card) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.loadingWrap}>
          <Text style={styles.errorText}>Carte introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={handleBack}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {card.memberName} — {card.albumTitle}
        </Text>
        <View style={styles.navBtn} />
      </View>

      {/* ── Formulaire ── */}
      <EditForm
        card={card}
        onSave={(data) => submit(card.id, data, card)}
        onCancel={() => router.back()}
        loading={saving}
        progress={progress}
      />
    </SafeAreaView>
  );
}

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
  errorText: {
    fontSize: Theme.fontSize.base,
    color: Colors.danger,
  },
});
