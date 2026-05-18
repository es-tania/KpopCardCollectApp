import * as FileSystem from "expo-file-system/legacy";
import { Image } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import { SaveFormat } from "expo-image-manipulator";
import { Check, X, ZoomIn, ZoomOut } from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface ImageCropperModalProps {
  visible: boolean;
  imageUri: string;
  aspectRatio: number;
  onCrop: (uri: string) => void;
  onClose: () => void;
}

const SCREEN = Dimensions.get("window");
const PADDING = 24;
const MAX_W = SCREEN.width - PADDING * 2;
const HANDLE_SIZE = 22;
const MIN_CROP = 60;

type Corner = "tl" | "tr" | "bl" | "br";

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  visible,
  imageUri,
  aspectRatio,
  onCrop,
  onClose,
}) => {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [imgSize, setImgSize] = useState({ w: 1, h: 1 });
  const [displaySize, setDisplaySize] = useState({ w: MAX_W, h: MAX_W });
  const [crop, setCrop] = useState<CropRect>({
    x: 0,
    y: 0,
    w: MAX_W,
    h: MAX_W,
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);
  const scaledW = Math.round(displaySize.w * zoom);
  const scaledH = Math.round(displaySize.h * zoom);
  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 });
  const imgOffsetRef = useRef({ x: 0, y: 0 });

  const cropRef = useRef<CropRect>({ x: 0, y: 0, w: MAX_W, h: MAX_W });
  const displayRef = useRef({ w: MAX_W, h: MAX_W });

  // ── Téléchargement + dimensions ───────────────────────────────────────
  useEffect(() => {
    if (!visible) return;
    setLoading(true);

    const prepare = async () => {
      try {
        let uri = imageUri;
        if (imageUri.startsWith("http")) {
          const dest = `${FileSystem.documentDirectory}crop_src_${Date.now()}.jpg`;
          const { uri: dl } = await FileSystem.downloadAsync(imageUri, dest);
          uri = dl;
        }
        setLocalUri(uri);

        await new Promise<void>((resolve) => {
          require("react-native").Image.getSize(uri, (w: number, h: number) => {
            setImgSize({ w, h });

            // Calcule la taille d'affichage
            const imgRatio = w / h;
            let dw = MAX_W;
            let dh = MAX_W / imgRatio;

            // Limite la hauteur à 65% de l'écran
            const maxH = SCREEN.height * 0.65;
            if (dh > maxH) {
              dh = maxH;
              dw = maxH * imgRatio;
            }

            dw = Math.round(dw);
            dh = Math.round(dh);

            displayRef.current = { w: dw, h: dh };
            setDisplaySize({ w: dw, h: dh });

            // Crop initial = zone centrée respectant l'aspectRatio
            const cropH = Math.min(dh, Math.round(dw / aspectRatio));
            const cropW = Math.round(cropH * aspectRatio);
            const cx = Math.round((dw - cropW) / 2);
            const cy = Math.round((dh - cropH) / 2);
            const initial = { x: cx, y: cy, w: cropW, h: cropH };
            cropRef.current = initial;
            setCrop(initial);
            resolve();
          });
        });
      } catch (e) {
        console.error("prepare:", e);
      } finally {
        setLoading(false);
      }
    };
    prepare();
  }, [visible, imageUri, aspectRatio]);

  const startCrop = useRef<CropRect>({ x: 0, y: 0, w: 0, h: 0 });

  const makePanResponder = useCallback(
    (corner: Corner) =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          startCrop.current = { ...cropRef.current }; // ← capture au début du geste
        },
        onPanResponderMove: (_, gs) => {
          const { w: dw, h: dh } = displayRef.current;
          const prev = startCrop.current; // ← utilise le snapshot, pas le courant

          let { x, y, w, h } = prev;

          switch (corner) {
            case "tl": {
              const newX = Math.max(
                0,
                Math.min(prev.x + prev.w - MIN_CROP, prev.x + gs.dx),
              );
              w = prev.x + prev.w - newX;
              h = Math.round(w / aspectRatio); // ← déduit la hauteur du ratio
              y = prev.y + prev.h - h; // ← ajuste y pour rester ancré en bas-droite
              x = newX;
              break;
            }
            case "tr": {
              w = Math.max(MIN_CROP, Math.min(dw - prev.x, prev.w + gs.dx));
              h = Math.round(w / aspectRatio);
              y = prev.y + prev.h - h; // ← ancre le bas, y remonte quand on agrandit
              break;
            }
            case "bl": {
              const newX = Math.max(
                0,
                Math.min(prev.x + prev.w - MIN_CROP, prev.x + gs.dx),
              );
              w = prev.x + prev.w - newX;
              h = Math.round(w / aspectRatio);
              x = newX;
              // y inchangé, ancré en haut
              break;
            }
            case "br": {
              w = Math.max(MIN_CROP, Math.min(dw - prev.x, prev.w + gs.dx));
              h = Math.round(w / aspectRatio);
              // ancré en haut-gauche
              break;
            }
          }

          const next = { x, y, w, h };
          cropRef.current = next;
          setCrop({ ...next });
        },
      }),
    [aspectRatio],
  );

  // Même chose pour le pan de déplacement
  const startOffset = useRef({ x: 0, y: 0 });

  const movePan = useCallback(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          startOffset.current = { x: cropRef.current.x, y: cropRef.current.y };
        },
        onPanResponderMove: (_, gs) => {
          const { w: dw, h: dh } = displayRef.current;
          const prev = cropRef.current;

          const newX = Math.max(
            0,
            Math.min(dw - prev.w, startOffset.current.x + gs.dx),
          );
          const newY = Math.max(
            0,
            Math.min(dh - prev.h, startOffset.current.y + gs.dy),
          );

          const next = { ...prev, x: newX, y: newY };
          cropRef.current = next;
          setCrop({ ...next });
        },
      }),
    [],
  );

  const panTL = useMemo(() => makePanResponder("tl"), [makePanResponder]);
  const panTR = useMemo(() => makePanResponder("tr"), [makePanResponder]);
  const panBL = useMemo(() => makePanResponder("bl"), [makePanResponder]);
  const panBR = useMemo(() => makePanResponder("br"), [makePanResponder]);
  const panMove = useRef(movePan()).current;

  // ── Crop final ────────────────────────────────────────────────────────
  const handleCrop = async () => {
    if (!localUri) return;
    setProcessing(true);
    try {
      const sw = Math.round(displaySize.w * zoom);
      const sh = Math.round(displaySize.h * zoom);
      const originX = (displaySize.w - sw) / 2 + imgOffset.x;
      const originY = (displaySize.h - sh) / 2 + imgOffset.y;

      const scaleX = imgSize.w / sw;
      const scaleY = imgSize.h / sh;

      const realX = Math.max(0, Math.round((crop.x - originX) * scaleX));
      const realY = Math.max(0, Math.round((crop.y - originY) * scaleY));
      const realW = Math.min(imgSize.w - realX, Math.round(crop.w * scaleX));
      const realH = Math.min(imgSize.h - realY, Math.round(crop.h * scaleY));

      const result = await ImageManipulator.manipulateAsync(
        localUri,
        [
          {
            crop: {
              originX: realX,
              originY: realY,
              width: realW,
              height: realH,
            },
          },
          { resize: { width: 800 } },
        ],
        { compress: 0.85, format: SaveFormat.JPEG },
      );

      onCrop(result.uri);
      onClose();
    } catch (err: any) {
      console.error("crop error:", err.message);
    } finally {
      setProcessing(false);
    }
  };

  // ── Overlay (zones sombres autour du cadre) ───────────────────────────
  const renderOverlay = () => {
    const { w: dw, h: dh } = displaySize;
    const { x, y, w, h } = crop;
    const dim = "rgba(0,0,0,0.55)";
    return (
      <>
        {/* Haut */}
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { height: y, backgroundColor: dim },
          ]}
        />
        {/* Bas */}
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { top: y + h, backgroundColor: dim },
          ]}
        />
        {/* Gauche */}
        <View
          style={{
            position: "absolute",
            top: y,
            left: 0,
            width: x,
            height: h,
            backgroundColor: dim,
          }}
        />
        {/* Droite */}
        <View
          style={{
            position: "absolute",
            top: y,
            left: x + w,
            right: 0,
            height: h,
            backgroundColor: dim,
          }}
        />
      </>
    );
  };

  const hs = HANDLE_SIZE;
  const ho = -(hs / 2); // offset pour centrer sur le coin

  const handleZoom = (factor: number) => {
    const newZoom = Math.max(1, Math.min(4, zoomRef.current * factor));
    zoomRef.current = newZoom;
    setZoom(newZoom);

    // Recentre l'offset si nécessaire
    const sw = Math.round(displaySize.w * newZoom);
    const sh = Math.round(displaySize.h * newZoom);
    const maxOx = Math.max(0, (sw - displaySize.w) / 2);
    const maxOy = Math.max(0, (sh - displaySize.h) / 2);
    const clamped = {
      x: Math.max(-maxOx, Math.min(maxOx, imgOffsetRef.current.x)),
      y: Math.max(-maxOy, Math.min(maxOy, imgOffsetRef.current.y)),
    };
    imgOffsetRef.current = clamped;
    setImgOffset(clamped);

    // Recale le crop dans les nouvelles limites
    const next = {
      ...cropRef.current,
      x: Math.min(cropRef.current.x, sw - cropRef.current.w),
      y: Math.min(cropRef.current.y, sh - cropRef.current.h),
    };
    cropRef.current = next;
    setCrop(next);
  };

  const imgStartOffset = useRef({ x: 0, y: 0 });

  const imgPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        imgStartOffset.current = { ...imgOffsetRef.current };
      },
      onPanResponderMove: (_, gs) => {
        const sw = Math.round(displayRef.current.w * zoomRef.current);
        const sh = Math.round(displayRef.current.h * zoomRef.current);
        const maxOx = Math.max(0, (sw - displayRef.current.w) / 2);
        const maxOy = Math.max(0, (sh - displayRef.current.h) / 2);
        const clamped = {
          x: Math.max(
            -maxOx,
            Math.min(maxOx, imgStartOffset.current.x + gs.dx),
          ),
          y: Math.max(
            -maxOy,
            Math.min(maxOy, imgStartOffset.current.y + gs.dy),
          ),
        };
        imgOffsetRef.current = clamped;
        setImgOffset(clamped);
      },
    }),
  ).current;
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        {/* Navbar */}
        <View style={styles.navbar}>
          <TouchableOpacity style={styles.navBtn} onPress={onClose}>
            <X size={20} color={Colors.text} strokeWidth={1.8} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Recadrer l'image</Text>
          <TouchableOpacity
            style={[styles.navBtn, styles.confirmBtn]}
            onPress={handleCrop}
            disabled={processing || loading}
          >
            {processing ? (
              <ActivityIndicator color={Colors.bg} size="small" />
            ) : (
              <Check size={18} color={Colors.bg} strokeWidth={2.5} />
            )}
          </TouchableOpacity>
        </View>

        {/* Zone d'édition */}
        <View style={styles.canvas}>
          {loading ? (
            <ActivityIndicator color={Colors.accent} size="large" />
          ) : (
            <View style={{ width: displaySize.w, height: displaySize.h }}>
              {/* Image + overlays — overflow hidden pour ne pas déborder */}
              <View
                style={{
                  width: displaySize.w,
                  height: displaySize.h,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: scaledW,
                    height: scaledH,
                    position: "absolute",
                    top: (displaySize.h - scaledH) / 2,
                    left: (displaySize.w - scaledW) / 2,
                    transform: [
                      { translateX: imgOffset.x },
                      { translateY: imgOffset.y },
                    ],
                  }}
                  {...imgPan.panHandlers}
                >
                  {localUri && (
                    <Image
                      source={{ uri: localUri }}
                      style={{ width: scaledW, height: scaledH }}
                      contentFit="fill"
                    />
                  )}
                </View>

                {/* Overlays sombres */}
                {renderOverlay()}

                {/* Cadre de crop */}
                <View
                  style={[
                    styles.cropFrame,
                    {
                      left: crop.x,
                      top: crop.y,
                      width: crop.w,
                      height: crop.h,
                    },
                  ]}
                  {...panMove.panHandlers}
                >
                  <View
                    style={[styles.gridLine, styles.gridH, { top: "33.3%" }]}
                  />
                  <View
                    style={[styles.gridLine, styles.gridH, { top: "66.6%" }]}
                  />
                  <View
                    style={[styles.gridLine, styles.gridV, { left: "33.3%" }]}
                  />
                  <View
                    style={[styles.gridLine, styles.gridV, { left: "66.6%" }]}
                  />
                </View>
              </View>

              {/* Poignées — en dehors du overflow hidden, par dessus tout */}
              <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
                <View
                  style={[
                    styles.handle,
                    { top: crop.y + ho, left: crop.x + ho },
                  ]}
                  {...panTL.panHandlers}
                >
                  <View style={[styles.handleCorner, styles.handleTL]} />
                </View>
                <View
                  style={[
                    styles.handle,
                    { top: crop.y + ho, left: crop.x + crop.w + ho },
                  ]}
                  {...panTR.panHandlers}
                >
                  <View style={[styles.handleCorner, styles.handleTR]} />
                </View>
                <View
                  style={[
                    styles.handle,
                    { top: crop.y + crop.h + ho, left: crop.x + ho },
                  ]}
                  {...panBL.panHandlers}
                >
                  <View style={[styles.handleCorner, styles.handleBL]} />
                </View>
                <View
                  style={[
                    styles.handle,
                    { top: crop.y + crop.h + ho, left: crop.x + crop.w + ho },
                  ]}
                  {...panBR.panHandlers}
                >
                  <View style={[styles.handleCorner, styles.handleBR]} />
                </View>
              </View>
            </View>
          )}
        </View>

        <Text style={styles.hint}>Glisse les coins · Déplace le cadre</Text>

        <View style={styles.zoomRow}>
          <TouchableOpacity
            style={styles.zoomBtn}
            onPress={() => handleZoom(1 / 1.3)}
          >
            <ZoomOut size={20} color={Colors.text} strokeWidth={1.6} />
          </TouchableOpacity>
          <Text style={styles.zoomLabel}>{Math.round(zoom * 100)}%</Text>
          <TouchableOpacity
            style={styles.zoomBtn}
            onPress={() => handleZoom(1.3)}
          >
            <ZoomIn size={20} color={Colors.text} strokeWidth={1.6} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const CORNER_BORDER = 3;
