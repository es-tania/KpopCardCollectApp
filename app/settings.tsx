import {
  SettingsAvatarEditor,
  SettingsRow,
  SettingsSection,
} from "@/src/components/settings";
import { useSettings } from "@/src/hooks/useSettings";
import { router } from "expo-router";
import {
  Bell,
  ChevronLeft,
  Eye,
  Globe,
  Heart,
  HelpCircle,
  Info,
  KeyRound,
  Languages,
  Lock,
  LogOut,
  Mail,
  Shield,
  Smartphone,
  Trash2,
  User,
} from "lucide-react-native";
import React, { useCallback } from "react";
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
import { Colors } from "../src/constants/colors";
import { Theme } from "../src/constants/theme";

export default function SettingsScreen() {
  const { profile, prefs, handlers } = useSettings();
  const { user, username, email, avatarUrl, loading } = profile;
  const { notifications, submissionNotifs, collectionNotifs, publicProfile, showCollection, showWishlist } = prefs;
  const {
    toggleNotifications, toggleSubmissionNotifs, toggleCollectionNotifs,
    togglePublicProfile, toggleShowCollection, toggleShowWishlist,
    changeAvatar, changeUsername, changeEmail, changePassword,
    exportData, deleteAccount, logout,
  } = handlers;

  // ── Langue — purement UI, reste dans la page ──────────────────────────
  const handleLanguage = useCallback(() => {
    Alert.alert("Langue", "Choisir une langue", [
      { text: "Français 🇫🇷", onPress: () => {} },
      { text: "English 🇬🇧", onPress: () => {} },
      { text: "한국어 🇰🇷", onPress: () => {} },
      { text: "Annuler", style: "cancel" },
    ]);
  }, []);

  // ── Support — purement UI ─────────────────────────────────────────────
  const handleSupport = useCallback(() => {
    Alert.alert("Support", "support@kardvault.app");
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Paramètres</Text>
        <View style={styles.navBtn} />
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* ── Avatar ── */}
          <SettingsAvatarEditor
            user={{ ...user, username, avatarUrl } as any}
            onPressAvatar={changeAvatar}
          />

          {/* ── Compte ── */}
          <SettingsSection title="Compte">
            <SettingsRow
              icon={<User size={16} color={Colors.accent} strokeWidth={1.6} />}
              label="Pseudo"
              type="navigate"
              valueLabel={username || "Non défini"}
              onPress={changeUsername}
            />
            <SettingsRow
              icon={<Mail size={16} color={Colors.accent} strokeWidth={1.6} />}
              label="Email"
              type="navigate"
              valueLabel={email}
              onPress={changeEmail}
            />
            <SettingsRow
              icon={
                <KeyRound size={16} color={Colors.accent} strokeWidth={1.6} />
              }
              label="Mot de passe"
              type="navigate"
              onPress={changePassword}
              showSeparator={false}
            />
          </SettingsSection>

          {/* ── Notifications ── */}
          <SettingsSection title="Notifications">
            <SettingsRow
              icon={<Bell size={16} color="#DAA520" strokeWidth={1.6} />}
              label="Activer les notifications"
              type="toggle"
              value={notifications}
              onToggle={toggleNotifications}
            />
            <SettingsRow
              icon={<Shield size={16} color="#DAA520" strokeWidth={1.6} />}
              label="Soumissions validées"
              sublabel="Reçois une notif quand ta carte est approuvée"
              type="toggle"
              value={submissionNotifs}
              onToggle={toggleSubmissionNotifs}
              disabled={!notifications}
            />
            <SettingsRow
              icon={<Heart size={16} color="#DAA520" strokeWidth={1.6} />}
              label="Nouveautés collection"
              sublabel="Nouvelles cartes pour tes groupes suivis"
              type="toggle"
              value={collectionNotifs}
              onToggle={toggleCollectionNotifs}
              disabled={!notifications}
              showSeparator={false}
            />
          </SettingsSection>

          {/* ── Confidentialité ── */}
          <SettingsSection title="Confidentialité">
            <SettingsRow
              icon={<Globe size={16} color={Colors.accent} strokeWidth={1.6} />}
              label="Profil public"
              sublabel="Les autres utilisateurs peuvent voir ton profil"
              type="toggle"
              value={publicProfile}
              onToggle={togglePublicProfile}
            />
            <SettingsRow
              icon={<Eye size={16} color={Colors.accent} strokeWidth={1.6} />}
              label="Afficher ma collection"
              type="toggle"
              value={showCollection}
              onToggle={toggleShowCollection}
              disabled={!publicProfile}
            />
            <SettingsRow
              icon={<Eye size={16} color={Colors.accent} strokeWidth={1.6} />}
              label="Afficher ma wishlist"
              type="toggle"
              value={showWishlist}
              onToggle={toggleShowWishlist}
              disabled={!publicProfile}
              showSeparator={false}
            />
          </SettingsSection>

          {/* ── Langue ── */}
          <SettingsSection title="Langue">
            <SettingsRow
              icon={
                <Languages
                  size={16}
                  color={Colors.textMuted}
                  strokeWidth={1.6}
                />
              }
              label="Langue"
              type="navigate"
              valueLabel="Français"
              onPress={handleLanguage}
              showSeparator={false}
            />
          </SettingsSection>

          {/* ── Données ── */}
          <SettingsSection title="Mes données">
            <SettingsRow
              icon={
                <Smartphone
                  size={16}
                  color={Colors.textMuted}
                  strokeWidth={1.6}
                />
              }
              label="Exporter mes données"
              sublabel="Télécharge toutes tes données"
              type="navigate"
              onPress={exportData}
              showSeparator={false}
            />
          </SettingsSection>

          {/* ── À propos ── */}
          <SettingsSection title="À propos">
            <SettingsRow
              icon={
                <Info size={16} color={Colors.textMuted} strokeWidth={1.6} />
              }
              label="Version"
              type="info"
              valueLabel="1.0.0"
            />
            <SettingsRow
              icon={
                <Lock size={16} color={Colors.textMuted} strokeWidth={1.6} />
              }
              label="Politique de confidentialité"
              type="navigate"
              onPress={() => {}}
            />
            <SettingsRow
              icon={
                <HelpCircle
                  size={16}
                  color={Colors.textMuted}
                  strokeWidth={1.6}
                />
              }
              label="Aide & Support"
              type="navigate"
              onPress={handleSupport}
              showSeparator={false}
            />
          </SettingsSection>

          {/* ── Danger ── */}
          <SettingsSection title="Danger">
            <SettingsRow
              icon={
                <LogOut size={16} color={Colors.danger} strokeWidth={1.6} />
              }
              label="Déconnexion"
              type="action"
              onPress={logout}
              destructive
            />
            <SettingsRow
              icon={
                <Trash2 size={16} color={Colors.danger} strokeWidth={1.6} />
              }
              label="Supprimer mon compte"
              sublabel="Action irréversible"
              type="action"
              onPress={deleteAccount}
              destructive
              showSeparator={false}
            />
          </SettingsSection>

          <View style={styles.bottomPad} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
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
  bottomPad: { height: 40 },
});
