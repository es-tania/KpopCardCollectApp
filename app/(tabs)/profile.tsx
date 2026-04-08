import { router } from "expo-router";
import {
  Grid3x3,
  LogOut,
  ShieldCheck,
  ShoppingBasket,
  Star,
  Users,
} from "lucide-react-native";
import React, { useCallback } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ProfileHeader,
  ProfileMenuRow,
  ProfileSectionTitle,
  ProfileStats,
} from "../../src/components/profile";
import { Colors } from "../../src/constants/colors";
import { MOCK_USER } from "../../src/data/mockUser";

export default function ProfileScreen() {
  const user = MOCK_USER;

  const stats = [
    { label: "Photocards", value: 130, color: Colors.accent },
    { label: "Favoris", value: 28, color: "#DAA520" },
    { label: "Souhaits", value: 54, color: Colors.accent },
    { label: "Groupes", value: 2 },
  ];

  const handlePressSettings = useCallback(() => {
    // TODO: naviguer vers les paramètres
    Alert.alert("Paramètres", "À venir");
  }, []);

  const handlePressAvatar = useCallback(() => {
    // TODO: changer l'avatar
    Alert.alert("Avatar", "Changer la photo de profil");
  }, []);

  const handleLogout = useCallback(() => {
    Alert.alert("Déconnexion", "Es-tu sûre de vouloir te déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnecter",
        style: "destructive",
        onPress: () => {
          // TODO: appel API logout + navigation vers login
          console.log("logout");
        },
      },
    ]);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <ProfileHeader
          user={user}
          onPressSettings={handlePressSettings}
          onPressAvatar={handlePressAvatar}
        />

        {/* ── Stats ── */}
        <ProfileStats stats={stats} />

        {/* ── Ma Collection ── */}
        <ProfileSectionTitle title="Ma collection" />
        <ProfileMenuRow
          icon={<Users size={17} color={Colors.accent} strokeWidth={1.6} />}
          label="Mes groupes"
          sublabel="P1Harmony, Stray Kids"
          badge={2}
          onPress={() => router.push("/my-groups")}
        />
        <ProfileMenuRow
          icon={<Grid3x3 size={17} color={Colors.accent} strokeWidth={1.6} />}
          label="Toutes mes photocards"
          badge={130}
          onPress={() => router.push("/my-cards")}
        />

        {/* ── Listes ── */}
        <ProfileSectionTitle title="Mes listes" />
        <ProfileMenuRow
          icon={<Star size={17} color="#DAA520" strokeWidth={1.6} />}
          label="Favoris"
          badge={28}
          onPress={() => router.push("/my-cards?mode=favorites")}
        />
        <ProfileMenuRow
          icon={
            <ShoppingBasket size={17} color={Colors.accent} strokeWidth={1.6} />
          }
          label="Liste de souhaits"
          badge={54}
          onPress={() => router.push("/my-cards?mode=wishlist")}
        />
        {/* <ProfileMenuRow
          icon={<List size={17} color={Colors.textMuted} strokeWidth={1.6} />}
          label="À trader"
          badge={12}
          onPress={() => console.log("a trader")}
        />
        <ProfileMenuRow
          icon={<List size={17} color={Colors.textMuted} strokeWidth={1.6} />}
          label="Doubles"
          badge={7}
          onPress={() => console.log("doubles")}
        /> */}

        {/* ── Compte ── */}
        <ProfileSectionTitle title="Compte" />
        {user.role === "admin" && (
          <ProfileMenuRow
            icon={
              <ShieldCheck size={17} color={Colors.accent} strokeWidth={1.6} />
            }
            label="Administration"
            sublabel="Gérer les cartes et soumissions"
            onPress={() => router.push("/admin")}
          />
        )}
        <ProfileMenuRow
          icon={<LogOut size={17} color={Colors.danger} strokeWidth={1.6} />}
          label="Déconnexion"
          onPress={handleLogout}
          destructive
        />

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flex: 1,
  },
  bottomPad: {
    height: 40,
  },
});