const CORNER_SIZE = 16;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000" },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.borderRadius.full,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  confirmBtn: { backgroundColor: Colors.accent },
  navTitle: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
  },
  canvas: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cropFrame: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.85)",
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  gridH: { left: 0, right: 0, height: StyleSheet.hairlineWidth },
  gridV: { top: 0, bottom: 0, width: StyleSheet.hairlineWidth },
  handle: {
    position: "absolute",
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  handleCorner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: "#fff",
  },
  handleTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_BORDER,
    borderLeftWidth: CORNER_BORDER,
  },
  handleTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_BORDER,
    borderRightWidth: CORNER_BORDER,
  },
  handleBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_BORDER,
    borderLeftWidth: CORNER_BORDER,
  },
  handleBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_BORDER,
    borderRightWidth: CORNER_BORDER,
  },
  hint: {
    textAlign: "center",
    fontSize: Theme.fontSize.xs + 1,
    color: "rgba(255,255,255,0.4)",
    paddingVertical: Theme.spacing.md,
  },
  zoomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Theme.spacing.xl,
    paddingVertical: Theme.spacing.lg,
  },
  zoomBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.borderRadius.full,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  zoomLabel: {
    fontSize: Theme.fontSize.base,
    color: Colors.text,
    fontWeight: Theme.fontWeight.medium,
    minWidth: 50,
    textAlign: "center",
  },
});
