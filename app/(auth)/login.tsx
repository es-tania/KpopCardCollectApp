import {
    AuthDivider,
    AuthFooter,
    AuthHeader,
    PasswordField,
    SocialButton,
} from "@/src/components/auth";
import { FormField } from "@/src/components/ui/FormField";
import { FormSubmitButton } from "@/src/components/ui/FormSubmitButton";
import { Colors } from "@/src/constants/colors";
import { Theme } from "@/src/constants/theme";
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
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const set = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.email.trim()) e.email = "Email requis";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email invalide";
    if (!form.password) e.password = "Mot de passe requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    router.replace("/(tabs)");

    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    // TODO: appel API auth
    router.replace("/(tabs)");
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
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <AuthHeader
            title="Bon retour !"
            subtitle="Connecte-toi pour accéder à ta collection"
          />

          {/* Connexion sociale */}
          <View style={styles.socialSection}>
            <SocialButton provider="google" onPress={handleGoogle} />
            {Platform.OS === "ios" && (
              <SocialButton provider="apple" onPress={handleApple} />
            )}
          </View>

          <AuthDivider />

          {/* Formulaire email */}
          <View style={styles.form}>
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

            {/* Mot de passe oublié */}
            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>
          </View>

          <FormSubmitButton
            label="Se connecter"
            onPress={handleLogin}
            loading={loading}
          />

          {/* Footer */}
          <AuthFooter
            text="Pas encore de compte ?"
            linkLabel="S'inscrire"
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
