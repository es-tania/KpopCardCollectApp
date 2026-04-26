import { AuthFooter, AuthHeader, PasswordField } from "@/src/components/auth";
import { FormField } from "@/src/components/ui/FormField";
import { FormSubmitButton } from "@/src/components/ui/FormSubmitButton";
import { Colors } from "@/src/constants/colors";
import { Theme } from "@/src/constants/theme";
import { useTranslation } from "@/src/hooks/useTranslation";
import { authService } from "@/src/services";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FormState {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginScreen() {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const set = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.email.trim()) e.email = t("errors.required");
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = t("errors.invalidEmail");
    if (!form.password) e.password = t("errors.required");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.signInWithEmail(form.email, form.password);
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert(t("common.error"), error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = useCallback(() => {
    // TODO: expo-auth-session avec Google
    Alert.alert(
      "Google",
      "Authentification Google — à implémenter avec expo-auth-session",
    );
  }, []);

  const handleApple = useCallback(() => {
    // TODO: expo-apple-authentication
    Alert.alert(
      "Apple",
      "Authentification Apple — à implémenter avec expo-apple-authentication",
    );
  }, []);

  const handleForgotPassword = useCallback(() => {
    // TODO: page reset mot de passe
    Alert.alert(
      "Mot de passe oublié",
      "Un email de réinitialisation sera envoyé.",
    );
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={true}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <AuthHeader
            title={t("auth.loginTitle")}
            subtitle={t("auth.loginSubtitle")}
          />

          {/* Connexion sociale */}
          {/* <View style={styles.socialSection}>
            <SocialButton provider="google" onPress={handleGoogle} />
            {Platform.OS === "ios" && (
              <SocialButton provider="apple" onPress={handleApple} />
            )}
          </View> */}

          {/* <AuthDivider /> */}

          {/* Formulaire email */}
          <View style={styles.form}>
            <FormField
              label={t("fields.email")}
              value={form.email}
              onChangeText={set("email")}
              placeholder="ton@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              required
              error={errors.email}
            />
            <PasswordField
              label={t("fields.password")}
              value={form.password}
              onChangeText={set("password")}
              required
              error={errors.password}
            />

            {/* Mot de passe oublié */}
            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotText}>{t("auth.forgotPassword")}</Text>
            </TouchableOpacity>
          </View>

          <FormSubmitButton
            label={t("auth.loginButton")}
            onPress={handleLogin}
            loading={loading}
          />

          {/* Footer */}
          <AuthFooter
            text={t("auth.noAccount")}
            linkLabel={t("auth.signUp")}
            onPress={() => router.push("/(auth)/register")}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  kav: { flex: 1 },
  content: {
    flexGrow: 1,
    padding: Theme.spacing.xl,
    gap: Theme.spacing.xl,
    justifyContent: "center",
  },
  socialSection: {
    gap: Theme.spacing.md,
  },
  form: {
    gap: Theme.spacing.md,
  },
  forgotBtn: {
    alignSelf: "flex-end",
  },
  forgotText: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.accent,
  },
});
