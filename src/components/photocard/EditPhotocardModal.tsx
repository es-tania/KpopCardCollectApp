import { EditForm } from "@/src/components/admin/photocard/EditForm";
import { useEditPhotocard } from "@/src/hooks/photocard/useEditPhotocard";
import { useCacheStore } from "@/src/store/cacheStore";
import { PhotocardWithDetails } from "@/src/types";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface EditPhotocardModalProps {
  card: PhotocardWithDetails;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditPhotocardModal: React.FC<EditPhotocardModalProps> = ({
  card,
  visible,
  onClose,
  onSuccess,
}) => {
  const { invalidateAll } = useCacheStore();

  const { loading, progress, error, submit } = useEditPhotocard(async () => {
    invalidateAll("photocards:");
    Alert.alert("✅ Enregistré", "La photocard a été modifiée.", [
      { text: "OK", onPress: onSuccess },
    ]);
  });

  React.useEffect(() => {
    if (error) Alert.alert("Erreur", error);
  }, [error]);

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
          onCancel={onClose}
          loading={loading}
          progress={progress}
        />
      </SafeAreaView>
    </Modal>
  );
};

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
});
