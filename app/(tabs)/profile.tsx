import { useFollowedGroups } from "@/src/hooks/useFollowedGroups";
import { supabase } from "@/src/lib/supabase";
import { storageService } from "@/src/services";
import { buildStoragePath } from "@/src/services/storageService";
import { useAuthStore } from "@/src/store/authStore";
import { useCollectionStore } from "@/src/store/collectionStore";
import { User } from "@/src/types";
import { router } from "expo-router";
import {
  Grid3x3,
  LogOut,
  Plus,
  ShieldCheck,
  ShoppingBasket,
  Star,
  Users,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ProfileHeader,
  ProfileMenuRow,
  ProfileSectionTitle,
  ProfileStats,
} from "../../src/components/profile";
import { Colors } from "../../src/constants/colors";

export default function ProfileScreen() {
  const { user: authUser, isAdmin, signOut } = useAuthStore();
  const { followedGroups } = useFollowedGroups();
  const {
    collectionIds,
    favoriteIds,
    wishlistIds,
    loading: collectionLoading,
  } = useCollectionStore();

  // ── Profil utilisateur depuis Supabase ────────────────────────────────
  const [profile, setProfile] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!authUser) return;

    supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setProfile({
            id: data.id,
            username: data.username,
            email: authUser.email ?? "",
            role: data.role,
            avatarUrl: data.avatar_url ?? undefined,
            createdAt: data.created_at,
          });
        }
        setProfileLoading(false);
      });
  }, [authUser]);

  const stats = [
    {
      label: "Photocards",
      value: collectionIds.size,
      color: Colors.accent,
    },
    {
      label: "Favoris",
      value: favoriteIds.size,
      color: "#DAA520",
    },
    {
      label: "Souhaits",
      value: wishlistIds.size,
      color: Colors.accent,
    },
    {
      label: "Groupes",
      value: followedGroups.length,
      color: Colors.textMuted,
    },
  ];
  const handlePressSettings = useCallback(() => {
    router.push("/settings");
  }, []);

  const handlePressAvatar = useCallback(() => {
    Alert.alert("Photo de profil", "Choisir une option", [
      {
        text: "Depuis la galerie",
        onPress: async () => {
          if (!authUser) return;
          try {
            const url = await storageService.pickAndUpload(
              "avatars",
              buildStoragePath.avatar(authUser.id),
              { aspectRatio: [1, 1] },
            );
            if (!url) return;

            // Met à jour en BDD
            await supabase
              .from("profiles")
              .update({ avatar_url: url })
              .eq("id", authUser.id);

            // Met à jour le state local
            setProfile((prev) => (prev ? { ...prev, avatarUrl: url } : prev));
          } catch (err: any) {
            Alert.alert("Erreur", err.message);
          }
        },
      },
      {
        text: "Supprimer la photo",
        style: "destructive",
        onPress: async () => {
          if (!authUser || !profile?.avatarUrl) return;
          try {
            // Supprime du bucket
            await storageService.deleteFromUrl("avatars", profile.avatarUrl);

            // Met à jour en BDD
            await supabase
              .from("profiles")
              .update({ avatar_url: null })
              .eq("id", authUser.id);

            setProfile((prev) =>
              prev ? { ...prev, avatarUrl: undefined } : prev,
            );
          } catch (err: any) {
            Alert.alert("Erreur", err.message);
          }
        },
      },
      { text: "Annuler", style: "cancel" },
    ]);
  }, [authUser, profile]);

  const handleLogout = useCallback(() => {
    Alert.alert("Déconnexion", "Es-tu sûre de vouloir te déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnecter",
        style: "destructive",
        onPress: async () => {
          await signOut();
          useCollectionStore.getState().reset();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }, [signOut]);

  if (profileLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) return null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <ProfileHeader
          user={profile}
          onPressSettings={handlePressSettings}
          onPressAvatar={handlePressAvatar}
        />

        {/* ── Stats ── */}
        <ProfileStats stats={stats} loading={collectionLoading} />

        {/* ── Ma Collection ── */}
        <ProfileSectionTitle title="Ma collection" />
        <ProfileMenuRow
          icon={<Users size={17} color={Colors.accent} strokeWidth={1.6} />}
          label="Mes groupes"
          badge={followedGroups.length}
          onPress={() => router.push("/my-groups")}
        />
        <ProfileMenuRow
          icon={<Grid3x3 size={17} color={Colors.accent} strokeWidth={1.6} />}
          label="Toutes mes photocards"
          badge={collectionIds.size}
          onPress={() => router.push("/my-cards")}
        />
        {/* <ProfileMenuRow
          icon={<Download size={17} color={Colors.accent} strokeWidth={1.6} />}
          label="Exporter une wishlist"
          onPress={() => router.push("/export?mode=wishlist")}
        /> */}

        {/* ── Listes ── */}
        <ProfileSectionTitle title="Mes listes" />
        <ProfileMenuRow
          icon={<Star size={17} color="#DAA520" strokeWidth={1.6} />}
          label="Favoris"
          badge={favoriteIds.size}
          onPress={() => router.push("/my-cards?mode=favorites")}
        />
        <ProfileMenuRow
          icon={
            <ShoppingBasket size={17} color={Colors.accent} strokeWidth={1.6} />
          }
          label="Liste de souhaits"
          badge={wishlistIds.size}
          onPress={() => router.push("/my-cards?mode=wishlist")}
        />

        <ProfileSectionTitle title="Contribuer" />
        <ProfileMenuRow
          icon={<Plus size={17} color={Colors.accent2} strokeWidth={1.6} />}
          label="Proposer une photocard"
          sublabel="Soumise à validation par un admin"
          onPress={() =>
            router.push("/admin/add-photocard?userSubmission=true")
          }
        />
        <ProfileMenuRow
          icon={<Grid3x3 size={17} color={Colors.accent2} strokeWidth={1.6} />}
          label="Mes soumissions"
          sublabel="Voir le statut de tes propositions"
          onPress={() => router.push("/my-submissions")}
        />

        {/* ── Compte ── */}
        <ProfileSectionTitle title="Compte" />
        {isAdmin && (
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
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
  },
  bottomPad: {
    height: 40,
  },
});
