import { FormField } from "@/src/components/ui/FormField";
import { FormSubmitButton } from "@/src/components/ui/FormSubmitButton";
import { useTranslation } from "@/src/hooks/useTranslation";
import { supabase } from "@/src/lib/supabase";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../src/constants/colors";
import { Theme } from "../../src/constants/theme";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ChangeEmailScreen() {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError(t("errors.required"));
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setError(t("errors.invalidEmail"));
      return;
    }

    setError("");
    setLoading(true);
    const { error: supaError } = await supabase.auth.updateUser({
      email: trimmed,
    });
    setLoading(false);

    if (supaError) {
      setError(supaError.message);
    } else {
      Alert.alert(t("success.emailSent"), t("settings.account.emailHint"), [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t("settings.account.changeEmail")}</Text>
        <View style={styles.navBtn} />
      </View>

      <View style={styles.content}>
        <Text style={styles.hint}>{t("settings.account.emailHint")}</Text>
        <FormField
          label={t("settings.account.newEmail")}
          required
          value={value}
          onChangeText={setValue}
          error={error}
          autoFocus
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
        <FormSubmitButton
          label={t("settings.account.sendConfirmation")}
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
