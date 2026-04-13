import { FormDatePicker } from "@/src/components/ui/FormDatePicker";
import {
  ALBUM_TYPE_OPTIONS,
  CATEGORY_OPTIONS,
  YES_NO_OPTIONS,
} from "@/src/constants/options";
import { useAddAlbum } from "@/src/hooks/useAddAlbum";
import { useGroups } from "@/src/hooks/useGroups";
import { AlbumFormErrors, AlbumFormState, SelectOption } from "@/src/types";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FormField } from "../../src/components/ui/FormField";
import { FormImagePicker } from "../../src/components/ui/FormImagePicker";
import { FormSelect } from "../../src/components/ui/FormSelect";
import { FormSubmitButton } from "../../src/components/ui/FormSubmitButton";
import { Colors } from "../../src/constants/colors";
import { Theme } from "../../src/constants/theme";

const pickLocalImage = async (
  onPicked: (uri: string) => void,
  aspect?: [number, number],
) => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: aspect ?? [1, 1],
    quality: 0.85,
  });
  if (!result.canceled) onPicked(result.assets[0].uri);
};

export default function AddAlbumScreen() {
  const { groups } = useGroups();

  const groupOptions: SelectOption[] = groups.map((g) => ({
    key: g.id,
    label: g.name,
  }));

  const [form, setForm] = useState<AlbumFormState>({
    groupId: "",
    groupName: "",
    title: "",
    koreanTitle: "",
    type: "",
    category: "music",
    releaseDate: "",
    eventName: "",
    eventLocation: "",
    eventDate: "",
    versions: "",
    hasPOB: "non",
    isLimited: "non",
    coverUri: "",
    tags: "",
    removeCore: false,
  });
  console.log(form);
  const [errors, setErrors] = useState<AlbumFormErrors>({});

  const { loading, progress, error, submit } = useAddAlbum(() => {
    Alert.alert("✅ Succès", `Album "${form.title}" ajouté !`, [
      { text: "OK", onPress: () => router.back() },
    ]);
  });

  React.useEffect(() => {
    if (error) Alert.alert("Erreur", error);
  }, [error]);

  const set = (key: keyof AlbumFormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setGroup = (key: keyof AlbumFormState) => (value: string) => {
    const option = groupOptions.find((o) => o.key === value);

    setForm((prev) => ({
      ...prev,
      [key]: value,
      groupName: option?.label ?? "",
    }));
  };

  const validate = (): boolean => {
    const e: AlbumFormErrors = {};
    if (!form.groupId) e.groupId = "Groupe requis";
    if (!form.title.trim()) e.title = "Titre requis";
    if (!form.type) e.type = "Type requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await submit(form);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Ajouter un album</Text>
        <View style={styles.navBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Cover ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Couverture</Text>
          <FormImagePicker
            label="Couverture"
            imageUri={form.coverUri}
            onPick={() => pickLocalImage((uri) => set("coverUri")(uri), [1, 1])}
            onRemove={() => set("coverUri")("")}
            aspectRatio={1}
          />
        </View>

        {/* ── Identité ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identification</Text>
          <FormSelect
            label="Groupe"
            options={groupOptions}
            value={form.groupId}
            onChange={setGroup("groupId")}
            required
            error={errors.groupId}
          />
          <FormField
            label="Titre"
            value={form.title}
            onChangeText={set("title")}
            placeholder="ex: UNIQUE"
            required
            error={errors.title}
            autoCapitalize="words"
          />
          <FormField
            label="Titre coréen"
            value={form.koreanTitle}
            onChangeText={set("koreanTitle")}
            placeholder="ex: 유니크"
          />
          <FormSelect
            label="Type"
            options={ALBUM_TYPE_OPTIONS}
            value={form.type}
            onChange={set("type")}
            required
            error={errors.type}
          />
          <FormSelect
            label="Catégorie"
            options={CATEGORY_OPTIONS}
            value={form.category}
            onChange={set("category")}
          />
        </View>

        {/* ── Dates ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dates</Text>
          <FormDatePicker
            label="Date de sortie"
            value={form.releaseDate}
            onChange={set("releaseDate")}
          />
          <FormDatePicker
            label="Date de l'event"
            value={form.eventDate}
            onChange={set("eventDate")}
          />
        </View>

        {/* ── Event ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event (optionnel)</Text>
          <FormField
            label="Nom de l'event"
            value={form.eventName}
            onChangeText={set("eventName")}
            placeholder="ex: Weverse Fansign Vol.3"
          />
          <FormField
            label="Lieu"
            value={form.eventLocation}
            onChangeText={set("eventLocation")}
            placeholder="ex: Seoul, Corée du Sud"
          />
        </View>

        {/* ── Détails ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails</Text>
          <FormField
            label="Versions"
            value={form.versions}
            onChangeText={set("versions")}
            placeholder="ex: A, B, Digipack (séparées par virgule)"
          />
          <FormField
            label="Tags"
            value={form.tags}
            onChangeText={set("tags")}
            placeholder="ex: 1st mini, debut (séparés par virgule)"
          />
          <FormSelect
            label="Contient des POB ?"
            options={YES_NO_OPTIONS}
            value={form.hasPOB}
            onChange={set("hasPOB")}
          />
          <FormSelect
            label="Édition limitée ?"
            options={YES_NO_OPTIONS}
            value={form.isLimited}
            onChange={set("isLimited")}
          />
        </View>

        {/* ── Progression ── */}
        {progress && (
          <View style={styles.progressWrap}>
            <ActivityIndicator size="small" color={Colors.accent} />
            <Text style={styles.progressText}>{progress}</Text>
          </View>
        )}

        <FormSubmitButton
          label="Ajouter l'album"
          onPress={handleSubmit}
          loading={loading}
        />
      </ScrollView>
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
  scroll: { flex: 1 },
  content: {
    padding: Theme.spacing.lg,
    gap: Theme.spacing.xl,
  },
  section: { gap: Theme.spacing.md },
  sectionTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    paddingBottom: Theme.spacing.sm,
  },
  progressWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
    padding: Theme.spacing.md,
  },
  progressText: {
    fontSize: Theme.fontSize.base,
    color: Colors.accent,
  },
});
