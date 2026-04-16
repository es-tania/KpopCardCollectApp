import { useGroups } from "@/src/hooks/group/useGroups";
import { supabase } from "@/src/lib/supabase";
import { router } from "expo-router";
import { ChevronLeft, Plus, Trash2, UserCheck } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../src/constants/colors";
import { Theme } from "../../src/constants/theme";

interface GroupAdmin {
  id: string;
  userId: string;
  groupId: string;
  username: string;
  groupName: string;
}

export default function GroupAdminsScreen() {
  const { groups } = useGroups();
  const [admins, setAdmins] = useState<GroupAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [groupId, setGroupId] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      // ── 1. Récupère les group_admins ──────────────────────────────────
      const { data: adminsData, error } = await supabase.from("group_admins")
        .select(`
        id,
        user_id,
        group_id,
        groups ( name )
      `);

      if (error) throw error;

      // ── 2. Récupère les profils séparément ────────────────────────────
      const userIds = [...new Set((adminsData ?? []).map((d) => d.user_id))];

      let profileMap: Record<string, string> = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);

        (profiles ?? []).forEach((p) => {
          profileMap[p.id] = p.username ?? "Inconnu";
        });
      }

      // ── 3. Fusionne ───────────────────────────────────────────────────
      setAdmins(
        (adminsData ?? []).map((d: any) => ({
          id: d.id,
          userId: d.user_id,
          groupId: d.group_id,
          username: profileMap[d.user_id] ?? "Inconnu",
          groupName: d.groups?.name ?? "Inconnu",
        })),
      );
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleAdd = useCallback(async () => {
    if (!username.trim() || !groupId) {
      Alert.alert("Erreur", "Remplis le nom d'utilisateur et le groupe.");
      return;
    }
    setAdding(true);
    try {
      // Trouve l'utilisateur par username
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("username", username.trim())
        .single();

      if (profileError || !profile) {
        Alert.alert("Erreur", `Utilisateur "${username}" introuvable.`);
        return;
      }

      const { error } = await supabase
        .from("group_admins")
        .insert({ user_id: profile.id, group_id: groupId });

      if (error) {
        if (error.code === "23505") {
          Alert.alert("Déjà admin", `${username} est déjà admin de ce groupe.`);
        } else {
          throw error;
        }
        return;
      }

      setUsername("");
      setGroupId("");
      await fetchAdmins();
      Alert.alert(
        "✅ Ajouté",
        `${username} est maintenant admin de ce groupe.`,
      );
    } catch (err: any) {
      Alert.alert("Erreur", err.message);
    } finally {
      setAdding(false);
    }
  }, [username, groupId, fetchAdmins]);

  const handleRemove = useCallback(
    (admin: GroupAdmin) => {
      Alert.alert(
        "Retirer l'admin",
        `Retirer ${admin.username} comme admin de ${admin.groupName} ?`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Retirer",
            style: "destructive",
            onPress: async () => {
              await supabase.from("group_admins").delete().eq("id", admin.id);
              await fetchAdmins();
            },
          },
        ],
      );
    },
    [fetchAdmins],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Admins par groupe</Text>
        <View style={styles.navBtn} />
      </View>

      {/* ── Formulaire d'ajout ── */}
      <View style={styles.form}>
        <Text style={styles.formTitle}>Ajouter un admin</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom d'utilisateur"
          placeholderTextColor={Colors.textMuted}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        {/* Sélecteur de groupe */}
        <View style={styles.groupPicker}>
          {groups.map((g) => (
            <TouchableOpacity
              key={g.id}
              style={[
                styles.groupChip,
                groupId === g.id && styles.groupChipActive,
              ]}
              onPress={() => setGroupId(g.id)}
            >
              <Text
                style={[
                  styles.groupChipText,
                  groupId === g.id && styles.groupChipTextActive,
                ]}
              >
                {g.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleAdd}
          disabled={adding}
        >
          {adding ? (
            <ActivityIndicator size="small" color={Colors.bg} />
          ) : (
            <>
              <Plus size={16} color={Colors.bg} strokeWidth={2} />
              <Text style={styles.addBtnText}>Ajouter</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Liste des admins ── */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      ) : (
        <FlatList
          data={admins}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <UserCheck size={18} color={Colors.accent} strokeWidth={1.6} />
              </View>
              <View style={styles.info}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.groupName}>{item.groupName}</Text>
              </View>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => handleRemove(item)}
              >
                <Trash2 size={16} color={Colors.danger} strokeWidth={1.6} />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aucun admin de groupe</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
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
  },
  form: {
    padding: Theme.spacing.lg,
    gap: Theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  formTitle: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.surface2,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm + 2,
    fontSize: Theme.fontSize.base,
    color: Colors.text,
  },
  groupPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  groupChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
  },
  groupChipActive: {
    backgroundColor: Colors.pillActive,
    borderColor: Colors.borderActive,
  },
  groupChipText: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  groupChipTextActive: {
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.accent,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.md,
  },
  addBtnText: {
    fontSize: Theme.fontSize.base,
    color: Colors.bg,
    fontWeight: Theme.fontWeight.medium,
  },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.pillActive,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1 },
  username: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
  },
  groupName: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  removeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.borderRadius.full,
    backgroundColor: "rgba(240,112,112,0.1)",
    borderWidth: 0.5,
    borderColor: "rgba(240,112,112,0.3)",
  },
  empty: { padding: Theme.spacing.xl, alignItems: "center" },
  emptyText: { fontSize: Theme.fontSize.base, color: Colors.textMuted },
});
