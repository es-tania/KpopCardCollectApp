import { MOCK_GROUPS, MOCK_MEMBERS, MOCK_PHOTOCARDS } from "@/src/data";
import { Camera, CameraView } from "expo-camera";
import { router } from "expo-router";
import { ImagePlus, X } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    ScanFilters,
    ScanFrame,
    ScanHints,
    ScanNotFoundCard,
    ScanResultCard,
} from "../src/components/scan";
import { Colors } from "../src/constants/colors";
import { Theme } from "../src/constants/theme";
import { PhotocardWithDetails, ScanStatus } from "../src/types";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ScanScreen() {
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [foundCard, setFoundCard] = useState<PhotocardWithDetails | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // Simulation du scan
  const handleScan = useCallback(async () => {
    setStatus("scanning");
    setFoundCard(null);

    await new Promise((r) => setTimeout(r, 2000));

    // Filtre selon le groupe/membre sélectionné
    let pool = MOCK_PHOTOCARDS;
    if (selectedGroupId)
      pool = pool.filter((c) => c.groupId === selectedGroupId);
    if (selectedMemberId)
      pool = pool.filter((c) => c.memberId === selectedMemberId);

    // Simulation : 70% de chance de trouver une carte
    const found = Math.random() > 0.3 && pool.length > 0;

    if (found) {
      const card = pool[Math.floor(Math.random() * pool.length)];
      setFoundCard(card);
      setStatus("found");
    } else {
      setStatus("not_found");
    }
  }, [selectedGroupId, selectedMemberId]);

  // Scan depuis la galerie
  const handlePickFromGallery = useCallback(() => {
    Alert.alert(
      "Galerie",
      "L'accès à la galerie s'ouvrira ici (expo-image-picker).",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Simuler un scan", onPress: handleScan },
      ],
    );
  }, [handleScan]);

  const handleDismiss = useCallback(() => {
    setStatus("idle");
    setFoundCard(null);
  }, []);

  const handleAddToCollection = useCallback(() => {
    if (!foundCard) return;
    // TODO: appel API
    Alert.alert(
      "✅ Ajoutée !",
      `${foundCard.memberName} ajoutée à ta collection.`,
    );
    handleDismiss();
  }, [foundCard, handleDismiss]);

  const handleAddToWishlist = useCallback(() => {
    if (!foundCard) return;
    Alert.alert(
      "🌟 Ajoutée !",
      `${foundCard.memberName} ajoutée à ta wishlist.`,
    );
  }, [foundCard]);

  const handleAddToFavorites = useCallback(() => {
    if (!foundCard) return;
    Alert.alert(
      "⭐ Ajoutée !",
      `${foundCard.memberName} ajoutée à tes favoris.`,
    );
  }, [foundCard]);

  const handleSubmitNew = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedGroupId) params.set("groupId", selectedGroupId);
    if (selectedMemberId) params.set("memberId", selectedMemberId);
    // L'image scannée pourrait aussi être passée ici via un store global (Zustand)

    router.push(`/admin/add-photocard?${params.toString()}`);
  }, [selectedGroupId, selectedMemberId]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <X size={20} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Scanner une photocard</Text>
        <TouchableOpacity style={styles.navBtn} onPress={handlePickFromGallery}>
          <ImagePlus size={18} color={Colors.text} strokeWidth={1.6} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Viewfinder ── */}
        <View style={styles.viewfinder}>
          {/* Zone caméra simulée */}
          <View style={styles.cameraArea}>
            {hasPermission === false ? (
              <Text style={{ color: Colors.text }}>Accès caméra refusé</Text>
            ) : (
              <CameraView
                style={StyleSheet.absoluteFillObject}
                // type={Camera.Constants.Type.back}
              />
            )}

            {/* Overlay UI */}
            <ScanFrame size={240} />
          </View>

          {/* Hint status */}
          <ScanHints status={status} />
        </View>

        {/* ── Bouton scan ── */}
        {(status === "idle" || status === "scanning") && (
          <TouchableOpacity
            style={[
              styles.scanBtn,
              status === "scanning" && styles.scanBtnScanning,
            ]}
            onPress={handleScan}
            disabled={status === "scanning"}
            activeOpacity={0.8}
          >
            <View style={styles.scanBtnInner} />
          </TouchableOpacity>
        )}

        {/* ── Résultat trouvé ── */}
        {status === "found" && foundCard && (
          <View style={styles.resultSection}>
            <ScanResultCard
              card={foundCard}
              onAddToCollection={handleAddToCollection}
              onAddToWishlist={handleAddToWishlist}
              onAddToFavorites={handleAddToFavorites}
              onDismiss={handleDismiss}
            />
          </View>
        )}

        {/* ── Résultat introuvable ── */}
        {status === "not_found" && (
          <View style={styles.resultSection}>
            <ScanNotFoundCard
              onSubmit={handleSubmitNew}
              onDismiss={handleDismiss}
            />
          </View>
        )}

        {/* ── Filtres ── */}
        <View style={styles.filtersSection}>
          <ScanFilters
            groups={MOCK_GROUPS}
            members={MOCK_MEMBERS}
            selectedGroupId={selectedGroupId}
            selectedMemberId={selectedMemberId}
            onSelectGroup={(id) => {
              setSelectedGroupId(id);
              setSelectedMemberId(null);
              handleDismiss();
            }}
            onSelectMember={(id) => {
              setSelectedMemberId(id);
              handleDismiss();
            }}
          />
        </View>

        {/* Tip */}
        <Text style={styles.tip}>
          Sélectionner un groupe ou un membre améliore la précision de la
          recherche
        </Text>

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
  scroll: {
    flex: 1,
  },
  content: {
    alignItems: "center",
    gap: Theme.spacing.xl,
    paddingVertical: Theme.spacing.xl,
  },

  // Viewfinder
  viewfinder: {
    alignItems: "center",
    gap: Theme.spacing.lg,
    width: "100%",
  },
  cameraArea: {
    width: "100%",
    height: 360,
    backgroundColor: Colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },

  // Bouton scan
  scanBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "transparent",
    borderWidth: 3,
    borderColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  scanBtnScanning: {
    borderColor: Colors.textMuted,
    opacity: 0.5,
  },
  scanBtnInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
  },

  // Résultat
  resultSection: {
    width: "100%",
    paddingHorizontal: Theme.spacing.lg,
  },

  // Filtres
  filtersSection: {
    width: "100%",
  },

  tip: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
    textAlign: "center",
    paddingHorizontal: Theme.spacing.xl,
    lineHeight: 18,
  },

  bottomPad: {
    height: 20,
  },
});
