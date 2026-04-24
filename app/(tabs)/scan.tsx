import { useClipEmbedding } from "@/src/hooks/useClipEmbedding";
import { mapPhotocard } from "@/src/services/photocardsService";
import { Camera, CameraView } from "expo-camera";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { ImagePlus } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ScanFrame,
  ScanHints,
  ScanResultCard,
} from "../../src/components/scan";
import { Colors } from "../../src/constants/colors";
import { Theme } from "../../src/constants/theme";
import { supabase } from "../../src/lib/supabase";
import { useCollectionStore } from "../../src/store/collectionStore";
import { PhotocardWithDetails, ScanStatus } from "../../src/types";

const CAMERA_WIDTH = Dimensions.get("window").width;
const CAMERA_HEIGHT = 500;
const SCAN_FRAME_WIDTH = 260;
const SCAN_FRAME_HEIGHT = 260 * (3 / 2);

interface NotFoundItem {
  uri: string; // image croppée
}

export default function ScanScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [scanStep, setScanStep] = useState("");
  const [selectedGroupId] = useState<string | null>(null);
  const [selectedMemberId] = useState<string | null>(null);
  const [pendingPhotos, setPendingPhotos] = useState<string[]>([]);
  const [multiResults, setMultiResults] = useState<PhotocardWithDetails[]>([]);
  const [notFoundItems, setNotFoundItems] = useState<NotFoundItem[]>([]);

  const sheetAnim = useRef(new Animated.Value(0)).current;
  const SHEET_PEEK = 120;
  const SHEET_FULL = 500;

  const { collectionIds } = useCollectionStore();
  const { generateForScan } = useClipEmbedding();

  useEffect(() => {
    fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/generate-embedding/health`,
    ).catch(() => {});
  }, []);

  useEffect(() => {
    Camera.requestCameraPermissionsAsync().then(({ status }) => {
      setHasPermission(status === "granted");
    });
  }, []);

  const openSheet = useCallback(() => {
    Animated.spring(sheetAnim, {
      toValue: 1,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  }, [sheetAnim]);

  const closeSheet = useCallback(() => {
    Animated.spring(sheetAnim, {
      toValue: 0,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  }, [sheetAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dy }) => Math.abs(dy) > 5,
      onPanResponderMove: (_, { dy }) => {
        if (dy < 0) openSheet();
        else closeSheet();
      },
    }),
  ).current;

  const sheetHeight = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SHEET_PEEK, SHEET_FULL],
  });

  const handleDismiss = useCallback(() => {
    setStatus("idle");
    setPendingPhotos([]);
    setMultiResults([]);
    setNotFoundItems([]);
    setScanStep("");
    closeSheet();
  }, [closeSheet]);

  const performMultiScan = useCallback(async () => {
    if (pendingPhotos.length === 0) return;
    setStatus("scanning");
    setMultiResults([]);
    setNotFoundItems([]);

    try {
      const results: PhotocardWithDetails[] = [];
      const notFound: NotFoundItem[] = [];

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token =
        session?.access_token ??
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
        "";

      for (let i = 0; i < pendingPhotos.length; i++) {
        const uri = pendingPhotos[i];
        setScanStep(`Analyse carte ${i + 1}/${pendingPhotos.length}...`);

        // Crop
        const { width: photoWidth, height: photoHeight } =
          await ImageManipulator.manipulate(uri).renderAsync();
        const scaleX = photoWidth / CAMERA_WIDTH;
        const scaleY = photoHeight / CAMERA_HEIGHT;
        const frameSizeX = SCAN_FRAME_WIDTH * scaleX;
        const frameSizeY = SCAN_FRAME_HEIGHT * scaleY;
        const originX = (photoWidth - frameSizeX) / 2;
        const originY = (photoHeight - frameSizeY) / 2;

        const context = ImageManipulator.manipulate(uri);
        context.crop({
          originX,
          originY,
          width: frameSizeX,
          height: frameSizeY,
        });
        const imageRef = await context.renderAsync();
        const croppedUri = (
          await imageRef.saveAsync({ format: SaveFormat.JPEG, compress: 1.0 })
        ).uri;

        const embedding = await generateForScan(croppedUri);

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/identify-photocard`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              embedding,
              groupId: selectedGroupId,
              memberId: selectedMemberId,
            }),
          },
        );

        const result = await response.json();

        if (!result.found) {
          notFound.push({ uri: uri });
          continue;
        }

        const { data: cardsData } = await supabase
          .from("photocards_with_details")
          .select("*")
          .in(
            "id",
            result.candidates.map((c: { id: string }) => c.id),
          );

        const mapped = (cardsData ?? []).map((c: any) => ({
          ...mapPhotocard(c),
          isInCollection: collectionIds.has(c.id),
        }));

        const best = result.candidates
          .map((c: { id: string }) => mapped.find((m: any) => m.id === c.id))
          .filter(Boolean)[0] as PhotocardWithDetails;

        if (best) {
          const existingIds = new Set(results.map((c) => c.id));
          if (!existingIds.has(best.id)) {
            results.push(best);
          }
        }
      }

      setMultiResults(results);
      setNotFoundItems(notFound);
      setStatus(
        results.length > 0 || notFound.length > 0 ? "found" : "not_found",
      );
      openSheet();
    } catch (err: any) {
      Alert.alert("Erreur", err.message);
      setStatus("not_found");
    } finally {
      setScanStep("");
    }
  }, [
    pendingPhotos,
    generateForScan,
    selectedGroupId,
    selectedMemberId,
    collectionIds,
    openSheet,
  ]);

  const handleScan = useCallback(async () => {
    if (!cameraRef.current || status === "scanning") return;

    if (pendingPhotos.length >= 5) {
      Alert.alert(
        "Maximum atteint",
        "Tu peux scanner au maximum 5 cartes à la fois.",
      );
      return;
    }

    try {
      await new Promise((r) => setTimeout(r, 300));
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1.0,
        skipProcessing: false,
        shutterSound: false,
      });
      if (photo?.uri) {
        setPendingPhotos((prev) => [...prev, photo.uri]);
      }
    } catch {
      Alert.alert("Erreur", "Impossible de prendre la photo.");
    }
  }, [status, pendingPhotos.length]);

  const handlePickFromGallery = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission refusée", "L'accès à la galerie est nécessaire.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: 5 - pendingPhotos.length,
    });
    if (!result.canceled) {
      const remaining = 5 - pendingPhotos.length;
      if (remaining <= 0) {
        Alert.alert(
          "Maximum atteint",
          "Tu peux scanner au maximum 5 cartes à la fois.",
        );
        return;
      }
      const toAdd = result.assets.slice(0, remaining).map((a) => a.uri);
      setPendingPhotos((prev) => [...prev, ...toAdd]);
    }
  }, [pendingPhotos.length]);

  const handleSubmitNew = useCallback(
    (uri?: string) => {
      router.push({
        pathname: "/admin/add-photocard",
        params: {
          ...(selectedGroupId && { preGroupId: selectedGroupId }),
          ...(selectedMemberId && { preMemberId: selectedMemberId }),
        },
      });
    },
    [selectedGroupId, selectedMemberId],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        <View style={styles.navBtn} />
        <Text style={styles.navTitle}>Scanner</Text>
        <TouchableOpacity style={styles.navBtn} onPress={handlePickFromGallery}>
          <ImagePlus size={18} color={Colors.text} strokeWidth={1.6} />
        </TouchableOpacity>
      </View>

      {/* ── Caméra ── */}
      <View style={styles.cameraArea}>
        {hasPermission === false ? (
          <View style={styles.noPermission}>
            <Text style={styles.noPermissionText}>Accès caméra refusé</Text>
          </View>
        ) : (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFillObject}
            facing="back"
            autofocus="on"
          />
        )}

        <ScanFrame width={SCAN_FRAME_WIDTH} height={SCAN_FRAME_HEIGHT} />

        <View style={styles.hintsContainer}>
          <ScanHints status={status} />
        </View>

        {pendingPhotos.length > 0 && status !== "scanning" && (
          <View style={styles.photoCounter}>
            <Text style={styles.photoCounterText}>{pendingPhotos.length}</Text>
          </View>
        )}

        {pendingPhotos.length > 0 && status !== "scanning" && (
          <TouchableOpacity style={styles.sendBtn} onPress={performMultiScan}>
            <Text style={styles.sendBtnText}>
              Analyser {pendingPhotos.length} carte
              {pendingPhotos.length > 1 ? "s" : ""}
            </Text>
          </TouchableOpacity>
        )}

        {status !== "scanning" && (
          <TouchableOpacity
            style={styles.scanBtn}
            onPress={handleScan}
            activeOpacity={0.8}
          >
            <View style={styles.scanBtnInner} />
          </TouchableOpacity>
        )}

        {status === "scanning" && (
          <View style={styles.scanningOverlay}>
            <ActivityIndicator color={Colors.accent} size="large" />
            {scanStep ? (
              <Text style={styles.scanStepText}>{scanStep}</Text>
            ) : null}
          </View>
        )}
      </View>

      {/* ── Bottom Sheet ── */}
      {status === "found" && (
        <Animated.View
          style={[styles.bottomSheet, { height: sheetHeight }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.sheetHandle} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}
          >
            {/* Cartes trouvées */}
            {multiResults.length > 0 && (
              <>
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>
                    {multiResults.length} carte
                    {multiResults.length > 1 ? "s" : ""} trouvée
                    {multiResults.length > 1 ? "s" : ""}
                  </Text>
                  <TouchableOpacity onPress={handleDismiss}>
                    <Text
                      style={{
                        color: Colors.danger,
                        fontSize: Theme.fontSize.sm,
                      }}
                    >
                      Effacer
                    </Text>
                  </TouchableOpacity>
                </View>
                {multiResults.map((card) => (
                  <View key={card.id} style={styles.multiCardItem}>
                    <ScanResultCard
                      card={card}
                      onDismiss={() =>
                        setMultiResults((prev) =>
                          prev.filter((c) => c.id !== card.id),
                        )
                      }
                    />
                  </View>
                ))}
              </>
            )}

            {/* Cartes non trouvées */}
            {notFoundItems.length > 0 && (
              <>
                <View
                  style={[
                    styles.sheetHeader,
                    multiResults.length > 0 && styles.sectionDivider,
                  ]}
                >
                  <Text style={styles.notFoundTitle}>
                    {notFoundItems.length} carte
                    {notFoundItems.length > 1 ? "s" : ""} non trouvée
                    {notFoundItems.length > 1 ? "s" : ""}
                  </Text>
                </View>
                {notFoundItems.map((item, index) => (
                  <View key={index} style={styles.notFoundCard}>
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.notFoundImage}
                      resizeMode="cover"
                    />
                    <View style={styles.notFoundInfo}>
                      <Text style={styles.notFoundText}>
                        Carte non identifiée
                      </Text>
                      <TouchableOpacity
                        style={styles.submitBtn}
                        onPress={() => handleSubmitNew(item.uri)}
                      >
                        <Text style={styles.submitBtnText}>
                          Soumettre cette carte
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
            )}
          </ScrollView>
        </Animated.View>
      )}
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
  cameraArea: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  hintsContainer: {
    position: "absolute",
    top: Theme.spacing.lg,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  noPermission: { alignItems: "center", gap: Theme.spacing.md },
  noPermissionText: { color: Colors.textMuted, fontSize: Theme.fontSize.base },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(9,12,18,0.75)",
    alignItems: "center",
    justifyContent: "center",
    gap: Theme.spacing.md,
  },
  scanStepText: {
    color: Colors.accent,
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
  },
  scanBtn: {
    position: "absolute",
    bottom: 20,
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  scanBtnInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
  },
  sendBtn: {
    position: "absolute",
    bottom: 110,
    backgroundColor: Colors.accent,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.sm + 2,
    borderRadius: Theme.borderRadius.full,
  },
  sendBtnText: {
    color: Colors.bg,
    fontWeight: Theme.fontWeight.semibold,
    fontSize: Theme.fontSize.base,
  },
  photoCounter: {
    position: "absolute",
    top: Theme.spacing.md,
    right: Theme.spacing.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  photoCounterText: {
    color: Colors.bg,
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.bold,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 0.5,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  sheetContent: {
    padding: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sheetTitle: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  sectionDivider: {
    marginTop: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  notFoundTitle: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.textMuted,
  },
  multiCardItem: {
    marginBottom: Theme.spacing.sm,
  },
  notFoundCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.lg,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  notFoundImage: {
    width: 80,
    height: 120,
  },
  notFoundInfo: {
    flex: 1,
    padding: Theme.spacing.md,
    justifyContent: "space-between",
  },
  notFoundText: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  submitBtn: {
    backgroundColor: Colors.accent + "20",
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.sm,
    alignItems: "center",
  },
  submitBtnText: {
    color: Colors.accent,
    fontSize: Theme.fontSize.sm + 1,
    fontWeight: Theme.fontWeight.medium,
  },
  candidatesRow: {
    flexDirection: "row",
    gap: Theme.spacing.sm,
    justifyContent: "center",
  },
  candidateThumb: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  candidateThumbSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + "20",
  },
  candidateLabel: {
    color: Colors.text,
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.medium,
  },
});
