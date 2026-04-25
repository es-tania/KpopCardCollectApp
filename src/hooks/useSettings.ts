import { supabase } from "@/src/lib/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

export function useSettings() {
  const { user, signOut } = useAuthStore();

  // ── Profil ──────────────────────────────────────────────────────────────
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Préférences ─────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState(true);
  const [submissionNotifs, setSubmissionNotifs] = useState(true);
  const [collectionNotifs, setCollectionNotifs] = useState(false);
  const [publicProfile, setPublicProfile] = useState(false);
  const [showCollection, setShowCollection] = useState(true);
  const [showWishlist, setShowWishlist] = useState(false);

  // ── Chargement initial ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    setEmail(user.email ?? "");

    const load = async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select(
            "username, avatar_url, notifications_enabled, submission_notifs, collection_notifs, public_profile, show_collection, show_wishlist",
          )
          .eq("id", user.id)
          .single();

        if (!data) return;
        setUsername(data.username ?? "");
        setAvatarUrl(data.avatar_url ?? null);
        setNotifications(data.notifications_enabled ?? true);
        setSubmissionNotifs(data.submission_notifs ?? true);
        setCollectionNotifs(data.collection_notifs ?? false);
        setPublicProfile(data.public_profile ?? false);
        setShowCollection(data.show_collection ?? true);
        setShowWishlist(data.show_wishlist ?? false);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  // ── Sauvegarde une préférence ───────────────────────────────────────────
  const savePref = useCallback(
    async (key: string, value: boolean) => {
      if (!user) return;
      const { error } = await supabase
        .from("profiles")
        .update({ [key]: value })
        .eq("id", user.id);
      if (error) Alert.alert("Erreur", error.message);
    },
    [user],
  );

  // ── Toggles ─────────────────────────────────────────────────────────────
  const toggleNotifications = useCallback(
    (v: boolean) => { setNotifications(v); savePref("notifications_enabled", v); },
    [savePref],
  );
  const toggleSubmissionNotifs = useCallback(
    (v: boolean) => { setSubmissionNotifs(v); savePref("submission_notifs", v); },
    [savePref],
  );
  const toggleCollectionNotifs = useCallback(
    (v: boolean) => { setCollectionNotifs(v); savePref("collection_notifs", v); },
    [savePref],
  );
  const togglePublicProfile = useCallback(
    (v: boolean) => { setPublicProfile(v); savePref("public_profile", v); },
    [savePref],
  );
  const toggleShowCollection = useCallback(
    (v: boolean) => { setShowCollection(v); savePref("show_collection", v); },
    [savePref],
  );
  const toggleShowWishlist = useCallback(
    (v: boolean) => { setShowWishlist(v); savePref("show_wishlist", v); },
    [savePref],
  );

  // ── Avatar ──────────────────────────────────────────────────────────────
  const changeAvatar = useCallback(() => {
    Alert.alert("Photo de profil", "Choisir une option", [
      {
        text: "Depuis la galerie",
        onPress: async () => {
          const { pickLocalImage } = await import("@/src/utils/pickLocalImage");
          const { storageService, buildStoragePath } = await import(
            "@/src/services/storageService"
          );
          pickLocalImage(async (uri) => {
            if (!user) return;
            try {
              const url = await storageService.uploadImage(
                "avatars",
                buildStoragePath.avatar(user.id),
                uri,
              );
              await supabase
                .from("profiles")
                .update({ avatar_url: url })
                .eq("id", user.id);
              setAvatarUrl(url);
            } catch (err: any) {
              Alert.alert("Erreur", err.message);
            }
          });
        },
      },
      {
        text: "Supprimer la photo",
        style: "destructive",
        onPress: async () => {
          if (!user) return;
          await supabase
            .from("profiles")
            .update({ avatar_url: null })
            .eq("id", user.id);
          setAvatarUrl(null);
        },
      },
      { text: "Annuler", style: "cancel" },
    ]);
  }, [user]);

  // ── Navigation ──────────────────────────────────────────────────────────
  const changeUsername = useCallback(() => router.push("/account/change-username"), []);
  const changeEmail = useCallback(() => router.push("/account/change-email"), []);
  const changePassword = useCallback(() => router.push("/account/change-password"), []);

  // ── Export ──────────────────────────────────────────────────────────────
  const exportData = useCallback(() => {
    Alert.alert("Exporter mes données", "Tes données de collection seront exportées.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Exporter",
        onPress: async () => {
          if (!user) return;
          try {
            const [collection, favorites, wishlist] = await Promise.all([
              supabase.from("user_collection").select("*").eq("user_id", user.id),
              supabase.from("user_favorites").select("*").eq("user_id", user.id),
              supabase.from("user_wishlist").select("*").eq("user_id", user.id),
            ]);
            console.log(
              "Export:",
              JSON.stringify(
                { collection: collection.data ?? [], favorites: favorites.data ?? [], wishlist: wishlist.data ?? [] },
                null,
                2,
              ),
            );
            Alert.alert("✅ Export prêt", "Les données sont dans la console.");
          } catch (err: any) {
            Alert.alert("Erreur", err.message);
          }
        },
      },
    ]);
  }, [user]);

  // ── Suppression compte ──────────────────────────────────────────────────
  const deleteAccount = useCallback(() => {
    Alert.alert("Supprimer le compte", "Cette action est irréversible.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer définitivement",
        style: "destructive",
        onPress: () =>
          Alert.alert("Confirmation finale", "Toutes tes données seront supprimées.", [
            { text: "Annuler", style: "cancel" },
            {
              text: "Oui, supprimer",
              style: "destructive",
              onPress: async () => {
                try {
                  await supabase.functions.invoke("delete-account", { body: { user_id: user?.id } });
                  await signOut();
                  router.replace("/(auth)/login");
                } catch (err: any) {
                  Alert.alert("Erreur", err.message);
                }
              },
            },
          ]),
      },
    ]);
  }, [user, signOut]);

  // ── Déconnexion ─────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    Alert.alert("Déconnexion", "Es-tu sûre de vouloir te déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Se déconnecter",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }, [signOut]);

  // ── Return groupé ───────────────────────────────────────────────────────
  return {
    profile: { user, username, email, avatarUrl, loading },
    prefs: { notifications, submissionNotifs, collectionNotifs, publicProfile, showCollection, showWishlist },
    handlers: {
      toggleNotifications, toggleSubmissionNotifs, toggleCollectionNotifs,
      togglePublicProfile, toggleShowCollection, toggleShowWishlist,
      changeAvatar, changeUsername, changeEmail, changePassword,
      exportData, deleteAccount, logout,
    },
  };
}
