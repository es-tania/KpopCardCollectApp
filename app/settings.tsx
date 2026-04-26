import {
  SettingsAvatarEditor,
  SettingsRow,
  SettingsSection,
} from "@/src/components/settings";
import { useSettings } from "@/src/hooks/useSettings";
import { useTranslation } from "@/src/hooks/useTranslation";
import type { SupportedLocale } from "@/src/store/languageStore";
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
  const { t, locale, setLocale } = useTranslation();
  const { profile, prefs, handlers } = useSettings();
  const { user, username, email, avatarUrl, loading } = profile;
  const {
    notifications,
    submissionNotifs,
    collectionNotifs,
    publicProfile,
    showCollection,
    showWishlist,
  } = prefs;
  const {
    toggleNotifications,
    toggleSubmissionNotifs,
    toggleCollectionNotifs,
    togglePublicProfile,
    toggleShowCollection,
    toggleShowWishlist,
    changeAvatar,
    changeUsername,
    changeEmail,
    changePassword,
    exportData,
    deleteAccount,
    logout,
  } = handlers;

  const handleLanguage = useCallback(() => {
    Alert.alert(t("settings.language.title"), t("settings.language.choose"), [
      {
        text: `🇫🇷 ${t("settings.language.fr")}`,
        onPress: () => setLocale("fr" as SupportedLocale),
      },
      {
        text: `🇬🇧 ${t("settings.language.en")}`,
        onPress: () => setLocale("en" as SupportedLocale),
      },
      {
        text: `🇰🇷 ${t("settings.language.ko")}`,
        onPress: () => setLocale("ko" as SupportedLocale),
      },
      { text: t("common.cancel"), style: "cancel" },
    ]);
  }, [t, setLocale]);

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
        <Text style={styles.navTitle}>{t("settings.title")}</Text>
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
          <SettingsSection title={t("settings.sections.account")}>
            <SettingsRow
              icon={<User size={16} color={Colors.accent} strokeWidth={1.6} />}
              label={t("settings.account.username")}
              type="navigate"
              valueLabel={username || t("empty.noResults")}
              onPress={changeUsername}
            />
            <SettingsRow
              icon={<Mail size={16} color={Colors.accent} strokeWidth={1.6} />}
              label={t("settings.account.email")}
              type="navigate"
              valueLabel={email}
              onPress={changeEmail}
            />
            <SettingsRow
              icon={
                <KeyRound size={16} color={Colors.accent} strokeWidth={1.6} />
              }
              label={t("settings.account.password")}
              type="navigate"
              onPress={changePassword}
              showSeparator={false}
            />
          </SettingsSection>

          {/* ── Notifications ── */}
          <SettingsSection title={t("settings.sections.notifications")}>
            <SettingsRow
              icon={<Bell size={16} color="#DAA520" strokeWidth={1.6} />}
              label={t("settings.notifications.enable")}
              type="toggle"
              value={notifications}
              onToggle={toggleNotifications}
            />
            <SettingsRow
              icon={<Shield size={16} color="#DAA520" strokeWidth={1.6} />}
              label={t("settings.notifications.submissions")}
              sublabel={t("settings.notifications.submissionsHint")}
              type="toggle"
              value={submissionNotifs}
              onToggle={toggleSubmissionNotifs}
              disabled={!notifications}
            />
            <SettingsRow
              icon={<Heart size={16} color="#DAA520" strokeWidth={1.6} />}
              label={t("settings.notifications.newCards")}
              sublabel={t("settings.notifications.newCardsHint")}
              type="toggle"
              value={collectionNotifs}
              onToggle={toggleCollectionNotifs}
              disabled={!notifications}
              showSeparator={false}
            />
          </SettingsSection>

          {/* ── Confidentialité ── */}
          <SettingsSection title={t("settings.sections.privacy")}>
            <SettingsRow
              icon={<Globe size={16} color={Colors.accent} strokeWidth={1.6} />}
              label={t("settings.privacy.publicProfile")}
              sublabel={t("settings.privacy.publicProfileHint")}
              type="toggle"
              value={publicProfile}
              onToggle={togglePublicProfile}
            />
            <SettingsRow
              icon={<Eye size={16} color={Colors.accent} strokeWidth={1.6} />}
              label={t("settings.privacy.showCollection")}
              type="toggle"
              value={showCollection}
              onToggle={toggleShowCollection}
              disabled={!publicProfile}
            />
            <SettingsRow
              icon={<Eye size={16} color={Colors.accent} strokeWidth={1.6} />}
              label={t("settings.privacy.showWishlist")}
              type="toggle"
              value={showWishlist}
              onToggle={toggleShowWishlist}
              disabled={!publicProfile}
              showSeparator={false}
            />
          </SettingsSection>

          {/* ── Langue ── */}
          <SettingsSection title={t("settings.sections.language")}>
            <SettingsRow
              icon={
                <Languages
                  size={16}
                  color={Colors.textMuted}
                  strokeWidth={1.6}
                />
              }
              label={t("settings.sections.language")}
              type="navigate"
              valueLabel={t(`settings.language.${locale}` as any)}
              onPress={handleLanguage}
              showSeparator={false}
            />
          </SettingsSection>

          {/* ── Données ── */}
          <SettingsSection title={t("settings.sections.data")}>
            <SettingsRow
              icon={
                <Smartphone
                  size={16}
                  color={Colors.textMuted}
                  strokeWidth={1.6}
                />
              }
              label={t("settings.data.export")}
              sublabel={t("settings.data.exportHint")}
              type="navigate"
              onPress={exportData}
              showSeparator={false}
            />
          </SettingsSection>

          {/* ── À propos ── */}
          <SettingsSection title={t("settings.sections.about")}>
            <SettingsRow
              icon={
                <Info size={16} color={Colors.textMuted} strokeWidth={1.6} />
              }
              label={t("settings.about.version")}
              type="info"
              valueLabel="1.0.0"
            />
            <SettingsRow
              icon={
                <Lock size={16} color={Colors.textMuted} strokeWidth={1.6} />
              }
              label={t("settings.about.privacy")}
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
              label={t("settings.about.support")}
              type="navigate"
              onPress={handleSupport}
              showSeparator={false}
            />
          </SettingsSection>

          {/* ── Danger ── */}
          <SettingsSection title={t("settings.sections.danger")}>
            <SettingsRow
              icon={
                <LogOut size={16} color={Colors.danger} strokeWidth={1.6} />
              }
              label={t("settings.danger.logout")}
              type="action"
              onPress={logout}
              destructive
            />
            <SettingsRow
              icon={
                <Trash2 size={16} color={Colors.danger} strokeWidth={1.6} />
              }
              label={t("settings.danger.deleteAccount")}
              sublabel={t("settings.danger.deleteAccountHint")}
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
