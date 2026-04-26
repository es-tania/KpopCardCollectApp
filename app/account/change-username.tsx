import { FormField } from "@/src/components/ui/FormField";
import { FormSubmitButton } from "@/src/components/ui/FormSubmitButton";
import { useTranslation } from "@/src/hooks/useTranslation";
import { supabase } from "@/src/lib/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../src/constants/colors";
import { Theme } from "../../src/constants/theme";

export default function ChangeUsernameScreen() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError(t("errors.required"));
      return;
    }
    if (trimmed.length < 3) {
      setError(t("errors.minLength", { count: 3 }));
      return;
    }
    if (trimmed.length > 30) {
      setError(t("errors.maxLength", { count: 30 }));
      return;
    }

    setError("");
    setLoading(true);
    const { error: supaError } = await supabase
      .from("profiles")
      .update({ username: trimmed })
      .eq("id", user!.id);
    setLoading(false);

    if (supaError) {
      setError(supaError.message);
    } else {
      Alert.alert(t("success.usernameUpdated"), "", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t("settings.account.changeUsername")}</Text>
        <View style={styles.navBtn} />
      </View>

      <View style={styles.content}>
        <Text style={styles.hint}>{t("settings.account.usernameHint")}</Text>
        <FormField
          label={t("settings.account.newUsername")}
          required
          value={value}
          onChangeText={setValue}
          error={error}
          autoFocus
          autoCapitalize="none"
          maxLength={30}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
        <FormSubmitButton
          label={t("common.save")}
          onPress={handleSubmit}
          loading={loading}
          disabled={!value.trim()}
        />
      </View>
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
  content: {
    padding: Theme.spacing.lg,
    gap: Theme.spacing.lg,
  },
  hint: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textMuted,
    lineHeight: 20,
  },
});
