import {
    SettingsAvatarEditor,
    SettingsRow,
    SettingsSection,
} from "@/src/components/settings";
import { MOCK_USER } from "@/src/data/mockUser";
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
    Moon,
    Shield,
    Smartphone,
    Trash2,
    User,
} from "lucide-react-native";
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
import { Colors } from "../src/constants/colors";
import { Theme } from "../src/constants/theme";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const user = MOCK_USER;

  // ── États toggles ─────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState(true);
  const [submissionNotifs, setSubmissionNotifs] = useState(true);
  const [collectionNotifs, setCollectionNotifs] = useState(false);
  const [publicProfile, setPublicProfile] = useState(false);
  const [showCollection, setShowCollection] = useState(true);
  const [showWishlist, setShowWishlist] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChangeAvatar = () => {
    Alert.alert("Photo de profil", "Choisir une option", [
      { text: "Depuis la galerie", onPress: () => console.log("galerie") },
      { text: "Prendre une photo", onPress: () => console.log("camera") },
      {
        text: "Supprimer la photo",
        style: "destructive",
        onPress: () => console.log("delete"),
      },
      { text: "Annuler", style: "cancel" },
    ]);
  };

  const handleChangeUsername = () => {
    Alert.alert("Changer le pseudo", "Fonctionnalité à venir");
    // TODO: navigation vers un écran dédié
  };

  const handleChangeEmail = () => {
    Alert.alert("Changer l'email", "Fonctionnalité à venir");
  };

  const handleChangePassword = () => {
    Alert.alert("Changer le mot de passe", "Fonctionnalité à venir");
  };

  const handleLanguage = () => {
    Alert.alert("Langue", "Choisir une langue", [
      { text: "Français 🇫🇷", onPress: () => console.log("fr") },
      { text: "English 🇬🇧", onPress: () => console.log("en") },
      { text: "한국어 🇰🇷", onPress: () => console.log("kr") },
      { text: "Annuler", style: "cancel" },
    ]);
  };

  const handleExportData = () => {
    Alert.alert(
      "Exporter mes données",
      "Tu recevras un fichier JSON avec toutes tes données par email.",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Exporter", onPress: () => console.log("export") },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Supprimer le compte",
      "Cette action est irréversible. Toutes tes données seront définitivement supprimées.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer définitivement",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Confirmation finale",
              "Es-tu vraiment sûre ? Cette action ne peut pas être annulée.",
              [
                { text: "Annuler", style: "cancel" },
                {
                  text: "Oui, supprimer",
                  style: "destructive",
                  onPress: () => console.log("delete account"),
                },
              ],
            );
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Es-tu sûre de vouloir te déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnecter",
        style: "destructive",
        onPress: () => {
          // TODO: Zustand store reset + navigation
          console.log("logout");
        },
      },
    ]);
  };

  const handleSupport = () => {
    Alert.alert("Support", "support@kardvault.app");
  };

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

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Avatar ── */}
        <SettingsAvatarEditor user={user} onPressAvatar={handleChangeAvatar} />

        {/* ── Compte ── */}
        <SettingsSection title="Compte">
          <SettingsRow
            icon={<User size={16} color={Colors.accent} strokeWidth={1.6} />}
            label="Pseudo"
            type="navigate"
            valueLabel={user.username}
            onPress={handleChangeUsername}
          />
          <SettingsRow
            icon={<Mail size={16} color={Colors.accent} strokeWidth={1.6} />}
            label="Email"
            type="navigate"
            valueLabel={user.email}
            onPress={handleChangeEmail}
          />
          <SettingsRow
            icon={
              <KeyRound size={16} color={Colors.accent} strokeWidth={1.6} />
            }
            label="Mot de passe"
            type="navigate"
            onPress={handleChangePassword}
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
            onToggle={setNotifications}
          />
          <SettingsRow
            icon={<Shield size={16} color="#DAA520" strokeWidth={1.6} />}
            label="Soumissions validées"
            sublabel="Reçois une notif quand ta carte est approuvée"
            type="toggle"
            value={submissionNotifs}
            onToggle={setSubmissionNotifs}
            disabled={!notifications}
          />
          <SettingsRow
            icon={<Heart size={16} color="#DAA520" strokeWidth={1.6} />}
            label="Nouveautés collection"
            sublabel="Nouvelles cartes pour tes groupes suivis"
            type="toggle"
            value={collectionNotifs}
            onToggle={setCollectionNotifs}
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
            onToggle={setPublicProfile}
          />
          <SettingsRow
            icon={<Eye size={16} color={Colors.accent} strokeWidth={1.6} />}
            label="Afficher ma collection"
            type="toggle"
            value={showCollection}
            onToggle={setShowCollection}
            disabled={!publicProfile}
          />
          <SettingsRow
            icon={<Eye size={16} color={Colors.accent} strokeWidth={1.6} />}
            label="Afficher ma wishlist"
            type="toggle"
            value={showWishlist}
            onToggle={setShowWishlist}
            disabled={!publicProfile}
            showSeparator={false}
          />
        </SettingsSection>

        {/* ── Apparence ── */}
        <SettingsSection title="Apparence & Langue">
          <SettingsRow
            icon={<Moon size={16} color={Colors.textMuted} strokeWidth={1.6} />}
            label="Thème"
            type="info"
            valueLabel="Sombre"
          />
          <SettingsRow
            icon={
              <Languages size={16} color={Colors.textMuted} strokeWidth={1.6} />
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
            sublabel="Reçois toutes tes données au format JSON"
            type="navigate"
            onPress={handleExportData}
            showSeparator={false}
          />
        </SettingsSection>

        {/* ── À propos ── */}
        <SettingsSection title="À propos">
          <SettingsRow
            icon={<Info size={16} color={Colors.textMuted} strokeWidth={1.6} />}
            label="Version"
            type="info"
            valueLabel="1.0.0"
          />
          <SettingsRow
            icon={<Lock size={16} color={Colors.textMuted} strokeWidth={1.6} />}
            label="Politique de confidentialité"
            type="navigate"
            onPress={() => console.log("privacy")}
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

        {/* ── Danger zone ── */}
        <SettingsSection title="Danger">
          <SettingsRow
            icon={<LogOut size={16} color={Colors.danger} strokeWidth={1.6} />}
            label="Déconnexion"
            type="action"
            onPress={handleLogout}
            destructive
          />
          <SettingsRow
            icon={<Trash2 size={16} color={Colors.danger} strokeWidth={1.6} />}
            label="Supprimer mon compte"
            sublabel="Action irréversible"
            type="action"
            onPress={handleDeleteAccount}
            destructive
            showSeparator={false}
          />
        </SettingsSection>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  bottomPad: { height: 40 },
});
