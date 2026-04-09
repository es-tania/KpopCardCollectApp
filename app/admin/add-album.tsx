import {
  ALBUM_TYPE_OPTIONS,
  CATEGORY_OPTIONS,
  YES_NO_OPTIONS,
} from "@/src/constants/options";
import { AlbumFormErrors, AlbumFormState, SelectOption } from "@/src/types";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import {
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
import { MOCK_GROUPS } from "../../src/data/mockGroups";

const INITIAL: AlbumFormState = {
  groupId: "",
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
};

export default function AddAlbumScreen() {
  const [form, setForm] = useState<AlbumFormState>(INITIAL);
  const [errors, setErrors] = useState<AlbumFormErrors>({});
  const [loading, setLoading] = useState(false);

  const set = (key: keyof AlbumFormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const groupOptions: SelectOption[] = MOCK_GROUPS.map((g) => ({
    key: g.id,
    label: g.name,
  }));

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
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    Alert.alert("✅ Succès", "Album ajouté avec succès !", [
      { text: "OK", onPress: () => router.back() },
    ]);
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
            label="Image de couverture"
            imageUri={form.coverUri}
            onPick={() => set("coverUri")("https://picsum.photos/400/400")}
            onRemove={() => set("coverUri")("")}
            aspectRatio={1}
          />
        </View>

        {/* ── Identité ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identité</Text>
          <FormSelect
            label="Groupe"
            options={groupOptions}
            value={form.groupId}
            onChange={set("groupId")}
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
          <FormField
            label="Date de sortie"
            value={form.releaseDate}
            onChangeText={set("releaseDate")}
            placeholder="YYYY-MM-DD"
          />
          <FormField
            label="Date de l'event"
            value={form.eventDate}
            onChangeText={set("eventDate")}
            placeholder="YYYY-MM-DD"
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
});
