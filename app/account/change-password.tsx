import { FormField } from "@/src/components/ui/FormField";
import { FormSubmitButton } from "@/src/components/ui/FormSubmitButton";
import { useTranslation } from "@/src/hooks/useTranslation";
import { supabase } from "@/src/lib/supabase";
import { router } from "expo-router";
import { ChevronLeft, Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../src/constants/colors";
import { Theme } from "../../src/constants/theme";

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>(
    {},
  );
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (password.length < 8) e.password = t("errors.minLength", { count: 8 });
    if (password !== confirm) e.confirm = t("errors.passwordMismatch");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setErrors({ password: error.message });
    } else {
      Alert.alert(t("success.passwordUpdated"), "", [
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
        <Text style={styles.navTitle}>
          {t("settings.account.changePassword")}
        </Text>
        <View style={styles.navBtn} />
      </View>

      <View style={styles.content}>
        <Text style={styles.hint}>{t("settings.account.passwordHint")}</Text>

        <FormField
          label={t("settings.account.newPassword")}
          required
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          autoFocus
          secureTextEntry={!showPassword}
          returnKeyType="next"
          rightElement={
            <TouchableOpacity
              onPress={() => setShowPassword((v) => !v)}
              style={styles.eyeBtn}
            >
              {showPassword ? (
                <EyeOff size={18} color={Colors.textMuted} strokeWidth={1.6} />
              ) : (
                <Eye size={18} color={Colors.textMuted} strokeWidth={1.6} />
              )}
            </TouchableOpacity>
          }
        />

        <FormField
          label={t("settings.account.confirmPassword")}
          required
          value={confirm}
          onChangeText={setConfirm}
          error={errors.confirm}
          secureTextEntry={!showConfirm}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          rightElement={
            <TouchableOpacity
              onPress={() => setShowConfirm((v) => !v)}
              style={styles.eyeBtn}
            >
              {showConfirm ? (
                <EyeOff size={18} color={Colors.textMuted} strokeWidth={1.6} />
              ) : (
                <Eye size={18} color={Colors.textMuted} strokeWidth={1.6} />
              )}
            </TouchableOpacity>
          }
        />

        <FormSubmitButton
          label={t("common.save")}
          onPress={handleSubmit}
          loading={loading}
          disabled={!password || !confirm}
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
  eyeBtn: {
    padding: Theme.spacing.xs,
  },
});
