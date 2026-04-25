import { AuthFooter, AuthHeader, PasswordField } from "@/src/components/auth";
import { FormField } from "@/src/components/ui/FormField";
import { FormSubmitButton } from "@/src/components/ui/FormSubmitButton";
import { Colors } from "@/src/constants/colors";
import { Theme } from "@/src/constants/theme";
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
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const PASSWORD_RULES = [
  { label: "8 caractères minimum", test: (p: string) => p.length >= 8 },
  { label: "Une majuscule", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Un chiffre", test: (p: string) => /[0-9]/.test(p) },
];

export default function RegisterScreen() {
  const [form, setForm] = useState<FormState>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const set = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.username.trim()) e.username = "Pseudo requis";
    else if (form.username.length < 3) e.username = "3 caractères minimum";
    if (!form.email.trim()) e.email = "Email requis";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email invalide";
    if (!form.password) e.password = "Mot de passe requis";
    else if (form.password.length < 8) e.password = "8 caractères minimum";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Les mots de passe ne correspondent pas";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate() || !acceptedTerms) return;
    setLoading(true);
    try {
      await authService.signUpWithEmail(
        form.email,
        form.password,
        form.username,
      );
      Alert.alert(
        "✅ Compte créé !",
        "Vérifie ton email pour confirmer ton compte.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }],
      );
    } catch (error: any) {
      Alert.alert("Erreur d'inscription", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = useCallback(() => {
    Alert.alert(
      "Google",
      "Authentification Google — à implémenter avec expo-auth-session",
    );
  }, []);

  const handleApple = useCallback(() => {
    Alert.alert(
      "Apple",
      "Authentification Apple — à implémenter avec expo-apple-authentication",
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
            title="Créer un compte"
            subtitle="Rejoins KardVault et gère ta collection"
          />

          {/* Social */}
          {/* <View style={styles.socialSection}>
            <SocialButton provider="google" onPress={handleGoogle} />
            {Platform.OS === "ios" && (
              <SocialButton provider="apple" onPress={handleApple} />
            )}
          </View>

          <AuthDivider /> */}

          {/* Formulaire */}
          <View style={styles.form}>
            <FormField
              label="Pseudo"
              value={form.username}
              onChangeText={set("username")}
              placeholder="ton_pseudo"
              autoCapitalize="none"
              autoCorrect={false}
              required
              error={errors.username}
            />
            <FormField
              label="Email"
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
              label="Mot de passe"
              value={form.password}
              onChangeText={set("password")}
              required
              error={errors.password}
            />

            {/* Indicateur force du mot de passe */}
            {form.password.length > 0 && (
              <View style={styles.passwordRules}>
                {PASSWORD_RULES.map((rule) => {
                  const ok = rule.test(form.password);
                  return (
                    <View key={rule.label} style={styles.ruleRow}>
                      <Text style={ok ? styles.ruleOk : styles.ruleKo}>
                        {ok ? "✓" : "○"}
                      </Text>
                      <Text
                        style={[styles.ruleLabel, ok && styles.ruleLabelOk]}
                      >
                        {rule.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            <PasswordField
              label="Confirmer le mot de passe"
              value={form.confirmPassword}
              onChangeText={set("confirmPassword")}
              placeholder="••••••••"
              required
              error={errors.confirmPassword}
            />
          </View>

          {/* CGU */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAcceptedTerms((v) => !v)}
            activeOpacity={0.75}
          >
            <View
              style={[styles.checkbox, acceptedTerms && styles.checkboxActive]}
            >
              {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              J'accepte les{" "}
              <Text style={styles.termsLink}>conditions d'utilisation</Text> et
              la{" "}
              <Text style={styles.termsLink}>politique de confidentialité</Text>
            </Text>
          </TouchableOpacity>

          <FormSubmitButton
            label="Créer mon compte"
            onPress={handleRegister}
            loading={loading}
            disabled={!acceptedTerms}
          />

          {/* Footer */}
          <AuthFooter
            text="Déjà un compte ?"
            linkLabel="Se connecter"
            onPress={() => router.push("/(auth)/login")}
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

  // Règles mot de passe
  passwordRules: {
    gap: 5,
    padding: Theme.spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ruleOk: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.accent,
    width: 14,
    textAlign: "center",
  },
  ruleKo: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
    width: 14,
    textAlign: "center",
  },
  ruleLabel: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  ruleLabelOk: {
    color: Colors.accent,
  },

  // CGU
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Theme.spacing.sm + 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    flexShrink: 0,
  },
  checkboxActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  checkmark: {
    fontSize: 12,
    color: Colors.bg,
    fontWeight: Theme.fontWeight.bold,
  },
  termsText: {
    flex: 1,
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.accent,
  },
});
